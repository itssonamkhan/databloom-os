import type { Metadata } from "next";

import WorkSimAttemptWorkspace from "@/components/work-sims/WorkSimAttemptWorkspace";

export const metadata: Metadata = {
  title: "WorkSim assignment | Revenue Up, Profit Down",
  robots: { index: false, follow: false },
};

export default function RetailProfitCrisisAttemptPage() {
  return <WorkSimAttemptWorkspace />;
}
