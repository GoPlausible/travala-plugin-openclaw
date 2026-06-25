import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

import { TRAVALA_MCP } from "./mcp-servers.js";

export function mcporterConfigPath(): string {
  return join(homedir(), ".mcporter", "mcporter.json");
}

type McporterStdioEntry = {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  description?: string;
};

type McporterHttpEntry = {
  baseUrl: string;
};

type McporterServerEntry = McporterStdioEntry | McporterHttpEntry;

type McporterConfig = {
  mcpServers: Record<string, McporterServerEntry>;
  imports: string[];
};

function loadMcporterConfig(): { ok: true; cfg: McporterConfig; path: string } | { ok: false; message: string; path: string } {
  const cfgPath = mcporterConfigPath();
  const cfgDir = dirname(cfgPath);
  if (!existsSync(cfgDir)) mkdirSync(cfgDir, { recursive: true });

  if (!existsSync(cfgPath)) {
    return { ok: true, cfg: { mcpServers: {}, imports: [] }, path: cfgPath };
  }
  try {
    const parsed = JSON.parse(readFileSync(cfgPath, "utf-8"));
    return {
      ok: true,
      cfg: {
        mcpServers: parsed.mcpServers ?? {},
        imports: Array.isArray(parsed.imports) ? parsed.imports : [],
      },
      path: cfgPath,
    };
  } catch (err) {
    return { ok: false, message: `Failed to parse ${cfgPath}: ${err}`, path: cfgPath };
  }
}

function isHttpEntry(entry: McporterServerEntry | undefined): entry is McporterHttpEntry {
  return !!entry && "baseUrl" in entry && typeof (entry as McporterHttpEntry).baseUrl === "string";
}

export function isTravelMcpConfigured(): boolean {
  const loaded = loadMcporterConfig();
  if (!loaded.ok) return false;
  return Boolean(loaded.cfg.mcpServers?.[TRAVALA_MCP.id]);
}

/**
 * Register the remote Travala travel MCP under mcpServers["travala-mcp"].
 * mcporter's HTTP transport stores only `{ baseUrl }` in the JSON — no
 * `transport`, `type`, or `description` fields. mcporter infers the HTTP
 * transport from the presence of `baseUrl` (vs `command` for stdio).
 */
export function upsertTravelMcpConfig(): { success: boolean; message: string } {
  const loaded = loadMcporterConfig();
  if (!loaded.ok) return { success: false, message: loaded.message };

  const entry: McporterHttpEntry = { baseUrl: TRAVALA_MCP.baseUrl };

  const existing = loaded.cfg.mcpServers[TRAVALA_MCP.id];
  if (isHttpEntry(existing) && existing.baseUrl === entry.baseUrl) {
    return { success: true, message: `${TRAVALA_MCP.id} already registered in ${loaded.path}` };
  }

  loaded.cfg.mcpServers[TRAVALA_MCP.id] = entry;
  writeFileSync(loaded.path, JSON.stringify(loaded.cfg, null, 2));
  return { success: true, message: `${TRAVALA_MCP.id} registered in ${loaded.path}` };
}
