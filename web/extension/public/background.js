const STORAGE_KEY = "digiPetReminderSettings";
const ALARM_NAME = "digiPetDailyCodingReminder";
const DEFAULT_SETTINGS = {
  enabled: false,
  time: "09:00",
  message: "Time for today's coding challenge!",
  lastShownDate: "",
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeReminderSettings(value) {
  const candidate = value && typeof value === "object" ? value : {};
  return {
    enabled: Boolean(candidate.enabled),
    time: typeof candidate.time === "string" && /^\d{2}:\d{2}$/.test(candidate.time)
      ? candidate.time
      : DEFAULT_SETTINGS.time,
    message: typeof candidate.message === "string" && candidate.message.trim()
      ? candidate.message.trim().slice(0, 140)
      : DEFAULT_SETTINGS.message,
    lastShownDate: typeof candidate.lastShownDate === "string" ? candidate.lastShownDate : "",
  };
}

function loadReminderSettings() {
  return chrome.storage.local.get({ [STORAGE_KEY]: DEFAULT_SETTINGS }).then((items) =>
    normalizeReminderSettings(items[STORAGE_KEY]),
  );
}

function saveReminderSettings(settings) {
  return chrome.storage.local.set({ [STORAGE_KEY]: normalizeReminderSettings(settings) });
}

function nextReminderTime(settings, now = new Date()) {
  const [hour, minute] = settings.time.split(":").map(Number);
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now || settings.lastShownDate === localDateKey(next)) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

async function scheduleReminder() {
  const settings = await loadReminderSettings();
  await chrome.alarms.clear(ALARM_NAME);
  if (!settings.enabled) return;

  await chrome.alarms.create(ALARM_NAME, {
    when: nextReminderTime(settings),
    periodInMinutes: 24 * 60,
  });
}

async function showReminder() {
  const settings = await loadReminderSettings();
  if (!settings.enabled) return;

  const today = localDateKey();
  if (settings.lastShownDate === today) return;

  await chrome.notifications.create(`digi-pet-reminder-${Date.now()}`, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon.svg"),
    title: "Digi-Pet coding challenge",
    message: settings.message,
    priority: 1,
  });

  await saveReminderSettings({ ...settings, lastShownDate: today });
  await scheduleReminder();
}

chrome.runtime.onInstalled.addListener(scheduleReminder);
chrome.runtime.onStartup.addListener(scheduleReminder);

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "DIGI_PET_REMINDER_SETTINGS_UPDATED") {
    scheduleReminder();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[STORAGE_KEY]) {
    scheduleReminder();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    showReminder();
  }
});

scheduleReminder();
