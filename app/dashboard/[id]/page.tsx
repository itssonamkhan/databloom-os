import { notFound } from "next/navigation";

import DashboardProjectDetail from "@/components/dashboard/DashboardProjectDetail";
import {
  dashboardProjects,
  getDashboardProject,
} from "@/lib/dashboardProjects";

export function generateStaticParams() {
  return dashboardProjects.map((project) => ({ id: project.id }));
}

export default async function DashboardProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getDashboardProject(id);

  if (!project) {
    notFound();
  }

  return <DashboardProjectDetail key={project.id} project={project} />;
}
