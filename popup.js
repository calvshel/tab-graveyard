const STORAGE_KEY = "buriedTabs";
const IMPORT_FILE_ID = "import-file";

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
  const filterValue = document.getElementById("filter").value.trim().toLowerCase();
  const filteredEntries = filterValue
    ? entries.filter((entry) => {
        try {
          return new URL(entry.url).hostname.toLowerCase().includes(filterValue);
        } catch {
          return String(entry.url || "").toLowerCase().includes(filterValue);
        }
      })
    : entries;
  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nothing buried right now.";
    list.append(empty);
    return;
  }
  if (filteredEntries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No buried tabs match that filter.";
    list.append(empty);
    return;
  }
  filteredEntries.forEach((entry) => {
    list.append(graveyardRow(entry));
  });
}

async function refresh() {
  await refreshCount();
  await renderGraveyardList();
}

async function importGraveyardFile(file) {
  const text = await file.text();
  const imported = TabGraveyard.parseMarkdown(text);
  if (imported.length === 0) {
    throw new Error("No graveyard rows found in that file.");
  }
  const items = await loadGraveyard();
  const seen = new Set(items.map((entry) => entryKey(entry)));
  for (const entry of imported) {
    const key = entryKey(entry);
    if (!seen.has(key)) {
      items.push(entry);
      seen.add(key);
    }
  }
  await chrome.storage.local.set({ [STORAGE_KEY]: items });
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

document.getElementById("import").addEventListener("click", () => {
  document.getElementById(IMPORT_FILE_ID).click();
});

document.getElementById(IMPORT_FILE_ID).addEventListener("change", async (event) => {
  const status = document.getElementById("status");
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }
  status.textContent = "Importing graveyard...";
  try {
    await importGraveyardFile(file);
    await refresh();
    status.textContent = "graveyard.md imported.";
  } catch (error) {
    status.textContent = `Import failed: ${error.message}`;
  } finally {
    event.target.value = "";
  }
});

document.getElementById("filter").addEventListener("input", async () => {
  await renderGraveyardList();
});

refresh();
