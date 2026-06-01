const STORAGE_KEY = "buriedTabs";

async function loadGraveyard() {
  const result = await chrome.storage.local.get([STORAGE_KEY]);
  return Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
}

function markdownEscape(value) {
  return String(value || "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
}

function buildMarkdown(entries) {
  const lines = [
    "# Tab Graveyard",
    "",
    `Exported: ${new Date().toISOString()}`,
    "",
    "| Title | URL | Buried Timestamp |",
    "| --- | --- | --- |",
  ];

  for (const entry of entries) {
    lines.push(
      `| ${markdownEscape(entry.title)} | ${markdownEscape(entry.url)} | ${markdownEscape(entry.buriedAt)} |`
    );
  }

  if (entries.length === 0) {
    lines.push("| - | - | - |");
  }

  return lines.join("\n");
}

async function exportGraveyard() {
  const entries = await loadGraveyard();
  const markdown = buildMarkdown(entries);
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

refreshCount();
