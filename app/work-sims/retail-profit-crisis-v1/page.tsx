import type { Metadata } from "next";

import WorkSimBriefing from "@/components/work-sims/WorkSimBriefing";

export const metadata: Metadata = {
  title: "Revenue Up, Profit Down Data Analyst WorkSim",
  description: "Investigate rising sales and weakening profitability in a fictional retail data analyst WorkSim.",
  alternates: { canonical: "https://www.databloomos.com/work-sims/retail-profit-crisis-v1" },
  openGraph: {
    title: "Revenue Up, Profit Down Data Analyst WorkSim | DataBloom OS",
    description: "Investigate rising sales and weakening profitability in a fictional retail data analyst WorkSim.",
    url: "https://www.databloomos.com/work-sims/retail-profit-crisis-v1",
  },
};

export default function RetailProfitCrisisWorkSimPage() {
  return <WorkSimBriefing />;
}
