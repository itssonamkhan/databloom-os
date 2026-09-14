import type { Metadata } from "next";

import WorkSimCatalogue from "@/components/work-sims/WorkSimCatalogue";

export const metadata: Metadata = {
  title: "Data Analyst WorkSims",
  description: "Practice realistic, fictional data analyst assignments with DataBloom OS WorkSims.",
  alternates: { canonical: "https://www.databloomos.com/work-sims" },
  openGraph: {
    title: "Data Analyst WorkSims | DataBloom OS",
    description: "Practice realistic, fictional data analyst assignments with DataBloom OS WorkSims.",
    url: "https://www.databloomos.com/work-sims",
  },
};

export default function WorkSimsPage() {
  return <WorkSimCatalogue />;
}
