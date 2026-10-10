import { useMemo, useState } from "react";

const tips = [
  "Tiny hint: explain the brute force idea first, then improve it.",
  "Fun fact: hash maps trade memory for faster lookups.",
  "Good systems answers start with requirements before architecture.",
  "Your pet believes in small, consistent attempts.",
];

export function usePetTip() {
  const [index, setIndex] = useState(0);

  const tip = useMemo(() => tips[index], [index]);

  function nextTip() {
    setIndex((currentIndex) => (currentIndex + 1) % tips.length);
  }

  return { tip, nextTip };
}

