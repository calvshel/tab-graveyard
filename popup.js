const STORAGE_KEY = "buriedTabs";

async function loadGraveyard() {
  const result = await chrome.storage.local.get([STORAGE_KEY]);
  return Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
}

async function exportGraveyard() {
  const entries = await loadGraveyard();
  const markdown = TabGraveyard.buildMarkdown(entries);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "graveyard.md";
  anchor.click();
  URL.revokeObjectURL(url);
  await chrome.storage.local.set({ [STORAGE_KEY]: [], tabLastActive: {} });
}

async function refreshCount() {
  const entries = await loadGraveyard();
  document.getElementById("count").textContent = String(entries.length);
}

function entryKey(entry) {
  return `${entry.buriedAt || ""}::${entry.url || ""}`;
}

function graveyardRow(entry) {
  const row = document.createElement("article");
  row.className = "row";

  const title = document.createElement("div");
  title.className = "row-title";
  title.textContent = entry.title || "Untitled Tab";

  const meta = document.createElement("div");
  meta.className = "row-meta";
  const domain = (() => {
    try {
      return new URL(entry.url).hostname.replace(/^www\./, "");
    } catch {
      return entry.url || "";
    }
  })();
  meta.textContent = `${domain} · ${entry.buriedAt || ""}`;

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Restore";
  button.addEventListener("click", async () => {
    const items = await loadGraveyard();
    const key = entryKey(entry);
    const itemIndex = items.findIndex((candidate) => entryKey(candidate) === key);
    if (itemIndex < 0) {
      return;
    }
    const item = items[itemIndex];
    await chrome.tabs.create({ url: item.url });
    items.splice(itemIndex, 1);
    await chrome.storage.local.set({ [STORAGE_KEY]: items });
    await refresh();
  });

  row.append(title, meta, button);
  return row;
}

async function renderGraveyardList() {
  const list = document.getElementById("list");
  list.textContent = "";
  const entries = await loadGraveyard();
  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nothing buried right now.";
    list.append(empty);
    return;
  }
  entries.forEach((entry, index) => {
    list.append(graveyardRow(entry));
  });
}

async function refresh() {
  await refreshCount();
  await renderGraveyardList();
}

document.getElementById("exhume").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "Exhuming archive...";
  try {
    await exportGraveyard();
    await refreshCount();
    status.textContent = "graveyard.md downloaded and storage cleared.";
  } catch (error) {
    status.textContent = `Export failed: ${error.message}`;
  }
});

refresh();
