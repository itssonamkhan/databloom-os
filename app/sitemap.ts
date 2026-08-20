import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.databloomos.com";

  const routes = [
    "",
    "/profile",
    "/formula-studio",
    "/practice-lab",
    "/career-hub",
    "/planner",
    "/resume-builder",
    "/interview-hub",
    "/analytics",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
