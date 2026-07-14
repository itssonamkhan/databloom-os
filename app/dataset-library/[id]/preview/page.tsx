import { notFound } from "next/navigation";

import DatasetPreview from "@/components/dataset-library/DatasetPreview";
import { datasetLibrary, getDatasetLibraryItem } from "@/lib/datasetLibrary";

export function generateStaticParams() {
  return datasetLibrary.map((dataset) => ({ id: dataset.id }));
}

export default async function DatasetPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dataset = getDatasetLibraryItem(id);
  if (!dataset) notFound();
  return <DatasetPreview key={dataset.id} dataset={dataset} />;
}
