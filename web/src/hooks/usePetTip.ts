import { useState } from "react";

const messages = [
  { id: "octopus-hearts", category: "Fun fact", text: "An octopus has three hearts." },
  {
    id: "venus-day",
    category: "Fun fact",
    text: "A day on Venus is longer than a year on Venus.",
  },
  {
    id: "ada-lovelace",
    category: "Fun fact",
    text: "Ada Lovelace wrote an algorithm for a machine that had not yet been built.",
  },
  {
    id: "oxford-aztec",
    category: "Fun fact",
    text: "Oxford University is older than the Aztec Empire.",
  },
  {
    id: "quote-small-steps",
    category: "Quote of the day",
    text: "Small steps still move you forward.",
  },
  {
    id: "quote-curiosity",
    category: "Quote of the day",
    text: "Stay curious; every question can open a new door.",
  },
  {
    id: "quote-practice",
    category: "Quote of the day",
    text: "Progress grows each time you try again.",
  },
  {
    id: "quote-beginnings",
    category: "Quote of the day",
    text: "Every expert was once a beginner.",
  },
];

export function usePetTip() {
  const [messageIndex, setMessageIndex] = useState(() =>
    Math.floor(Math.random() * messages.length),
  );

  const message = messages[messageIndex];

  function nextTip() {
    setMessageIndex((currentIndex) => {
      const nextIndex = Math.floor(Math.random() * (messages.length - 1));
      return nextIndex >= currentIndex ? nextIndex + 1 : nextIndex;
    });
  }

  return { message, nextTip };
}
