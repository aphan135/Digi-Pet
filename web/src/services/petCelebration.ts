const PET_CELEBRATION_EVENT = "digipet-celebration";

export function celebratePet() {
  document.dispatchEvent(new Event(PET_CELEBRATION_EVENT));
}

export function onPetCelebration(callback: () => void) {
  document.addEventListener(PET_CELEBRATION_EVENT, callback);
  return () => document.removeEventListener(PET_CELEBRATION_EVENT, callback);
}
