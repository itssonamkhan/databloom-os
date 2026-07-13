import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "app/achievements/page.tsx",
      "app/formula-studio/page.tsx",
      "components/home/Achievements.tsx",
      "components/home/MusicWidget.tsx",
      "components/home/StreakCard.tsx",
      "components/navigation/Navbar.tsx",
      "context/ProgressContext.tsx",
      "features/formula-studio/page.tsx",
    ],
    rules: {
      // These existing components intentionally hydrate browser-only storage
      // after mount. Keep the compiler rule enabled everywhere else.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["components/home/MusicWidget.tsx"],
    rules: {
      // The timer calls a hoisted function declaration; no value is mutated.
      "react-hooks/immutability": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
