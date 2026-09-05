import type { Metadata } from "next";

import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Contact DataBloom OS",
  description:
    "Contact DataBloom OS for account help, privacy requests, technical issues, content corrections, and partnership enquiries.",
  alternates: {
    canonical: "https://www.databloomos.com/contact",
  },
};

const contactTopics = [
  "Account help",
  "Privacy request",
  "Account deletion problem",
  "Technical issue",
  "Content correction",
  "Partnership or institutional enquiry",
];

export default function ContactPage() {
  return (
    <LegalPageLayout
      eyebrow="Contact"
      title="Contact DataBloom OS"
      description="Get in touch for account, privacy, technical, content, or partnership questions."
    >
      <LegalSection title="Contact details">
        <p>
          <strong>DataBloom OS</strong><br />
          Operated by Sonam Khan, trading as DataBloom OS<br />
          Jaipur, Rajasthan, India
        </p>
        <p>
          Email: {" "}
          <a
            href="mailto:databloomos@gmail.com"
            className="font-black text-[var(--databloom-text-accent)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
          >
            databloomos@gmail.com
          </a>
        </p>
        <p>We aim to respond within 7 business days.</p>
      </LegalSection>

      <LegalSection title="What you can contact us about">
        <ul className="grid gap-3 sm:grid-cols-2">
          {contactTopics.map((topic) => (
            <li
              key={topic}
              className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-3 font-semibold text-[var(--databloom-text-primary)]"
            >
              {topic}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="Please keep your message safe">
        <p>
          Do not email passwords, authentication codes, financial details, or sensitive
          identification documents. Describe the issue in general terms and include only the
          minimum information needed for us to understand and respond.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
