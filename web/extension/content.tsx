import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import PetWidget from "../src/components/pet/PetWidget";
import { onPetCelebration } from "../src/services/petCelebration";
import petStyles from "../src/styles/global.css?inline";

const DAILY_CHALLENGE_KEY = "digiPetDailyChallengeDate";

interface ChromeStorageChange {
  newValue?: unknown;
}

declare const chrome: {
  storage: {
    local: {
      get(key: string): Promise<Record<string, unknown>>;
      set(items: Record<string, string>): Promise<void>;
    };
    onChanged: {
      addListener(
        listener: (
          changes: Record<string, ChromeStorageChange>,
          areaName: string,
        ) => void,
      ): void;
      removeListener(
        listener: (
          changes: Record<string, ChromeStorageChange>,
          areaName: string,
        ) => void,
      ): void;
    };
  };
};

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function markDailyChallengeComplete() {
  try {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      throw new Error("Chrome extension storage is unavailable.");
    }
    await chrome.storage.local.set({
      [DAILY_CHALLENGE_KEY]: localDateKey(new Date()),
    });
  } catch (error) {
    console.error("Could not save Digi-Pet daily challenge completion:", error);
  }
}

function trackDailyChallengeCompletion() {
  return onPetCelebration(() => {
    void markDailyChallengeComplete();
  });
}

function ExtensionPet() {
  const [reminderReady, setReminderReady] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  useEffect(() => {
    let disposed = false;

    function updateCompletion(storedDate: unknown) {
      if (disposed) return;
      setChallengeCompleted(storedDate === localDateKey(new Date()));
      setReminderReady(true);
    }

    async function readCompletion() {
      try {
        if (typeof chrome === "undefined" || !chrome.storage?.local) {
          throw new Error("Chrome extension storage is unavailable.");
        }
        const stored = await chrome.storage.local.get(DAILY_CHALLENGE_KEY);
        updateCompletion(stored[DAILY_CHALLENGE_KEY]);
      } catch (error) {
        console.error("Could not read Digi-Pet daily challenge completion:", error);
        updateCompletion(undefined);
      }
    }

    function handleStorageChange(
      changes: Record<string, ChromeStorageChange>,
      areaName: string,
    ) {
      if (areaName === "local" && changes[DAILY_CHALLENGE_KEY]) {
        updateCompletion(changes[DAILY_CHALLENGE_KEY].newValue);
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange);
    const unsubscribeCelebration = trackDailyChallengeCompletion();
    readCompletion();

    let midnightTimer: number;
    function scheduleMidnightRefresh() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 250);
      midnightTimer = window.setTimeout(() => {
        readCompletion();
        scheduleMidnightRefresh();
      }, midnight.getTime() - now.getTime());
    }
    scheduleMidnightRefresh();

    return () => {
      disposed = true;
      window.clearTimeout(midnightTimer);
      chrome.storage.onChanged.removeListener(handleStorageChange);
      unsubscribeCelebration();
    };
  }, []);

  return (
    <PetWidget
      dailyChallengeCompleted={challengeCompleted}
      dailyReminderReady={reminderReady}
      enableReminderControls
    />
  );
}

function mountPet() {
  if (document.documentElement.hasAttribute("data-digi-pet-app")) {
    trackDailyChallengeCompletion();
    return;
  }
  if (document.getElementById("digi-pet-extension")) {
    return;
  }

  const host = document.createElement("div");
  host.id = "digi-pet-extension";
  host.style.cssText =
    "all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;";

  const shadowRoot = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = petStyles;

  const mountPoint = document.createElement("div");
  mountPoint.id = "digi-pet-root";
  shadowRoot.append(style, mountPoint);
  document.documentElement.append(host);

  createRoot(mountPoint).render(
    <StrictMode>
      <ExtensionPet />
    </StrictMode>,
  );
}

mountPet();
