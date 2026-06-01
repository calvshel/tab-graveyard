const SETTINGS_KEY = "settings";
const DEFAULT_SETTINGS = {
  inactivityHours: 4,
  protectedDomains: [],
};

function normaliseSettings(settings) {
  const inactivityHours = Number(settings?.inactivityHours);
  const protectedDomains = Array.isArray(settings?.protectedDomains) ? settings.protectedDomains : [];
  return {
    inactivityHours: Number.isFinite(inactivityHours) ? Math.min(Math.max(inactivityHours, 0.25), 168) : DEFAULT_SETTINGS.inactivityHours,
    protectedDomains: protectedDomains
      .map((domain) => String(domain).trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 100),
  };
}

async function loadSettings() {
  const result = await chrome.storage.local.get([SETTINGS_KEY]);
  return normaliseSettings(result[SETTINGS_KEY]);
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ [SETTINGS_KEY]: normaliseSettings(settings) });
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
