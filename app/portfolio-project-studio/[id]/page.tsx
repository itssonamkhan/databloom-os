import { notFound } from "next/navigation";

import PortfolioProjectDetail from "@/components/portfolio/PortfolioProjectDetail";
import {
  getPortfolioProject,
  portfolioProjects,
} from "@/lib/portfolioProjects";

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({ id: project.id }));
}

export default async function PortfolioProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getPortfolioProject(id);

  if (!project) {
    notFound();
  }

  return <PortfolioProjectDetail key={project.id} project={project} />;
}
