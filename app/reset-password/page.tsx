"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (active) setHasSession(Boolean(user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setHasSession(Boolean(session?.user));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Your new password must be at least 8 characters.");
      return;
    }

    if (password !== confirmation) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage("We couldn't update your password. Please request a new reset link and try again.");
      } else {
        setMessage("Your password has been updated. You can now log in with it.");
        setPassword("");
        setConfirmation("");
      }
    } catch {
      setErrorMessage("We couldn't update your password. Please request a new reset link and try again.");
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
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-accent)] shadow-sm">
            <LockKeyhole size={30} aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">
            Account recovery
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--databloom-text-heading)]">
            Choose a new password
          </h1>
          <p className="mt-3 text-[var(--databloom-text-secondary)]">
            Use at least 8 characters for your new DataBloom password.
          </p>
        </div>

        {hasSession === false ? (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm font-semibold leading-6 text-amber-900" role="alert">
            This reset link is missing or has expired. Request a new link to continue.
            <Link href="/forgot-password" className="mt-2 inline-block font-black underline underline-offset-4">
              Request a new link
            </Link>
          </div>
        ) : null}

        {hasSession !== false ? (
          <form className="mt-8 space-y-5" method="post" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-black text-[var(--databloom-text-primary)]"
              >
                New password
              </label>
              <input
                id="new-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-12 w-full rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-input)] px-4 py-3 text-[var(--databloom-text-primary)] outline-none placeholder:text-[var(--databloom-text-muted)] focus:border-[var(--databloom-focus)] focus:ring-2 focus:ring-[var(--databloom-focus)]"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-black text-[var(--databloom-text-primary)]"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="min-h-12 w-full rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-input)] px-4 py-3 text-[var(--databloom-text-primary)] outline-none placeholder:text-[var(--databloom-text-muted)] focus:border-[var(--databloom-focus)] focus:ring-2 focus:ring-[var(--databloom-focus)]"
                placeholder="Repeat your password"
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
              disabled={isLoading || hasSession === null}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--databloom-action)] px-5 py-3 font-black text-[var(--databloom-text-on-accent)] shadow-md transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Updating…" : "Update password"}
              {!isLoading ? <ArrowRight size={18} aria-hidden="true" /> : null}
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}
