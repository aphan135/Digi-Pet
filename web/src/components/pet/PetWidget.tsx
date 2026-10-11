import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { usePetTip } from "../../hooks/usePetTip";

const catColors = {
  fur: "#FFC2D6",
  dark: "#FF8FB3",
  tail: "#F29BB8",
  paws: "#FFB0C9",
  nose: "#E0608F",
  label: "#C2336B",
};

interface CatProps {
  className: string;
}

interface Heart {
  id: number;
  left: number;
  top: number;
}

interface PetPosition {
  x: number;
  y: number;
}

type PetCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
}

const PET_SIZE = 150;
const CORNER_INSET = 12;

function getCornerPosition(corner: PetCorner): PetPosition {
  const right = Math.max(CORNER_INSET, window.innerWidth - PET_SIZE - CORNER_INSET);
  const bottom = Math.max(CORNER_INSET, window.innerHeight - PET_SIZE - CORNER_INSET);

  return {
    x: corner.endsWith("right") ? right : CORNER_INSET,
    y: corner.startsWith("bottom") ? bottom : CORNER_INSET,
  };
}

export function Cat({ className }: CatProps) {
  const c = catColors;

  return (
    <svg className={className} viewBox="0 0 160 150" role="img" aria-label="Cat">
      <path
        className="pet-tail"
        d="M128 112 Q158 98 150 70"
        stroke={c.tail}
        strokeLinecap="round"
        strokeWidth="10"
        fill="none"
      />
      <ellipse cx="80" cy="102" rx="48" ry="38" fill={c.fur} />
      <ellipse cx="58" cy="138" rx="14" ry="8" fill={c.paws} />
      <ellipse cx="102" cy="138" rx="14" ry="8" fill={c.paws} />
      <polygon points="36,50 44,12 72,36" fill={c.fur} />
      <polygon points="124,50 116,12 88,36" fill={c.fur} />
      <ellipse cx="80" cy="70" rx="52" ry="44" fill={c.fur} />
      <polygon points="45,40 48,24 62,36" fill={c.dark} />
      <polygon points="115,40 112,24 98,36" fill={c.dark} />
      <ellipse cx="48" cy="82" rx="8" ry="5" fill={c.dark} opacity=".55" />
      <ellipse cx="112" cy="82" rx="8" ry="5" fill={c.dark} opacity=".55" />
      <g className="pet-eyes">
        <circle cx="62" cy="68" r="6.5" fill="#3B2A35" />
        <circle cx="98" cy="68" r="6.5" fill="#3B2A35" />
        <circle cx="64" cy="66" r="2" fill="#FFFFFF" />
        <circle cx="100" cy="66" r="2" fill="#FFFFFF" />
      </g>
      <ellipse cx="80" cy="77" rx="3" ry="2.2" fill={c.nose} />
      <path
        d="M72 83 Q76 89 80 83 Q84 89 88 83"
        stroke="#3B2A35"
        strokeLinecap="round"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

interface PeekHeadProps {
  shown: boolean;
}

function PeekHead({ shown }: PeekHeadProps) {
  const c = catColors;

  return (
    <svg className={shown ? "pet-peek shown" : "pet-peek"} viewBox="0 0 80 80" aria-hidden="true">
      <g className="pet-ear">
        <polygon points="37,63 47,48 32,36" fill={c.fur} />
        <polygon points="37.8,56.7 43.3,48.5 35,41.9" fill={c.dark} />
      </g>
      <g className="pet-ear">
        <polygon points="61,38 78,34 66,14" fill={c.fur} />
        <polygon points="64.3,33.8 73.6,31.6 67,20.6" fill={c.dark} />
      </g>
      <circle cx="80" cy="80" r="46" fill={c.fur} />
      <circle cx="60" cy="68" r="4.5" fill="#3B2A35" />
      <circle cx="61.5" cy="66.5" r="1.4" fill="#FFFFFF" />
      <circle cx="72" cy="56" r="4.5" fill="#3B2A35" />
      <circle cx="73.5" cy="54.5" r="1.4" fill="#FFFFFF" />
    </svg>
  );
}

function PetWidget() {
  const [phase, setPhase] = useState<"hidden" | "peek" | "open">("peek");
  const [corner, setCorner] = useState<PetCorner>("bottom-right");
  const [position, setPosition] = useState<PetPosition>(() =>
    getCornerPosition("bottom-right"),
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [jump, setJump] = useState(0);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const closeTimer = useRef<number | undefined>(undefined);
  const dragRef = useRef<DragState | null>(null);
  const positionRef = useRef(position);
  const suppressClickRef = useRef(false);
  const { tip, nextTip } = usePetTip();
  const open = phase === "open";

  useEffect(() => {
    function handleResize() {
      const nextPosition = getCornerPosition(corner);
      positionRef.current = nextPosition;
      setPosition(nextPosition);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [corner]);

  function beginDrag(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: positionRef.current.x,
      originY: positionRef.current.y,
      moved: false,
    };
    setIsDragging(true);
    window.clearTimeout(closeTimer.current);
  }

  function movePet(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(deltaX, deltaY) < 5) return;

    drag.moved = true;
    event.preventDefault();

    const nextPosition = {
      x: Math.min(
        Math.max(0, drag.originX + deltaX),
        Math.max(0, window.innerWidth - PET_SIZE),
      ),
      y: Math.min(
        Math.max(0, drag.originY + deltaY),
        Math.max(0, window.innerHeight - PET_SIZE),
      ),
    };
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  }

  function finishDrag(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    setIsDragging(false);

    if (!drag.moved) return;

    const centerX = positionRef.current.x + PET_SIZE / 2;
    const centerY = positionRef.current.y + PET_SIZE / 2;
    const nextCorner: PetCorner = `${centerY < window.innerHeight / 2 ? "top" : "bottom"}-${
      centerX < window.innerWidth / 2 ? "left" : "right"
    }`;
    const snappedPosition = getCornerPosition(nextCorner);

    setCorner(nextCorner);
    positionRef.current = snappedPosition;
    setPosition(snappedPosition);
    setIsPinned(true);
    setPhase("peek");
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }

  function hide() {
    window.clearTimeout(closeTimer.current);
    setIsPinned(false);
    setPhase("hidden");
  }

  function openNow() {
    if (suppressClickRef.current) return;
    window.clearTimeout(closeTimer.current);
    setIsPinned(false);
    if (!open) {
      nextTip();
    }
    setPhase("open");
  }

  function petIt() {
    if (suppressClickRef.current) return;

    const heart = {
      id: Math.random(),
      left: 70 + Math.round(Math.random() * 60),
      top: 10 + Math.round(Math.random() * 30),
    };

    setJump((currentJump) => currentJump + 1);
    setHearts((currentHearts) => [...currentHearts, heart]);
    window.setTimeout(() => {
      setHearts((currentHearts) =>
        currentHearts.filter((currentHeart) => currentHeart.id !== heart.id),
      );
    }, 1000);
    nextTip();
  }

  return (
    <aside
      aria-label="Digital pet helper"
      className={`pet-stage${isDragging ? " dragging" : ""}`}
      data-corner={corner}
      onPointerCancel={finishDrag}
      onPointerMove={movePet}
      onPointerUp={finishDrag}
      style={{ left: position.x, top: position.y }}
    >
      <div className="pet-peek-clip">
        <PeekHead shown={phase === "peek"} />
      </div>

      {!open && (
        <button
          aria-label="Say hi to the cat"
          className="pet-hotspot"
          onBlur={() => {
            if (!isPinned && !dragRef.current) {
              setPhase((currentPhase) => (currentPhase === "peek" ? "hidden" : currentPhase));
            }
          }}
          onClick={openNow}
          onFocus={() => setPhase("peek")}
          onMouseEnter={() => {
            if (!dragRef.current) setPhase("peek");
          }}
          onMouseLeave={() => {
            if (!isPinned && !dragRef.current) {
              setPhase((currentPhase) => (currentPhase === "peek" ? "hidden" : currentPhase));
            }
          }}
          onPointerDown={beginDrag}
          type="button"
        />
      )}

      <div
        className={open ? "pet-wrap open" : "pet-wrap"}
        onMouseEnter={() => window.clearTimeout(closeTimer.current)}
        onMouseLeave={() => {
          if (!open || dragRef.current) {
            return;
          }

          window.clearTimeout(closeTimer.current);
          closeTimer.current = window.setTimeout(hide, 1000);
        }}
      >
        <div className="pet-cloud-group">
          <div className="pet-cloud">
            <button aria-label="Close" className="pet-close" onClick={hide} type="button">
              x
            </button>
            <div className="pet-cloud-body">
              <div className="pet-label" style={{ color: catColors.label }}>
                Today's spark
              </div>
              <p className="pet-quote">{tip}</p>
              <a className="pet-link" href="#challenge" style={{ color: catColors.label }}>
                Keep practicing
              </a>
            </div>
          </div>
          <div className="pet-trail">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="pet-area">
          {hearts.map((heart) => (
            <svg
              aria-hidden="true"
              className="pet-heart"
              key={heart.id}
              style={{ left: heart.left, top: heart.top }}
              viewBox="0 0 24 22"
            >
              <path
                d="M12 21C12 21 2 14.6 2 8.2A5.2 5.2 0 0 1 12 5.6A5.2 5.2 0 0 1 22 8.2C22 14.6 12 21 12 21Z"
                fill={catColors.dark}
              />
            </svg>
          ))}
          <button
            aria-label="Pet the cat"
            className="pet-button"
            onClick={petIt}
            onPointerDown={beginDrag}
            type="button"
          >
            <Cat className={jump ? (jump % 2 ? "pet-cat jump-a" : "pet-cat jump-b") : "pet-cat"} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default PetWidget;
