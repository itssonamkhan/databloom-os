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
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
  }));
}
