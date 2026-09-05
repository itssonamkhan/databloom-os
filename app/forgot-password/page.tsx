"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=%2Freset-password`,
      });

      if (error) {
        setErrorMessage("We couldn't start the password reset. Please try again.");
      } else {
        setMessage("If an account matches that email, you’ll receive a reset link shortly.");
      }
    } catch {
      setErrorMessage("We couldn't start the password reset. Please try again.");
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
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--databloom-text-accent)] hover:underline"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to Log In
        </Link>

        <div className="mt-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-accent)] shadow-sm">
            <Mail size={30} aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">
            Account recovery
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--databloom-text-heading)]">
            Reset your password
          </h1>
          <p className="mt-3 text-[var(--databloom-text-secondary)]">
            Enter your email and we’ll send a secure reset link if an account matches it.
          </p>
        </div>

        <form className="mt-8 space-y-5" method="post" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="reset-email"
              className="mb-2 block text-sm font-black text-[var(--databloom-text-primary)]"
            >
              Email address
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 w-full rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-input)] px-4 py-3 text-[var(--databloom-text-primary)] outline-none placeholder:text-[var(--databloom-text-muted)] focus:border-[var(--databloom-focus)] focus:ring-2 focus:ring-[var(--databloom-focus)]"
              placeholder="you@example.com"
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
            {isLoading ? "Sending…" : "Send reset link"}
            {!isLoading ? <ArrowRight size={18} aria-hidden="true" /> : null}
          </button>
        </form>
      </section>
    </main>
  );
}
