import { Download } from "lucide-react";

import type { DashboardProject } from "@/lib/dashboardProjects";

export default function DatasetCard({
  project,
}: {
  project: DashboardProject;
}) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
            Project data
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            Dataset preview
          </h2>
          <p className="mt-2 text-gray-700">
            Preview a few rows, then download the complete CSV to begin your analysis.
          </p>
        </div>

        <a
          href={project.datasetFile}
          download
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Download size={19} aria-hidden="true" />
          Download dataset
        </a>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-blue-100">
        <table className="min-w-full border-collapse text-left text-sm text-gray-800">
          <thead className="bg-blue-100 text-blue-950">
            <tr>
              {project.datasetPreview.columns.map((column) => (
                <th key={column} scope="col" className="whitespace-nowrap px-4 py-3 font-bold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100 bg-white">
            {project.datasetPreview.rows.map((row, rowIndex) => (
              <tr key={`${project.id}-row-${rowIndex}`}>
                {row.map((value, columnIndex) => (
                  <td
                    key={`${project.id}-${rowIndex}-${columnIndex}`}
                    className="whitespace-nowrap px-4 py-3"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
