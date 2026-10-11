import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PetWidget from "../src/components/pet/PetWidget";
import petStyles from "../src/styles/global.css?inline";

function mountPet() {
  if (
    document.documentElement.hasAttribute("data-digi-pet-app") ||
    document.getElementById("digi-pet-extension")
  ) {
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
      <PetWidget enableReminderControls />
    </StrictMode>,
  );
}

mountPet();
