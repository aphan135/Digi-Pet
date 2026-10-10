import { useState } from "react";
import { usePetTip } from "../../hooks/usePetTip";

function PetWidget() {
  const [isOpen, setIsOpen] = useState(true);
  const { tip, nextTip } = usePetTip();

  function handlePetClick() {
    setIsOpen(true);
    nextTip();
  }

  return (
    <aside className="pet-widget" aria-label="Digital pet helper">
      {isOpen && (
        <div className="pet-bubble">
          <button
            aria-label="Close pet message"
            className="bubble-close"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            x
          </button>
          <p>{tip}</p>
        </div>
      )}
      <button className="pet-button" onClick={handlePetClick} type="button">
        <span aria-hidden="true">:)</span>
      </button>
    </aside>
  );
}

export default PetWidget;

