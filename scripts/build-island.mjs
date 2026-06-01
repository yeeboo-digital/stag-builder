// Builds the static "island" edition: a fully client-side export with no
// server and no API route.
//
// Isolation: the build runs with distDir=.next-island (set in next.config.js
// when BUILD_TARGET=static) so it never collides with a running `next dev`,
// which owns .next. Next emits the static site into that distDir; we then move
// it to the conventional ./out for deployment.
//
// Next.js static export (`output: 'export'`) cannot include a POST route
// handler, so we temporarily move app/api aside for the build and always
// restore it afterward (even on failure).

import { rename, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const API_DIR = path.resolve("app/api");
const TMP_API_DIR = path.resolve(".api-disabled");
const ISLAND_DIST = path.resolve(".next-island");
const OUT_DIR = path.resolve("out");
const NEXT_BIN = path.resolve(
  "node_modules/.bin",
  process.platform === "win32" ? "next.cmd" : "next"
);

async function main() {
  let movedApi = false;
  if (existsSync(API_DIR)) {
    await rename(API_DIR, TMP_API_DIR);
    movedApi = true;
  }

  let status = 1;
  try {
    const res = spawnSync(NEXT_BIN, ["build"], {
      stdio: "inherit",
      env: {
        ...process.env,
        BUILD_TARGET: "static",
        NEXT_PUBLIC_AI_MODE: "off",
      },
    });
    status = res.status ?? 1;
  } finally {
    if (movedApi) await rename(TMP_API_DIR, API_DIR);
  }

  // On success, publish the static site to ./out (the conventional deploy dir).
  if (status === 0 && existsSync(ISLAND_DIST)) {
    await rm(OUT_DIR, { recursive: true, force: true });
    await rename(ISLAND_DIST, OUT_DIR);
    console.log("\n✓ Island build published to ./out");
  }

  process.exitCode = status;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
