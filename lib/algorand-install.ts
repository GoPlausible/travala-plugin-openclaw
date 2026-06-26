import { spawnSync } from "node:child_process";

import { ALGORAND_MCP } from "./mcp-servers.js";

const isWindows = process.platform === "win32";

/**
 * Best-effort pre-fetch of the Algorand MCP package so the first booking does
 * not wait on an npx cold download. Headless-safe: `npm cache add` only
 * downloads the package tarball into the npm cache, it never spawns the MCP
 * server. Failure is non-fatal — npx will fetch on first use regardless.
 */
export function prewarmAlgorandMcp(): { success: boolean; message: string } {
  const res = spawnSync("npm", ["cache", "add", ALGORAND_MCP.spec], {
    stdio: "ignore",
    env: process.env,
    shell: isWindows,
  });

  if (res.error) {
    return { success: false, message: `Could not pre-fetch ${ALGORAND_MCP.spec}: ${res.error.message}` };
  }
  if (typeof res.status === "number" && res.status !== 0) {
    return { success: false, message: `npm cache add exited with code ${res.status}` };
  }
  return { success: true, message: `Pre-fetched ${ALGORAND_MCP.spec} into the npm cache` };
}
