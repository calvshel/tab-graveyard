const ALARM_NAME = "tab-graveyard-sweep";
const STORAGE_KEY = "buriedTabs";
const LAST_ACTIVE_KEY = "tabLastActive";
const SETTINGS_KEY = "settings";
const DEFAULT_SETTINGS = {
  inactivityHours: 4,
  protectedDomains: [],
};

function now() {
  return Date.now();
}

async function getState() {
  const result = await chrome.storage.local.get([STORAGE_KEY, LAST_ACTIVE_KEY, SETTINGS_KEY]);
  return {
    buriedTabs: Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [],
    lastActive: result[LAST_ACTIVE_KEY] && typeof result[LAST_ACTIVE_KEY] === "object" ? result[LAST_ACTIVE_KEY] : {},
    settings: normaliseSettings(result[SETTINGS_KEY]),
  };
}

async function setState(nextState) {
  await chrome.storage.local.set({
    [STORAGE_KEY]: nextState.buriedTabs,
    [LAST_ACTIVE_KEY]: nextState.lastActive,
    [SETTINGS_KEY]: normaliseSettings(nextState.settings),
  });
}

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

function isProtectedUrl(url, protectedDomains) {
  if (!url) return true;
  if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return protectedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return true;
  }
}

async function markTabActive(tabId) {
  if (typeof tabId !== "number") return;
  const state = await getState();
  state.lastActive[String(tabId)] = now();
  await setState(state);
}

async function buryTab(tab) {
  if (!tab || typeof tab.id !== "number") return false;
  const state = await getState();
  if (tab.pinned || tab.active || isProtectedUrl(tab.url, state.settings.protectedDomains)) {
    return false;
  }

  const lastSeen = state.lastActive[String(tab.id)] || tab.lastAccessed || 0;
  const inactivityLimitMs = state.settings.inactivityHours * 60 * 60 * 1000;
  if (!lastSeen || now() - lastSeen < inactivityLimitMs) {
    return false;
  }

  state.buriedTabs.unshift({
    title: tab.title || "Untitled Tab",
    url: tab.url || "",
    buriedAt: new Date().toISOString(),
  });
  state.buriedTabs = state.buriedTabs.slice(0, 500);
  delete state.lastActive[String(tab.id)];
  await setState(state);
  await chrome.tabs.remove(tab.id);
  return true;
}

async function sweepTabs() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    await buryTab(tab);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.alarms.create(ALARM_NAME, { periodInMinutes: 15 });
  const tabs = await chrome.tabs.query({});
  const state = await getState();
  for (const tab of tabs) {
    if (typeof tab.id === "number") {
      state.lastActive[String(tab.id)] = tab.lastAccessed || now();
    }
  }
  await setState(state);
  await sweepTabs();
});

chrome.runtime.onStartup.addListener(async () => {
  await chrome.alarms.create(ALARM_NAME, { periodInMinutes: 15 });
  await sweepTabs();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await sweepTabs();
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await markTabActive(activeInfo.tabId);
});

chrome.tabs.onCreated.addListener(async (tab) => {
  await markTabActive(tab.id);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    await markTabActive(tabId);
    await buryTab(tab);
  }
});
