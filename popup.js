const REFRESH_MESSAGE = "CF_FRIEND_SOLVES_REFRESH";

const DEFAULT_SETTINGS = {
  autoCheck: true,
  useCodeforcesFriends: true,
  manualFallback: false,
  friendHandles: [],
  scanCount: 50
};

const elements = {
  autoCheck: document.getElementById("autoCheck"),
  useCodeforcesFriends: document.getElementById("useCodeforcesFriends"),
  manualFallback: document.getElementById("manualFallback"),
  friendHandles: document.getElementById("friendHandles"),
  scanCount: document.getElementById("scanCount"),
  saveSettings: document.getElementById("saveSettings"),
  saveStatus: document.getElementById("saveStatus"),
  refreshActive: document.getElementById("refreshActive"),
  apiKey: document.getElementById("apiKey"),
  apiSecret: document.getElementById("apiSecret"),
  rememberApi: document.getElementById("rememberApi"),
  importFriends: document.getElementById("importFriends"),
  apiStatus: document.getElementById("apiStatus")
};

function normalizeHandles(value) {
  const raw = Array.isArray(value) ? value.join("\n") : String(value || "");
  const seen = new Set();
  return raw
    .split(/[\s,;]+/)
    .map((handle) => handle.trim())
    .filter(Boolean)
    .filter((handle) => {
      const key = handle.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function getSyncStorage(defaults) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaults, resolve);
  });
}

function setSyncStorage(values) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(values, resolve);
  });
}

function getLocalStorage(defaults) {
  return new Promise((resolve) => {
    chrome.storage.local.get(defaults, resolve);
  });
}

function setLocalStorage(values) {
  return new Promise((resolve) => {
    chrome.storage.local.set(values, resolve);
  });
}

function setStatus(element, text, tone = "") {
  element.textContent = text;
  element.dataset.tone = tone;
}

function readSettingsFromForm() {
  return {
    autoCheck: elements.autoCheck.checked,
    useCodeforcesFriends: elements.useCodeforcesFriends.checked,
    manualFallback: elements.manualFallback.checked,
    friendHandles: normalizeHandles(elements.friendHandles.value),
    scanCount: Math.max(1, Math.min(500, Number(elements.scanCount.value) || DEFAULT_SETTINGS.scanCount))
  };
}

function writeSettingsToForm(settings) {
  elements.autoCheck.checked = Boolean(settings.autoCheck);
  elements.useCodeforcesFriends.checked = Boolean(settings.useCodeforcesFriends);
  elements.manualFallback.checked = Boolean(settings.manualFallback);
  elements.friendHandles.value = normalizeHandles(settings.friendHandles).join("\n");
  elements.scanCount.value = String(settings.scanCount || DEFAULT_SETTINGS.scanCount);
}

async function saveSettings() {
  const settings = readSettingsFromForm();
  await setSyncStorage(settings);
  writeSettingsToForm(settings);
  setStatus(elements.saveStatus, `Saved ${settings.friendHandles.length} handle${settings.friendHandles.length === 1 ? "" : "s"}.`, "good");
}

async function refreshActiveTab() {
  setStatus(elements.saveStatus, "Refreshing current Codeforces tab...");
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab || typeof tab.id !== "number") {
    setStatus(elements.saveStatus, "No active tab found.", "bad");
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type: REFRESH_MESSAGE });
    window.close();
  } catch (error) {
    setStatus(elements.saveStatus, "Open a Codeforces problem page first.", "bad");
  }
}

function randomSixChars() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) {
    result += alphabet[byte % alphabet.length];
  }
  return result;
}

async function sha512Hex(value) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-512", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function buildSortedQuery(params) {
  return Object.entries(params)
    .sort(([aKey, aValue], [bKey, bValue]) => {
      if (aKey === bKey) {
        return String(aValue).localeCompare(String(bValue));
      }
      return aKey.localeCompare(bKey);
    })
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

async function buildSignedCodeforcesUrl(methodName, apiKey, apiSecret, extraParams = {}) {
  const params = {
    ...extraParams,
    apiKey,
    time: String(Math.floor(Date.now() / 1000))
  };
  const query = buildSortedQuery(params);
  const rand = randomSixChars();
  const hash = await sha512Hex(`${rand}/${methodName}?${query}#${apiSecret}`);
  return `https://codeforces.com/api/${methodName}?${query}&apiSig=${rand}${hash}`;
}

async function importFriends() {
  const apiKey = elements.apiKey.value.trim();
  const apiSecret = elements.apiSecret.value.trim();

  if (!apiKey || !apiSecret) {
    setStatus(elements.apiStatus, "Enter both API key and secret.", "bad");
    return;
  }

  elements.importFriends.disabled = true;
  setStatus(elements.apiStatus, "Importing friends...");

  try {
    const url = await buildSignedCodeforcesUrl("user.friends", apiKey, apiSecret, { onlyOnline: "false" });
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Codeforces returned ${response.status}`);
    }

    const payload = await response.json();
    if (payload.status !== "OK") {
      throw new Error(payload.comment || "Codeforces API failed");
    }

    const handles = normalizeHandles(payload.result || []);
    elements.friendHandles.value = handles.join("\n");
    elements.manualFallback.checked = true;
    await saveSettings();

    if (elements.rememberApi.checked) {
      await setLocalStorage({ apiKey, apiSecret });
    } else {
      await setLocalStorage({ apiKey: "", apiSecret: "" });
    }

    setStatus(elements.apiStatus, `Imported ${handles.length} friend${handles.length === 1 ? "" : "s"}.`, "good");
  } catch (error) {
    setStatus(elements.apiStatus, error.message || "Could not import friends.", "bad");
  } finally {
    elements.importFriends.disabled = false;
  }
}

async function init() {
  const settings = await getSyncStorage(DEFAULT_SETTINGS);
  writeSettingsToForm(settings);

  const credentials = await getLocalStorage({ apiKey: "", apiSecret: "" });
  elements.apiKey.value = credentials.apiKey || "";
  elements.apiSecret.value = credentials.apiSecret || "";
  elements.rememberApi.checked = Boolean(credentials.apiKey && credentials.apiSecret);

  elements.saveSettings.addEventListener("click", saveSettings);
  elements.refreshActive.addEventListener("click", refreshActiveTab);
  elements.importFriends.addEventListener("click", importFriends);
}

init();
