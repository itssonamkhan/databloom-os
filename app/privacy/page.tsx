import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how DataBloom OS handles account, learning, browser-storage, and limited analytics data.",
  alternates: {
    canonical: "https://www.databloomos.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Privacy"
      title="Privacy Policy"
      description="This policy explains, in plain language, how DataBloom OS handles information when you use its educational and career-preparation tools."
    >
      <p className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-4 text-sm font-semibold">
        Effective date: 5 September 2026
      </p>

      <LegalSection title="Who operates DataBloom OS">
        <p>
          DataBloom OS is operated by Sonam Khan, trading as DataBloom OS, from Jaipur,
          Rajasthan, India. For privacy questions, requests, or grievances, email{" "}
          <a
            href="mailto:databloomos@gmail.com"
            className="font-bold text-[var(--databloom-text-accent)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
          >
            databloomos@gmail.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Information collected for accounts">
        <p>
          If you create an account, DataBloom uses your email address and authentication
          identifiers supplied through Supabase to provide sign-in and account security.
          If you choose Google sign-in, Google and Supabase provide the authentication
          information needed to complete that sign-in, such as the provider identifier and
          account email address. DataBloom does not ask you to send a password by email.
        </p>
      </LegalSection>

      <LegalSection title="Learning information stored in the cloud">
        <p>
          For authenticated learning accounts, DataBloom can store core learning progress
          in Supabase. This includes XP and level, streak information, lesson and practice
          completion identifiers, achievements and reward records, and daily totals such as
          lessons, minutes, XP earned, and completed goals. These records help restore your
          core learning progress when you use the same account.
        </p>
      </LegalSection>

      <LegalSection title="Information kept on your device">
        <p>
          Some information stays in browser storage on the device where you use DataBloom.
          This can include preferences, theme choice, music settings, local notes,
          resume-builder content, interview responses, planner content, flashcards, and
          Mochi conversation data. These items are not part of the current core cloud
          progress sync. They remain on the device until they are cleared, replaced,
          partitioned for a different account, or removed through the account-deletion flow
          where applicable.
        </p>
      </LegalSection>

      <LegalSection title="Cookies, browser storage, and limited analytics">
        <p>
          Supabase uses authentication cookies to keep an authenticated session working.
          DataBloom also uses localStorage for learning state and preferences. To support
          limited product analytics, DataBloom sets a first-party, HttpOnly random visitor
          identifier cookie. It is not an account password or an advertising identifier.
        </p>
        <p>
          The current analytics implementation records limited events such as page views,
          session starts, and feature openings. It records an event name, page path without
          query strings or fragments, timestamp, limited non-sensitive properties, and an
          account identifier only when you are signed in. DataBloom does not use this
          implementation for targeted advertising.
        </p>
      </LegalSection>

      <LegalSection title="How information is used">
        <p>
          DataBloom uses information to authenticate accounts, save learning progress,
          provide study and career-preparation tools, maintain security, operate the
          service, and understand limited product activity so the service can be improved.
          DataBloom does not currently sell personal data.
        </p>
      </LegalSection>

      <LegalSection title="Service providers and international processing">
        <p>
          DataBloom uses Supabase for authentication and database services and Vercel to
          host and deliver the site. Google is used only when you select optional Google
          sign-in. These providers may process information in regions outside India.
        </p>
      </LegalSection>

      <LegalSection title="Retention and account deletion">
        <p>
          Account data is retained while your account is active or reasonably needed to
          provide the service. You can request permanent account deletion from{" "}
          <strong>Profile → Account and privacy</strong>. This permanently deletes the
          login and linked cloud learning progress. Limited security, backup, or legal
          retention may continue for a reasonable period where necessary.
        </p>
        <p>
          If the in-app deletion flow is unavailable, contact{" "}
          <a
            href="mailto:databloomos@gmail.com"
            className="font-bold text-[var(--databloom-text-accent)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
          >
            databloomos@gmail.com
          </a>
          . Device-local information may remain until it is cleared, replaced, or removed
          by the relevant browser/account-cleanup flow.
        </p>
      </LegalSection>

      <LegalSection title="Your choices and rights">
        <p>
          You may contact DataBloom to ask for access to, correction of, or deletion of
          personal information, to withdraw from using the service, or to raise a privacy
          grievance. We may need enough information to verify that a request concerns your
          account before acting on it.
        </p>
      </LegalSection>

      <LegalSection title="Security and age policy">
        <p>
          DataBloom uses reasonable safeguards designed to protect information, but no
          internet service can promise perfect security. Public educational content is
          intended for people aged 13 and older. Account registration is limited to people
          aged 18 and older.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          DataBloom may update this policy as the product changes. The effective date at
          the top shows when it was last updated. Questions can be sent to{" "}
          <Link
            href="/contact"
            className="font-bold text-[var(--databloom-text-accent)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
          >
            the Contact page
          </Link>{" "}
          or to databloomos@gmail.com.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
