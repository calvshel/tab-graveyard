const SETTINGS_KEY = "settings";

async function loadSettings() {
  const result = await chrome.storage.local.get([SETTINGS_KEY]);
  return TabGraveyard.normaliseSettings(result[SETTINGS_KEY]);
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ [SETTINGS_KEY]: TabGraveyard.normaliseSettings(settings) });
}

async function render() {
  const settings = await loadSettings();
  document.getElementById("inactivity-hours").value = String(settings.inactivityHours);
  document.getElementById("protected-domains").value = settings.protectedDomains.join("\n");
}

document.getElementById("options-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("status");
  status.textContent = "Saving...";
  const settings = {
    inactivityHours: Number(document.getElementById("inactivity-hours").value),
    protectedDomains: document.getElementById("protected-domains").value.split(/\r?\n/),
  };
  await saveSettings(settings);
  status.textContent = "Options saved.";
});

render();
