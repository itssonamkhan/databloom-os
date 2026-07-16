import { notFound } from "next/navigation";

import CertificationDetail from "@/components/certification-hub/CertificationDetail";
import { certificationCatalog, getCertificationDefinition } from "@/lib/certificationData";

export function generateStaticParams() {
  return certificationCatalog.map((certification) => ({ id: certification.id }));
}

export default async function CertificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const certification = getCertificationDefinition(id);
  if (!certification) notFound();
  return <CertificationDetail certification={certification} />;
}
