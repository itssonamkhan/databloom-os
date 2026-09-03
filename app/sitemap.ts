import type { MetadataRoute } from "next";

import { getPublishedArticles } from "@/lib/contentArticles";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.databloomos.com";

  const routes = [
    "",
    "/formula-studio",
    "/practice-lab",
    "/career-hub",
    "/resume-builder",
    "/interview-hub",
    "/learn",
    "/data-analyst-interview-preparation",
  ];

  const staticEntries = routes.map((route) => ({
    url: `${baseUrl}${route}`,
  }));

  try {
    const publishedArticles = await getPublishedArticles();
    const articleEntries = publishedArticles.map((article) => ({
      url: `${baseUrl}/learn/${article.slug}`,
      lastModified: article.updated_at,
    }));

    return [...staticEntries, ...articleEntries];
  } catch {
    return staticEntries;
  }
}
