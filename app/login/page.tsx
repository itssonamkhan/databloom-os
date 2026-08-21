"use client";

import { Suspense, type FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(() =>
    searchParams.get("error") === "auth-failed"
      ? "That sign-in link could not be completed. Please try again."
      : "",
  );
  const [isLoading, setIsLoading] = useState(false);

  function switchMode(signUp: boolean) {
    setIsSignUp(signUp);
    setMessage("");
    setErrorMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });

        if (error) {
          setErrorMessage(error.message);
        } else {
          setMessage("Check your email to confirm your DataBloom account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) setErrorMessage(error.message);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      data-databloom-page
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-4 py-10 sm:px-6"
    >
      <section className="w-full max-w-md rounded-[2rem] border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-6 shadow-xl backdrop-blur-xl sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 text-purple-800 shadow-sm">
            <Sparkles size={30} aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">
            DataBloom OS
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--databloom-text-heading)]">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-3 text-[var(--databloom-text-secondary)]">
            {isSignUp
              ? "Start a cozy, focused learning journey."
              : "Continue learning at your own gentle pace."}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-1.5">
          <button
            type="button"
            onClick={() => switchMode(false)}
            aria-pressed={!isSignUp}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] ${
              !isSignUp
                ? "bg-[var(--databloom-action)] text-[var(--databloom-text-on-accent)] shadow-sm"
                : "text-[var(--databloom-text-secondary)] hover:bg-[var(--databloom-accent-soft)]"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode(true)}
            aria-pressed={isSignUp}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] ${
              isSignUp
                ? "bg-[var(--databloom-action)] text-[var(--databloom-text-on-accent)] shadow-sm"
                : "text-[var(--databloom-text-secondary)] hover:bg-[var(--databloom-accent-soft)]"
            }`}
          >
            Sign Up
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="mb-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-5 py-3 font-black text-[var(--databloom-text-primary)] shadow-sm transition hover:bg-[var(--databloom-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            aria-hidden="true"
            className="grid size-6 place-items-center rounded-full bg-white text-sm font-black text-slate-700 shadow-sm"
          >
            G
          </span>
          Continue with Google
        </button>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-black text-[var(--databloom-text-primary)]"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 w-full rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-input)] px-4 py-3 text-[var(--databloom-text-primary)] outline-none placeholder:text-[var(--databloom-text-muted)] focus:border-[var(--databloom-focus)] focus:ring-2 focus:ring-[var(--databloom-focus)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-black text-[var(--databloom-text-primary)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 w-full rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-input)] px-4 py-3 text-[var(--databloom-text-primary)] outline-none placeholder:text-[var(--databloom-text-muted)] focus:border-[var(--databloom-focus)] focus:ring-2 focus:ring-[var(--databloom-focus)]"
              placeholder="At least 6 characters"
            />
          </div>

          {message ? (
            <p className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-sm font-semibold text-emerald-800" role="status">
              <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
              <span>{message}</span>
            </p>
          ) : null}
          {errorMessage ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-sm font-semibold text-rose-800" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--databloom-action)] px-5 py-3 font-black text-[var(--databloom-text-on-accent)] shadow-md transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Please wait…" : isSignUp ? "Create account" : "Log in"}
            {!isLoading ? <ArrowRight size={18} aria-hidden="true" /> : null}
          </button>
        </form>

        <p className="mt-7 text-center text-xs leading-5 text-[var(--databloom-text-muted)]">
          Your learning progress stays cozy, personal, and ready whenever you return.
        </p>
      </section>
    </main>
  );
}

function LoginLoading() {
  return (
    <main
      data-databloom-page
      className="grid min-h-screen place-items-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-4"
    >
      <p className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] px-5 py-4 font-bold text-[var(--databloom-text-secondary)] shadow-sm">
        Loading DataBloom…
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
