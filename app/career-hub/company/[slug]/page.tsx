import { notFound } from "next/navigation";

import CompanyPreparationPage from "@/components/career-hub/CompanyPreparationPage";
import { companies, getCompany } from "@/lib/careerHubData";

export function generateStaticParams() {
  return companies.map((company) => ({ slug: company.slug }));
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) notFound();
  return <CompanyPreparationPage company={company} />;
}
