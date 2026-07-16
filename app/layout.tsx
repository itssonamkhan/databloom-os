import type { Metadata } from "next";
import "./globals.css";
import { ProgressProvider } from "@/context/ProgressContext";
import OnboardingGuard from "@/components/onboarding/OnboardingGuard";
import AnalyticsHistoryTracker from "@/components/analytics/AnalyticsHistoryTracker";


export const metadata: Metadata = {
  title: "DataBloom OS",
  description: "Your cozy digital study companion",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" data-databloom-theme="Sakura">

      <body>

        <ProgressProvider>

          <AnalyticsHistoryTracker />

          <OnboardingGuard>
            {children}
          </OnboardingGuard>

        </ProgressProvider>

      </body>

    </html>
  );
}
