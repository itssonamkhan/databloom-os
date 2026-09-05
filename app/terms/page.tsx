import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Read the terms for using DataBloom OS educational and career-preparation tools.",
  alternates: {
    canonical: "https://www.databloomos.com/terms",
  },
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Terms"
      title="Terms of Use"
      description="These terms explain the rules for using DataBloom OS educational and career-preparation tools."
    >
      <p className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-4 text-sm font-semibold">
        Effective date: 5 September 2026
      </p>

      <LegalSection title="Acceptance and operator">
        <p>
          By using DataBloom OS, you agree to these Terms of Use. DataBloom OS is operated
          by Sonam Khan, trading as DataBloom OS, from Jaipur, Rajasthan, India. Questions
          about these terms can be sent to{" "}
          <a
            href="mailto:databloomos@gmail.com"
            className="font-bold text-[var(--databloom-text-accent)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
          >
            databloomos@gmail.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Eligibility">
        <p>
          Public educational content is available to people aged 13 and older. Creating or
          using a DataBloom account is limited to people aged 18 and older. By creating an
          account, you confirm that you meet that age requirement.
        </p>
      </LegalSection>

      <LegalSection title="Educational purpose and no guaranteed outcomes">
        <p>
          DataBloom provides educational and career-preparation tools. It does not promise
          employment, an interview invitation or success, a promotion, certification,
          grades, income, or any specific career or financial outcome. Use your own judgment
          when applying learning materials to a real situation.
        </p>
      </LegalSection>

      <LegalSection title="Your account responsibilities">
        <p>
          Keep your account information accurate and protect your sign-in credentials. Do
          not share your account in a way that compromises its security or use another
          person&apos;s account without permission. Tell us about a suspected account-security
          issue by emailing databloomos@gmail.com.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You must not use DataBloom to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>break the law or violate another person&apos;s rights;</li>
          <li>gain unauthorized access to accounts, systems, or data;</li>
          <li>scrape the service at a harmful scale or interfere with its normal operation;</li>
          <li>introduce malware, harmful code, or disruptive automated activity;</li>
          <li>impersonate another person or misrepresent your relationship with DataBloom; or</li>
          <li>abuse progress, XP, reward, or learning systems.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Content and intellectual property">
        <p>
          DataBloom&apos;s product content, design, and branding are protected by applicable
          intellectual-property laws. You retain ownership of original notes and content you
          create in the service. Do not copy, resell, or redistribute DataBloom materials in
          a way that violates applicable law or these terms.
        </p>
      </LegalSection>

      <LegalSection title="AI-assisted material">
        <p>
          AI-generated or AI-assisted material may contain mistakes, omissions, or outdated
          information. Independently verify important information. DataBloom does not provide
          professional, legal, financial, or employment advice.
        </p>
      </LegalSection>

      <LegalSection title="Third-party services and availability">
        <p>
          DataBloom may link to or rely on third-party services, including optional Google
          sign-in and Supabase authentication and storage. Their own terms and privacy
          practices apply. We may change, pause, improve, or discontinue features when
          reasonably necessary, and we do not guarantee uninterrupted availability.
        </p>
      </LegalSection>

      <LegalSection title="Suspension, termination, and deletion">
        <p>
          DataBloom may suspend or terminate access for abuse, security concerns, or a
          material breach of these terms. You may request deletion of your account through
          <strong> Profile → Account and privacy</strong> or contact us if that mechanism
          does not work.
        </p>
      </LegalSection>

      <LegalSection title="No payments currently">
        <p>
          DataBloom does not currently accept payments. If a paid feature is introduced,
          separate terms will be presented before you choose to use it.
        </p>
      </LegalSection>

      <LegalSection title="Liability, law, and disputes">
        <p>
          To the extent permitted by applicable Indian law, DataBloom is not liable for
          indirect, incidental, special, consequential, or punitive losses arising from use
          of the service. These terms are governed by the laws of India. If you have a
          concern, please contact us first so we can try to resolve it in good faith from
          Jaipur, Rajasthan.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          We may update these terms as DataBloom changes. The effective date shows the most
          recent version. Continued use after an update means you accept the updated terms.
          For questions, visit the{" "}
          <Link
            href="/contact"
            className="font-bold text-[var(--databloom-text-accent)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
          >
            Contact page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
