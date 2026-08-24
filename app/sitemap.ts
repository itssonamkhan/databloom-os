import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.databloomos.com";

  const routes = [
    "",
    "/formula-studio",
    "/practice-lab",
    "/career-hub",
    "/resume-builder",
    "/interview-hub",
    "/data-analyst-interview-preparation",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
  }));
}
