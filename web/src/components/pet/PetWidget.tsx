import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  FormEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { usePetTip } from "../../hooks/usePetTip";
import { onPetCelebration } from "../../services/petCelebration";
import {
  defaultReminderSettings,
  loadReminderSettings,
  localDateKey,
  markReminderShown,
  nextReminderDate,
  saveReminderSettings,
  type ReminderSettings,
} from "../../services/reminderSettings";

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
  onAnimationEnd?: () => void;
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

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  drift: number;
  rotation: number;
  color: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  summary?: string;
}

interface PetWidgetProps {
  enableReminderControls?: boolean;
}

const PET_SIZE = 150;
const CORNER_INSET = 12;
const CONFETTI_COLORS = ["#FF6B9A", "#FFC857", "#69D2A0", "#65B8E8", "#A78BFA"];
const CONGRATULATIONS = [
  "You got it! I knew you could do it!",
  "Purr-fect answer! Great job!",
  "That's correct! You're on a roll!",
  "Amazing work—you nailed it!",
];

function getCornerPosition(corner: PetCorner): PetPosition {
  const right = Math.max(CORNER_INSET, window.innerWidth - PET_SIZE - CORNER_INSET);
  const bottom = Math.max(CORNER_INSET, window.innerHeight - PET_SIZE - CORNER_INSET);

  return {
    x: corner.endsWith("right") ? right : CORNER_INSET,
    y: corner.startsWith("bottom") ? bottom : CORNER_INSET,
  };
}

export function Cat({ className, onAnimationEnd }: CatProps) {
  const c = catColors;

  if (className.includes("idle-walk-")) {
    return (
      <svg
        className={className}
        onAnimationEnd={onAnimationEnd}
        viewBox="0 0 240 210"
        role="img"
        aria-label="Cat walking"
      >
        <defs>
          <linearGradient id="walk-cat-body" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#FFD4E2" />
            <stop offset="65%" stopColor={c.fur} />
            <stop offset="100%" stopColor="#F29BB8" />
          </linearGradient>
          <linearGradient id="walk-cat-leg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F29BB8" />
            <stop offset="55%" stopColor={c.paws} />
            <stop offset="100%" stopColor="#F29BB8" />
          </linearGradient>
          <radialGradient id="walk-cat-highlight" cx="35%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".62" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <filter id="walk-cat-shadow" x="-30%" y="-30%" width="160%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <ellipse cx="122" cy="187" rx="78" ry="8" fill="#60354A" opacity=".16" filter="url(#walk-cat-shadow)" />

        <g className="walk-leg walk-leg-far-back" transform="rotate(-8 91 119)">
          <path d="M82 111 Q77 133 80 158 L78 176 Q80 182 94 181 L100 177 L98 157 Q102 133 105 116Z" fill="#D982A1" />
          <ellipse cx="88" cy="178" rx="13" ry="6" fill="#D982A1" />
        </g>
        <g className="walk-leg walk-leg-far-front" transform="rotate(8 151 119)">
          <path d="M143 113 Q140 136 143 158 L140 176 Q143 182 157 181 L163 177 L160 157 Q163 135 165 115Z" fill="#D982A1" />
          <ellipse cx="151" cy="178" rx="13" ry="6" fill="#D982A1" />
        </g>

        <path
          className="walk-cat-tail"
          d="M67 111 C42 103 29 82 35 57 C38 44 48 41 55 49 C61 56 54 64 52 72 C49 86 62 94 78 96"
          fill="none"
          stroke="url(#walk-cat-body)"
          strokeLinecap="round"
          strokeWidth="17"
        />
        <path
          d="M67 111 C42 103 29 82 35 57 C38 44 48 41 55 49"
          fill="none"
          stroke="#FFE5ED"
          strokeLinecap="round"
          strokeWidth="4"
          opacity=".55"
        />

        <g className="pet-walk-body">
          <ellipse cx="119" cy="119" rx="67" ry="43" fill="url(#walk-cat-body)" />
          <ellipse cx="109" cy="101" rx="43" ry="16" fill="url(#walk-cat-highlight)" />
          <path d="M159 124 Q168 143 163 155 Q151 158 144 144 L137 128Z" fill="#FFE0EA" opacity=".68" />
        </g>

        <g className="walk-leg walk-leg-near-back" transform="rotate(12 101 122)">
          <path d="M91 112 Q87 137 91 160 L87 177 Q90 184 105 182 L112 178 L107 158 Q111 135 114 116Z" fill="url(#walk-cat-leg)" />
          <ellipse cx="100" cy="180" rx="14" ry="7" fill={c.paws} />
          <path d="M93 179 Q99 176 105 180" fill="none" stroke="#E886A8" strokeWidth="1.5" />
        </g>
        <g className="walk-leg walk-leg-near-front" transform="rotate(-12 160 122)">
          <path d="M151 112 Q147 136 151 159 L147 177 Q150 184 165 182 L172 178 L167 158 Q171 135 174 116Z" fill="url(#walk-cat-leg)" />
          <ellipse cx="160" cy="180" rx="14" ry="7" fill={c.paws} />
          <path d="M153 179 Q159 176 165 180" fill="none" stroke="#E886A8" strokeWidth="1.5" />
        </g>

        <g className="pet-walk-head">
          <path d="M161 64 L163 30 Q164 25 169 29 L190 52Z" fill={c.fur} />
          <path d="M196 52 L213 32 Q218 28 220 34 L224 68Z" fill={c.fur} />
          <path d="M169 46 L169 36 L180 52Z" fill="#E987A9" />
          <path d="M205 51 L215 39 L217 57Z" fill="#E987A9" />
          <ellipse cx="190" cy="77" rx="39" ry="36" fill="url(#walk-cat-body)" />
          <path d="M214 84 Q232 87 229 95 Q224 102 207 95Z" fill="#FFE5ED" />
          <ellipse cx="227" cy="91" rx="4" ry="3" fill={c.nose} />
          <ellipse cx="207" cy="70" rx="4" ry="6" fill="#3B2A35" />
          <circle cx="208" cy="68" r="1.5" fill="#FFFFFF" />
          <ellipse cx="187" cy="95" rx="9" ry="4" fill="#FF8FB3" opacity=".55" />
          <path d="M224 96 Q229 101 233 97" fill="none" stroke="#3B2A35" strokeLinecap="round" strokeWidth="1.5" />
          <path d="M222 94 L239 90 M221 98 L238 101" fill="none" stroke="#9B6277" strokeWidth="1.2" opacity=".75" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      className={className}
      onAnimationEnd={onAnimationEnd}
      viewBox="0 0 160 150"
      role="img"
      aria-label="Cat"
    >
      <path
        className="pet-tail"
        d="M128 112 Q158 98 150 70"
        stroke={c.tail}
        strokeLinecap="round"
        strokeWidth="10"
        fill="none"
      />
      <ellipse cx="80" cy="102" rx="48" ry="38" fill={c.fur} />
      <ellipse className="pet-paw-left" cx="58" cy="138" rx="14" ry="8" fill={c.paws} />
      <ellipse className="pet-paw-right" cx="102" cy="138" rx="14" ry="8" fill={c.paws} />
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
        className="pet-smile"
        d="M72 83 Q76 89 80 83 Q84 89 88 83"
        stroke="#3B2A35"
        strokeLinecap="round"
        strokeWidth="2"
        fill="none"
      />
      <ellipse className="pet-yawn-mouth" cx="80" cy="87" rx="7" ry="9" fill="#3B2A35" />
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

function PetWidget({ enableReminderControls = false }: PetWidgetProps) {
  const [phase, setPhase] = useState<"hidden" | "peek" | "open">("peek");
  const [idleAnimation, setIdleAnimation] = useState<
    "walk-left" | "walk-right" | "purr" | "yawn" | null
  >(null);
  const [corner, setCorner] = useState<PetCorner>("bottom-right");
  const [position, setPosition] = useState<PetPosition>(() =>
    getCornerPosition("bottom-right"),
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [celebrationId, setCelebrationId] = useState(0);
  const [congratulation, setCongratulation] = useState<string | null>(null);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [isChatSending, setIsChatSending] = useState(false);
  const [summarizingMessageIndex, setSummarizingMessageIndex] = useState<number | null>(null);
  const [summaryError, setSummaryError] = useState<{ index: number; message: string } | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(defaultReminderSettings);
  const [reminderDraft, setReminderDraft] = useState<ReminderSettings>(defaultReminderSettings);
  const [reminderStatus, setReminderStatus] = useState("");
  const [reminderMessage, setReminderMessage] = useState<{ category: string; text: string } | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const positionRef = useRef(position);
  const suppressClickRef = useRef(false);
  const { message, nextTip } = usePetTip();
  const displayMessage = reminderMessage ?? message;
  const nextTipRef = useRef(nextTip);
  nextTipRef.current = nextTip;
  const open = phase === "open";
  const hide = useCallback(() => {
    setIsPinned(false);
    setPhase("hidden");
    setIdleAnimation(null);
    setChatOpen(false);
  }, []);

  useEffect(() => {
    return onPetCelebration(() => {
      setPhase("open");
      setIsPinned(false);
      setIdleAnimation(null);
      setCongratulation(
        CONGRATULATIONS[Math.floor(Math.random() * CONGRATULATIONS.length)],
      );
      nextTipRef.current();
      setCelebrationId((id) => id + 1);
      setConfetti(
        Array.from({ length: 22 }, (_, index) => ({
          id: index,
          left: 38 + Math.random() * 24,
          delay: Math.random() * 180,
          drift: (Math.random() - 0.5) * 180,
          rotation: Math.random() * 540 - 270,
          color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        })),
      );
    });
  }, []);

  useEffect(() => {
    if (!enableReminderControls) return;

    let isCurrent = true;
    loadReminderSettings().then((settings) => {
      if (!isCurrent) return;
      setReminderSettings(settings);
      setReminderDraft(settings);
    });

    return () => {
      isCurrent = false;
    };
  }, [enableReminderControls]);

  useEffect(() => {
    if (!enableReminderControls || !reminderSettings.enabled) return;

    const nextDate = nextReminderDate(reminderSettings);
    const timer = window.setTimeout(() => {
      const today = localDateKey();
      if (reminderSettings.lastShownDate === today) return;

      setReminderMessage({
        category: "Challenge reminder",
        text: reminderSettings.message,
      });
      setPhase("open");
      setIsPinned(false);
      setIdleAnimation(null);
      markReminderShown(today).then((settings) => {
        setReminderSettings(settings);
        setReminderDraft(settings);
      });
    }, Math.max(0, nextDate.getTime() - Date.now()));

    return () => window.clearTimeout(timer);
  }, [enableReminderControls, reminderSettings]);

  useEffect(() => {
    if (confetti.length === 0) return;
    const timer = window.setTimeout(() => setConfetti([]), 1600);
    return () => window.clearTimeout(timer);
  }, [confetti]);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      const stage = stageRef.current;
      if (stage && !event.composedPath().includes(stage)) {
        hide();
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
  }, [hide, open]);

  useEffect(() => {
    function handleResize() {
      const nextPosition = getCornerPosition(corner);
      positionRef.current = nextPosition;
      setPosition(nextPosition);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [corner]);

  useEffect(() => {
    if (!open || chatOpen || isDragging || idleAnimation) return;

    const timer = window.setTimeout(() => {
      const choice = Math.random();
      if (choice < 0.28) {
        setIdleAnimation(corner.endsWith("right") ? "walk-left" : "walk-right");
        return;
      }

      setIdleAnimation(choice < 0.64 ? "purr" : "yawn");
    }, 5000 + Math.random() * 5000);

    return () => window.clearTimeout(timer);
  }, [chatOpen, corner, idleAnimation, isDragging, open]);

  useEffect(() => {
    const history = chatHistoryRef.current;
    if (history) history.scrollTop = history.scrollHeight;
  }, [chatMessages, isChatSending]);

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
    setIdleAnimation(null);
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
    setIdleAnimation(null);
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }

  function openNow() {
    if (suppressClickRef.current) return;
    setIsPinned(false);
    setCongratulation(null);
    if (!open) {
      setReminderMessage(null);
      nextTip();
    }
    setPhase("open");
  }

  function handleCatClick() {
    if (suppressClickRef.current) return;
    setCongratulation(null);
    setReminderMessage(null);
    nextTip();
  }

  async function sendChatMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = chatDraft.trim();
    if (!content || isChatSending) return;

    const nextMessages = [...chatMessages, { role: "user" as const, content }];
    setChatMessages(nextMessages);
    setChatDraft("");
    setChatError(null);
    setIsChatSending(true);

    try {
      let contextMessages = nextMessages.slice(-12);
      if (contextMessages[0]?.role === "assistant") contextMessages = contextMessages.slice(1);
      const response = await fetch("/api/pet-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: contextMessages.map(({ role, content: message }) => ({
            role,
            content: message,
          })),
        }),
      });
      const responseText = await response.text();
      let result: { reply?: string; error?: string };
      try {
        result = responseText ? (JSON.parse(responseText) as typeof result) : {};
      } catch {
        throw new Error(
          `The chat API returned a non-JSON response (HTTP ${response.status}). ` +
            "For local development, run the app with `npm run dev` from the web folder so the API server starts too. " +
            "The Chrome extension also needs a deployed Digi-Pet API when used on other websites.",
        );
      }
      if (!response.ok) {
        throw new Error(result.error || "The cat couldn't answer. Please try again.");
      }
      if (typeof result.reply !== "string" || !result.reply.trim()) {
        throw new Error("The cat returned an empty reply. Please try again.");
      }
      const reply = result.reply.trim();
      setChatMessages((current) => [
        ...current,
        { role: "assistant", content: reply },
      ]);
    } catch (error) {
      setChatError(
        error instanceof Error ? error.message : "The cat couldn't answer. Please try again.",
      );
    } finally {
      setIsChatSending(false);
    }
  }

  async function summarizeChatMessage(index: number) {
    const chatMessage = chatMessages[index];
    if (!chatMessage || chatMessage.role !== "assistant" || summarizingMessageIndex !== null) {
      return;
    }

    setSummarizingMessageIndex(index);
    setSummaryError(null);
    try {
      const response = await fetch("/api/pet-chat/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chatMessage.content }),
      });
      const responseText = await response.text();
      let result: { summary?: string; error?: string };
      try {
        result = responseText ? (JSON.parse(responseText) as typeof result) : {};
      } catch {
        throw new Error(`The summary service returned a non-JSON response (HTTP ${response.status}).`);
      }
      if (!response.ok) {
        throw new Error(result.error || "Couldn't summarize this answer. Please try again.");
      }
      if (typeof result.summary !== "string" || !result.summary.trim()) {
        throw new Error("The cat returned an empty summary. Please try again.");
      }
      const summary = result.summary.trim();
      setChatMessages((current) =>
        current.map((message, messageIndex) =>
          messageIndex === index ? { ...message, summary } : message,
        ),
      );
    } catch (error) {
      setSummaryError({
        index,
        message: error instanceof Error ? error.message : "Couldn't summarize this answer.",
      });
    } finally {
      setSummarizingMessageIndex(null);
    }
  }

  async function saveReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReminderStatus("Saving...");
    try {
      const savedSettings = await saveReminderSettings(reminderDraft);
      setReminderSettings(savedSettings);
      setReminderDraft(savedSettings);
      setReminderStatus(savedSettings.enabled ? `Reminder set for ${savedSettings.time}.` : "Daily reminder off.");
    } catch {
      setReminderStatus("Could not save reminder.");
    }
  }

  return (
    <aside
      aria-label="Digital pet helper"
      className={`pet-stage${isDragging ? " dragging" : ""}`}
      data-corner={corner}
      data-idle-animation={idleAnimation ?? undefined}
      ref={stageRef}
      onPointerCancel={finishDrag}
      onPointerMove={movePet}
      onPointerUp={finishDrag}
      style={{ left: position.x, top: position.y }}
    >
      {phase !== "open" && (
        <div className="pet-peek-clip">
          <PeekHead shown={phase === "peek"} />
        </div>
      )}

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
        className={`pet-wrap${open ? " open" : ""}`}
        onAnimationEnd={(event) => {
          if (
            event.target === event.currentTarget &&
            event.animationName.startsWith("pet-stroll-")
          ) {
            setIdleAnimation(null);
          }
        }}
      >
        <div className="pet-cloud-group">
          <div className="pet-cloud">
            <button aria-label="Close cat" className="pet-close" onClick={hide} type="button">
              x
            </button>
            {chatOpen ? (
              <section aria-label="Chat with the AI cat" className="pet-chat-panel">
                <div className="pet-chat-heading">
                  <div>
                    <div className="pet-label" style={{ color: catColors.label }}>Digi-Pet AI</div>
                    <p className="pet-chat-caption">Ask me about what you're learning.</p>
                  </div>
                  <button
                    className="pet-chat-back"
                    onClick={() => setChatOpen(false)}
                    type="button"
                  >
                    Back
                  </button>
                </div>
                <div
                  aria-live="polite"
                  className="pet-chat-history"
                  ref={chatHistoryRef}
                  role="log"
                >
                  {chatMessages.length === 0 ? (
                    <p className="pet-chat-welcome">
                      Hi! I'm here to help with coding, math, science, history, and more. What are
                      you curious about?
                    </p>
                  ) : (
                    chatMessages.map((chatMessage, index) =>
                      chatMessage.role === "assistant" ? (
                        <div className="pet-chat-assistant-message" key={`assistant-${index}`}>
                          <p className="pet-chat-message assistant">{chatMessage.content}</p>
                          {chatMessage.summary ? (
                            <p className="pet-chat-summary">
                              <strong>Summary:</strong> {chatMessage.summary}
                            </p>
                          ) : (
                            <>
                              <button
                                className="pet-chat-summarize"
                                disabled={summarizingMessageIndex !== null}
                                onClick={() => void summarizeChatMessage(index)}
                                type="button"
                              >
                                {summarizingMessageIndex === index ? "Summarizing..." : "Summarize"}
                              </button>
                              {summaryError?.index === index && (
                                <p className="pet-chat-error" role="alert">{summaryError.message}</p>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <p className="pet-chat-message user" key={`user-${index}`}>
                          {chatMessage.content}
                        </p>
                      ),
                    )
                  )}
                  {isChatSending && <p className="pet-chat-status">Thinking...</p>}
                </div>
                {chatError && <p className="pet-chat-error" role="alert">{chatError}</p>}
                <form className="pet-chat-form" onSubmit={sendChatMessage}>
                  <input
                    aria-label="Your message"
                    autoComplete="off"
                    maxLength={2000}
                    onChange={(event) => setChatDraft(event.target.value)}
                    placeholder="Ask a question..."
                    value={chatDraft}
                  />
                  <button disabled={!chatDraft.trim() || isChatSending} type="submit">
                    Send
                  </button>
                </form>
                <p className="pet-chat-disclaimer">Your message is sent to the AI to generate a reply.</p>
              </section>
            ) : (
              <div className="pet-cloud-body">
                <div className="pet-label" style={{ color: catColors.label }}>
                  {congratulation ? "Correct!" : displayMessage.category}
                </div>
                <p className="pet-quote">{congratulation ?? displayMessage.text}</p>
                {enableReminderControls && (
                  <form className="pet-reminder-panel" onSubmit={saveReminder}>
                    <label className="pet-reminder-toggle">
                      <input
                        checked={reminderDraft.enabled}
                        onChange={(event) => {
                          setReminderDraft((current) => ({ ...current, enabled: event.target.checked }));
                          setReminderStatus("");
                        }}
                        type="checkbox"
                      />
                      <span>Daily coding reminder</span>
                    </label>
                    <label className="pet-reminder-field">
                      <span>Time</span>
                      <input
                        onChange={(event) => {
                          setReminderDraft((current) => ({ ...current, time: event.target.value }));
                          setReminderStatus("");
                        }}
                        type="time"
                        value={reminderDraft.time}
                      />
                    </label>
                    <label className="pet-reminder-field">
                      <span>Message</span>
                      <input
                        maxLength={140}
                        onChange={(event) => {
                          setReminderDraft((current) => ({ ...current, message: event.target.value }));
                          setReminderStatus("");
                        }}
                        type="text"
                        value={reminderDraft.message}
                      />
                    </label>
                    <button className="pet-reminder-save" type="submit">Save reminder</button>
                    {reminderStatus && <span className="pet-reminder-status">{reminderStatus}</span>}
                  </form>
                )}
                <button
                  className="pet-chat-trigger"
                  onClick={() => {
                    setIdleAnimation(null);
                    setChatOpen(true);
                  }}
                  type="button"
                >
                  Ask me anything
                </button>
              </div>
            )}
          </div>
          <div className="pet-trail">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="pet-area">
          {confetti.length > 0 && (
            <div aria-hidden="true" className="pet-confetti-burst">
              {confetti.map((piece) => (
                <span
                  className="pet-confetti"
                  key={`${celebrationId}-${piece.id}`}
                  style={{
                    left: `${piece.left}%`,
                    animationDelay: `${piece.delay}ms`,
                    backgroundColor: piece.color,
                    "--confetti-drift": `${piece.drift}px`,
                    "--confetti-rotation": `${piece.rotation}deg`,
                  } as CSSProperties}
                />
              ))}
            </div>
          )}
          <button
            aria-label="Close the cat"
            className="pet-button"
            onClick={handleCatClick}
            onPointerDown={beginDrag}
            type="button"
          >
            <Cat
              key={celebrationId}
              className={[
                "pet-cat",
                idleAnimation ? `idle-${idleAnimation}` : "",
                celebrationId > 0 ? "pet-celebrating" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onAnimationEnd={() => {
                if (idleAnimation === "purr" || idleAnimation === "yawn") {
                  setIdleAnimation(null);
                }
              }}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default PetWidget;
