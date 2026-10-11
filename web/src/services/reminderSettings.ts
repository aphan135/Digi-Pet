export interface ReminderSettings {
  enabled: boolean;
  time: string;
  message: string;
  lastShownDate?: string;
}

interface ChromeStorageArea {
  get: (
    keys: string | string[] | Record<string, unknown>,
    callback: (items: Record<string, unknown>) => void,
  ) => void;
  set: (items: Record<string, unknown>, callback?: () => void) => void;
}

interface ChromeLike {
  runtime?: {
    id?: string;
    lastError?: { message?: string };
    sendMessage?: (message: unknown) => void;
  };
  storage?: {
    local?: ChromeStorageArea;
  };
}

const STORAGE_KEY = "digiPetReminderSettings";

export const defaultReminderSettings: ReminderSettings = {
  enabled: false,
  time: "09:00",
  message: "Time for today's coding challenge!",
  lastShownDate: "",
};

function getChromeLike() {
  return (globalThis as typeof globalThis & { chrome?: ChromeLike }).chrome;
}

function getChromeStorage() {
  const chromeLike = getChromeLike();
  if (!chromeLike?.runtime?.id || !chromeLike.storage?.local) return null;
  return chromeLike.storage.local;
}

function normalizeReminderSettings(value: unknown): ReminderSettings {
  const candidate = value && typeof value === "object" ? value as Partial<ReminderSettings> : {};
  const time = typeof candidate.time === "string" && /^\d{2}:\d{2}$/.test(candidate.time)
    ? candidate.time
    : defaultReminderSettings.time;
  const message = typeof candidate.message === "string" && candidate.message.trim()
    ? candidate.message.trim().slice(0, 140)
    : defaultReminderSettings.message;

  return {
    enabled: Boolean(candidate.enabled),
    time,
    message,
    lastShownDate: typeof candidate.lastShownDate === "string" ? candidate.lastShownDate : "",
  };
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function nextReminderDate(settings: ReminderSettings, now = new Date()) {
  const [hour, minute] = settings.time.split(":").map(Number);
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now || settings.lastShownDate === localDateKey(next)) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export function sendReminderSettingsUpdatedMessage() {
  getChromeLike()?.runtime?.sendMessage?.({ type: "DIGI_PET_REMINDER_SETTINGS_UPDATED" });
}

export async function loadReminderSettings(): Promise<ReminderSettings> {
  const chromeStorage = getChromeStorage();
  if (chromeStorage) {
    return new Promise((resolve) => {
      chromeStorage.get({ [STORAGE_KEY]: defaultReminderSettings }, (items) => {
        resolve(normalizeReminderSettings(items[STORAGE_KEY]));
      });
    });
  }

  try {
    return normalizeReminderSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
  } catch {
    return defaultReminderSettings;
  }
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<ReminderSettings> {
  const normalized = normalizeReminderSettings(settings);
  const chromeStorage = getChromeStorage();
  if (chromeStorage) {
    await new Promise<void>((resolve, reject) => {
      chromeStorage.set({ [STORAGE_KEY]: normalized }, () => {
        const error = getChromeLike()?.runtime?.lastError;
        if (error) {
          reject(new Error(error.message || "Could not save reminder settings."));
          return;
        }
        resolve();
      });
    });
    sendReminderSettingsUpdatedMessage();
    return normalized;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function markReminderShown(dateKey = localDateKey()) {
  const settings = await loadReminderSettings();
  return saveReminderSettings({ ...settings, lastShownDate: dateKey });
}
