import { notFound } from "next/navigation";

import DatasetDetail from "@/components/dataset-library/DatasetDetail";
import { datasetLibrary, getDatasetLibraryItem } from "@/lib/datasetLibrary";

export function generateStaticParams() {
  return datasetLibrary.map((dataset) => ({ id: dataset.id }));
}

export default async function DatasetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dataset = getDatasetLibraryItem(id);
  if (!dataset) notFound();
  return <DatasetDetail key={dataset.id} dataset={dataset} />;
}
