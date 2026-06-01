/** @type {import('next').NextConfig} */

// BUILD_TARGET=static produces a fully static island (for GitHub Pages or any
// static host) — no server, no API route. The default build is a normal Next
// server app (Vercel) that keeps the /api/generate route for AI mode.
const isStatic = process.env.BUILD_TARGET === "static";

// Subdirectory the island is served from, e.g. "/tools/s-tag-builder" when
// hosted at yeeboodigital.com/tools/s-tag-builder/. Empty for root (the Vercel
// demo). Must start with "/" and not end with "/". Only applies to the static
// island build — the server/Vercel build always serves from root.
const islandBasePath = (process.env.ISLAND_BASE_PATH || "").replace(/\/$/, "");

const nextConfig = {
  reactStrictMode: true,
  ...(isStatic
    ? {
        output: "export",
        images: { unoptimized: true },
        trailingSlash: true,
        // Use a separate build dir so the island build never collides with a
        // running `next dev` (which owns .next). Static site still emits to out/.
        distDir: ".next-island",
        // Rewrite asset + page URLs under the subdirectory when set.
        ...(islandBasePath
          ? { basePath: islandBasePath, assetPrefix: islandBasePath }
          : {}),
      }
    : {}),
};

module.exports = nextConfig;
