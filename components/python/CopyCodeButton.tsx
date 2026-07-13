"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";

import { playClickSound, playSuccessSound } from "@/lib/sounds";

export type CopyCodeButtonProps = {
  code: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

type CopyStatus = "idle" | "copied" | "failed";

function playSoundSafely(sound: () => void): void {
  try {
    sound();
  } catch {
    // Copying should still work when audio is unavailable or blocked.
  }
}

function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined" || !document.body) return false;

  const textarea = document.createElement("textarea");
  const focusedElement = document.activeElement;

  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    textarea.remove();
    if (focusedElement instanceof HTMLElement) focusedElement.focus();
  }

  return copied;
}

async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through for browsers that expose Clipboard but block its use.
    }
  }

  return fallbackCopy(text);
}

export default function CopyCodeButton({
  code,
  label = "Copy code",
  copiedLabel = "Copied!",
  className = "",
}: CopyCodeButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
    },
    [],
  );

  function resetStatusLater(): void {
    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
    }
    resetTimer.current = window.setTimeout(() => setStatus("idle"), 2200);
  }

  async function handleCopy(): Promise<void> {
    playSoundSafely(playClickSound);
    const copied = await copyText(code);

    if (copied) {
      setStatus("copied");
      playSoundSafely(playSuccessSound);
    } else {
      setStatus("failed");
    }

    resetStatusLater();
  }

  const content =
    status === "copied"
      ? { icon: <Check size={17} aria-hidden="true" />, text: copiedLabel }
      : status === "failed"
        ? {
            icon: <TriangleAlert size={17} aria-hidden="true" />,
            text: "Copy failed",
          }
        : { icon: <Copy size={17} aria-hidden="true" />, text: label };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={status === "failed" ? "Copy failed. Try copying code again" : content.text}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${className}`}
    >
      {content.icon}
      <span aria-live="polite">{content.text}</span>
    </button>
  );
}
