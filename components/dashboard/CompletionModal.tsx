"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  CheckCircle2,
  Sparkles,
  Trophy,
} from "lucide-react";
import { playSuccessSound } from "@/lib/sounds";

export type CompletionModalProps = {
  isOpen: boolean;
  projectTitle: string;
  xpEarned: number;
  onClose: () => void;
  onContinue: () => void;
  celebrationLabel?: string;
  description?: ReactNode;
  continueLabel?: string;
};

const FOCUSABLE_ELEMENTS = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const confettiPieces = [
  {
    symbol: "🌸",
    className: "left-[7%] top-[12%]",
    delay: 0,
  },
  {
    symbol: "✨",
    className: "left-[18%] top-[27%]",
    delay: 0.12,
  },
  {
    symbol: "🎀",
    className: "right-[9%] top-[14%]",
    delay: 0.2,
  },
  {
    symbol: "⭐",
    className: "right-[19%] top-[31%]",
    delay: 0.32,
  },
  {
    symbol: "🌷",
    className: "bottom-[18%] left-[9%]",
    delay: 0.4,
  },
  {
    symbol: "💫",
    className: "bottom-[15%] right-[10%]",
    delay: 0.5,
  },
];

export default function CompletionModal({
  isOpen,
  projectTitle,
  xpEarned,
  onClose,
  onContinue,
  celebrationLabel = "Project complete",
  description,
  continueLabel = "Continue exploring",
}: CompletionModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const continueButtonRef =
    useRef<HTMLButtonElement>(null);
  const hasPlayedSoundRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) {
      hasPlayedSoundRef.current = false;
      return;
    }

    const previouslyFocused =
      document.activeElement as HTMLElement | null;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    if (!hasPlayedSoundRef.current) {
      playSuccessSound();
      hasPlayedSoundRef.current = true;
    }

    window.setTimeout(() => {
      continueButtonRef.current?.focus();
    }, 50);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (
        event.key !== "Tab" ||
        !dialogRef.current
      ) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          FOCUSABLE_ELEMENTS
        )
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;

      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="
            fixed
            inset-0
            z-[1000]
            flex
            items-center
            justify-center
            bg-slate-950/45
            p-4
            backdrop-blur-md
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: shouldReduceMotion
              ? 0
              : 0.2,
          }}
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              onClose();
            }
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-completion-title"
            aria-describedby="dashboard-completion-description"
            tabIndex={-1}
            className="
              relative
              w-full
              max-w-xl
              overflow-hidden
              rounded-[2.25rem]
              border
              border-white/90
              bg-[#fffaf7]
              shadow-[0_32px_100px_rgba(76,29,149,0.30)]
              focus:outline-none
            "
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: 30,
                    rotate: -1.5,
                    scale: 0.93,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              rotate: 0,
              scale: 1,
            }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: 20,
                    scale: 0.97,
                  }
            }
            transition={{
              duration: shouldReduceMotion
                ? 0
                : 0.34,
              ease: "easeOut",
            }}
          >
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                opacity-[0.16]
              "
              aria-hidden="true"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(126,34,206,0.22) 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />

            {confettiPieces.map(
              (piece, index) => (
                <motion.span
                  key={`${piece.symbol}-${index}`}
                  aria-hidden="true"
                  className={`
                    pointer-events-none
                    absolute
                    z-20
                    text-2xl
                    ${piece.className}
                  `}
                  initial={
                    shouldReduceMotion
                      ? undefined
                      : {
                          opacity: 0,
                          scale: 0.3,
                          y: -10,
                        }
                  }
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          opacity: [0, 1, 1],
                          scale: [0.3, 1.15, 1],
                          y: [0, -8, 0],
                          rotate: [
                            -12,
                            10,
                            0,
                          ],
                        }
                  }
                  transition={{
                    duration: 1.1,
                    delay: piece.delay,
                    repeat: Infinity,
                    repeatDelay: 2.2,
                  }}
                >
                  {piece.symbol}
                </motion.span>
              )
            )}

            <div
              className="
                relative
                overflow-hidden
                bg-gradient-to-br
                from-pink-100
                via-purple-100
                to-amber-100
                px-6
                pb-10
                pt-9
                text-center
                sm:px-10
              "
            >
              <div
                className="
                  absolute
                  -left-8
                  top-8
                  h-28
                  w-28
                  rounded-full
                  bg-white/45
                  blur-xl
                "
                aria-hidden="true"
              />

              <div
                className="
                  absolute
                  -right-10
                  bottom-4
                  h-32
                  w-32
                  rounded-full
                  bg-pink-200/45
                  blur-xl
                "
                aria-hidden="true"
              />

              <motion.div
                aria-hidden="true"
                className="
                  relative
                  mx-auto
                  w-fit
                  rotate-[-2deg]
                  rounded-[1.75rem]
                  border
                  border-white
                  bg-white
                  p-3
                  shadow-[0_18px_36px_rgba(126,34,206,0.20)]
                "
                initial={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -12,
                        rotate: -8,
                        scale: 0.72,
                      }
                }
                animate={{
                  y: 0,
                  rotate: -2,
                  scale: 1,
                }}
                transition={{
                  delay: shouldReduceMotion
                    ? 0
                    : 0.12,
                  type: "spring",
                  stiffness: 210,
                  damping: 15,
                }}
              >
                <div
                  className="
                    grid
                    size-24
                    place-items-center
                    rounded-[1.35rem]
                    bg-gradient-to-br
                    from-amber-200
                    via-yellow-300
                    to-orange-300
                    text-amber-950
                    shadow-inner
                  "
                >
                  <Trophy
                    className="size-12"
                    strokeWidth={2.2}
                  />
                </div>

                <div className="pt-2 text-xs font-bold uppercase tracking-[0.2em] text-purple-600">
                  You did it
                </div>
              </motion.div>

              <div
                className="
                  mt-6
                  inline-flex
                  rotate-[1deg]
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-purple-200
                  bg-white/75
                  px-4
                  py-2
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-purple-700
                  shadow-sm
                  backdrop-blur
                "
              >
                <Sparkles
                  aria-hidden="true"
                  className="size-4"
                />

                {celebrationLabel}

                <Sparkles
                  aria-hidden="true"
                  className="size-4"
                />
              </div>

              <h2
                id="dashboard-completion-title"
                className="
                  mt-4
                  text-4xl
                  font-black
                  tracking-tight
                  text-slate-900
                  sm:text-5xl
                "
              >
                Beautiful work!
              </h2>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-sm
                  text-sm
                  font-semibold
                  text-purple-700
                "
              >
                Your learning garden just bloomed
                a little more 🌷
              </p>
            </div>

            <div
              className="
                relative
                px-6
                py-8
                text-center
                sm:px-10
              "
            >
              <div
                className="
                  absolute
                  left-1/2
                  top-0
                  h-5
                  w-28
                  -translate-x-1/2
                  -translate-y-1/2
                  rotate-[-2deg]
                  rounded-sm
                  bg-amber-100/90
                  shadow-sm
                "
                aria-hidden="true"
              />

              <p
                id="dashboard-completion-description"
                className="
                  mx-auto
                  max-w-md
                  text-base
                  leading-7
                  text-slate-700
                "
              >
                {description ?? (
                  <>
                    You completed{" "}
                    <span className="font-black text-purple-800">
                      {projectTitle}
                    </span>
                    . Your dashboard skills are
                    blooming beautifully.
                  </>
                )}
              </p>

              <motion.div
                className="
                  mx-auto
                  mt-6
                  inline-flex
                  rotate-[1deg]
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-emerald-200
                  bg-gradient-to-r
                  from-emerald-50
                  to-mint-50
                  px-5
                  py-3
                  text-emerald-900
                  shadow-[0_10px_24px_rgba(16,185,129,0.13)]
                "
                initial={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: 0.75,
                        opacity: 0,
                      }
                }
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  delay: shouldReduceMotion
                    ? 0
                    : 0.28,
                  type: "spring",
                  stiffness: 220,
                  damping: 14,
                }}
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="size-5"
                />

                <span className="font-black">
                  +{xpEarned} XP earned
                </span>

                <span
                  aria-hidden="true"
                  className="text-lg"
                >
                  ✨
                </span>
              </motion.div>

              <div
                className="
                  mx-auto
                  mt-7
                  flex
                  max-w-sm
                  flex-col-reverse
                  gap-3
                  sm:flex-row
                  sm:justify-center
                "
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    min-h-12
                    flex-1
                    rounded-2xl
                    border
                    border-purple-200
                    bg-white
                    px-5
                    py-3
                    font-bold
                    text-purple-700
                    shadow-sm
                    transition
                    hover:-translate-y-0.5
                    hover:bg-purple-50
                    hover:shadow-md
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-purple-400
                    focus-visible:ring-offset-2
                    active:scale-[0.98]
                  "
                >
                  Close
                </button>

                <button
                  ref={continueButtonRef}
                  type="button"
                  onClick={onContinue}
                  className="
                    min-h-12
                    flex-1
                    rounded-2xl
                    bg-gradient-to-r
                    from-purple-600
                    via-fuchsia-500
                    to-pink-500
                    px-6
                    py-3
                    font-black
                    text-white
                    shadow-[0_12px_24px_rgba(192,38,211,0.24)]
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-[0_16px_30px_rgba(192,38,211,0.32)]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-fuchsia-500
                    focus-visible:ring-offset-2
                    active:scale-[0.98]
                  "
                >
                  {continueLabel}
                </button>
              </div>

              <p
                className="
                  mt-5
                  text-xs
                  font-semibold
                  text-slate-500
                "
              >
                Keep going — your next bloom is
                waiting 🌸
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}