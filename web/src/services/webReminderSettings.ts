export type WebsiteReminderInterval = 1 | 720 | 1440;

export interface WebsiteReminderSettings {
  enabled: boolean;
  intervalMinutes: WebsiteReminderInterval;
  message: string;
  nextAlertAt: number;
}

const STORAGE_KEY = "digiPetWebsiteReminderSettings";

export const websiteReminderIntervals: { label: string; value: WebsiteReminderInterval }[] = [
  { label: "1 minute (test)", value: 1 },
  { label: "12 hours", value: 720 },
  { label: "24 hours", value: 1440 },
];

export const defaultWebsiteReminderSettings: WebsiteReminderSettings = {
  enabled: false,
  intervalMinutes: 1440,
  message: "Time for today's coding challenge!",
  nextAlertAt: 0,
};

function normalizeInterval(value: unknown): WebsiteReminderInterval {
  return value === 1 || value === 720 || value === 1440 ? value : 1440;
}

export function nextWebsiteReminderTime(intervalMinutes: WebsiteReminderInterval, now = Date.now()) {
  return now + intervalMinutes * 60 * 1000;
}

export function normalizeWebsiteReminderSettings(value: unknown): WebsiteReminderSettings {
  const candidate = value && typeof value === "object"
    ? value as Partial<WebsiteReminderSettings>
    : {};
  const intervalMinutes = normalizeInterval(candidate.intervalMinutes);
  const message = typeof candidate.message === "string" && candidate.message.trim()
    ? candidate.message.trim().slice(0, 140)
    : defaultWebsiteReminderSettings.message;
  const nextAlertAt = typeof candidate.nextAlertAt === "number" && Number.isFinite(candidate.nextAlertAt)
    ? candidate.nextAlertAt
    : 0;

  return {
    enabled: Boolean(candidate.enabled),
    intervalMinutes,
    message,
    nextAlertAt,
  };
}

export function loadWebsiteReminderSettings(): WebsiteReminderSettings {
  try {
    return normalizeWebsiteReminderSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
  } catch {
    return defaultWebsiteReminderSettings;
  }
}

export function saveWebsiteReminderSettings(settings: WebsiteReminderSettings) {
  const normalized = normalizeWebsiteReminderSettings(settings);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}
