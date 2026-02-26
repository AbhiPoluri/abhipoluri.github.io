import type { NextConfig } from "next";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isUserOrOrgPagesRepo = repoName?.endsWith(".github.io");
const basePath =
  process.env.NODE_ENV === "production" && repoName && !isUserOrOrgPagesRepo
    ? `/${repoName}`
    : "";

const nextConfig: NextConfig = {
  output: "export", // static HTML export (for GitHub Pages)
  trailingSlash: true, // generates /about/index.html instead of /about.html
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true, // required for static export (no Next.js image server)
  },
};

export default nextConfig;
