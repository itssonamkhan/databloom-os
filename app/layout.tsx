import type { Metadata } from "next";
import "./globals.css";
import { ProgressProvider } from "@/context/ProgressContext";
import OnboardingGuard from "@/components/onboarding/OnboardingGuard";
import AnalyticsHistoryTracker from "@/components/analytics/AnalyticsHistoryTracker";
import {
  DATABLOOM_THEME_ATTRIBUTE,
  defaultUserPreferences,
  themes,
  USER_THEME_STORAGE_KEY,
} from "@/lib/userPreferences";


export const metadata: Metadata = {
  title: "DataBloom OS",
  description: "Your cozy digital study companion",
};

const themeInitializationScript = `(() => {
  try {
    const supportedThemes = ${JSON.stringify(themes)};
    let theme = window.localStorage.getItem(${JSON.stringify(USER_THEME_STORAGE_KEY)});
    if (theme === "Clouds") theme = "Cloud";
    if (!supportedThemes.includes(theme)) theme = ${JSON.stringify(defaultUserPreferences.theme)};
    window.localStorage.setItem(${JSON.stringify(USER_THEME_STORAGE_KEY)}, theme);
    document.documentElement.setAttribute(${JSON.stringify(DATABLOOM_THEME_ATTRIBUTE)}, theme);
  } catch {
    document.documentElement.setAttribute(${JSON.stringify(DATABLOOM_THEME_ATTRIBUTE)}, ${JSON.stringify(defaultUserPreferences.theme)});
  }
})();`;


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="en"
      data-databloom-theme={defaultUserPreferences.theme}
      suppressHydrationWarning
    >

      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>

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
