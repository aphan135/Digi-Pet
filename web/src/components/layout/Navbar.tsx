import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  websiteReminderIntervals,
  type WebsiteReminderSettings,
  type WebsiteReminderInterval,
} from "../../services/webReminderSettings";
import type { PageName } from "../../types";

interface NavbarProps {
  activePage: PageName;
  onNavigate: (page: PageName) => void;
  onSaveWebsiteReminder: (settings: WebsiteReminderSettings) => Promise<void>;
  websiteReminder: WebsiteReminderSettings;
}

const navItems: { label: string; page: PageName }[] = [
  { label: "Challenge", page: "challenge" },
  { label: "Map", page: "map" },
  { label: "Learn", page: "learn" },
];

export function ProfileCatIcon() {
  return (
    <svg className="nav-cat-icon" viewBox="0 0 80 80" role="img" aria-label="Profile">
      <polygon points="18,34 28,8 42,32" fill="#FFC2D6" />
      <polygon points="62,34 52,8 38,32" fill="#FFC2D6" />
      <polygon points="25,29 29,18 36,30" fill="#FF8FB3" />
      <polygon points="55,29 51,18 44,30" fill="#FF8FB3" />
      <circle cx="40" cy="44" r="33" fill="#FFC2D6" />
      <circle cx="29" cy="42" r="4.5" fill="#3B2A35" />
      <circle cx="51" cy="42" r="4.5" fill="#3B2A35" />
      <circle cx="30.5" cy="40.5" r="1.4" fill="#FFFFFF" />
      <circle cx="52.5" cy="40.5" r="1.4" fill="#FFFFFF" />
      <ellipse cx="40" cy="50" rx="3" ry="2.2" fill="#E0608F" />
      <path
        d="M34 56 Q37 60 40 56 Q43 60 46 56"
        stroke="#3B2A35"
        strokeLinecap="round"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function SettingsCogIcon() {
  return (
    <svg className="settings-cog-icon" viewBox="0 0 24 24" role="img" aria-label="Reminder settings">
      <path
        d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm8.2 3.8c0-.5-.05-.98-.16-1.45l2-1.55-2-3.46-2.38.96a8.2 8.2 0 0 0-2.5-1.45L14.8 2.5H9.2l-.36 2.55a8.2 8.2 0 0 0-2.5 1.45l-2.38-.96-2 3.46 2 1.55A6.7 6.7 0 0 0 3.8 12c0 .5.05.98.16 1.45l-2 1.55 2 3.46 2.38-.96a8.2 8.2 0 0 0 2.5 1.45l.36 2.55h5.6l.36-2.55a8.2 8.2 0 0 0 2.5-1.45l2.38.96 2-3.46-2-1.55c.1-.47.16-.95.16-1.45Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function Navbar({ activePage, onNavigate, onSaveWebsiteReminder, websiteReminder }: NavbarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState(websiteReminder);
  const [status, setStatus] = useState("");
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDraft(websiteReminder);
  }, [websiteReminder]);

  useEffect(() => {
    if (!settingsOpen) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      const panel = settingsRef.current;
      if (panel && !event.composedPath().includes(panel)) {
        setSettingsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
  }, [settingsOpen]);

  async function saveReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving...");
    await onSaveWebsiteReminder(draft);
    setStatus(draft.enabled ? "Reminder saved." : "Reminder off.");
  }

  return (
    <header className="navbar">
      <div>
        <p className="eyebrow">Digi-Pet</p>
        <h1>Study Companion</h1>
      </div>
      <nav className="nav-actions" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            className={activePage === item.page ? "active" : ""}
            key={item.page}
            onClick={() => onNavigate(item.page)}
            type="button"
          >
            {item.label}
          </button>
        ))}
        <div className="nav-dashboard-cluster">
          <div className="reminder-settings-wrapper" ref={settingsRef}>
            <button
              aria-expanded={settingsOpen}
              aria-label="Reminder settings"
              className={`settings-nav-button ${websiteReminder.enabled ? "enabled" : ""}`}
              onClick={() => {
                setStatus("");
                setSettingsOpen((open) => !open);
              }}
              type="button"
            >
              <SettingsCogIcon />
            </button>
            {settingsOpen && (
              <form className="reminder-settings-popover" onSubmit={saveReminder}>
                <strong>Challenge reminder</strong>
                <label className="reminder-toggle-row">
                  <input
                    checked={draft.enabled}
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, enabled: event.target.checked }));
                      setStatus("");
                    }}
                    type="checkbox"
                  />
                  <span>Alert me</span>
                </label>
                <label className="reminder-select-row">
                  <span>Frequency</span>
                  <select
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        intervalMinutes: Number(event.target.value) as WebsiteReminderInterval,
                      }));
                      setStatus("");
                    }}
                    value={draft.intervalMinutes}
                  >
                    {websiteReminderIntervals.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <button className="reminder-save-button" type="submit">Save</button>
                {status && <span className="reminder-settings-status">{status}</span>}
              </form>
            )}
          </div>
          <div className={`dashboard-profile-nav ${activePage === "dashboard" ? "active" : ""}`}>
            <button
              className="dashboard-nav-button"
              onClick={() => onNavigate("dashboard")}
              type="button"
            >
              Dashboard
            </button>
            <button
              aria-label="Profile"
              className="profile-nav-button"
              onClick={() => onNavigate("dashboard")}
              type="button"
            >
              <ProfileCatIcon />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
