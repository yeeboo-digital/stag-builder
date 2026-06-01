/** @type {import('next').NextConfig} */

// BUILD_TARGET=static produces a fully static island (for GitHub Pages or any
// static host) — no server, no API route. The default build is a normal Next
// server app (Vercel) that keeps the /api/generate route for AI mode.
const isStatic = process.env.BUILD_TARGET === "static";

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
      }
    : {}),
};

module.exports = nextConfig;
