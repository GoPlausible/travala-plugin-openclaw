import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TRAVALA_MCP, GOPLAUSIBLE_SERVICES } from "./lib/mcp-servers.js";
import { runSetup, type TravalaPluginConfig } from "./setup.js";
import {
  isTravelMcpConfigured,
  mcporterConfigPath,
  upsertTravelMcpConfig,
} from "./lib/mcporter.js";
import {
  ensureWorkspaceMemoryIndex,
  resolveWorkspaceDir,
  runFirstLoadInit,
  writeMemoryFile,
  writePluginConfig,
  type WorkspaceApi,
} from "./lib/workspace.js";

const PLUGIN_ID = "travala-plugin";
const PKG_NAME = "@goplausible/travala-plugin-openclaw";

// Resolve the package root by walking up from this module's directory until we
// find our own package.json. OpenClaw loads the compiled entry (dist/index.js)
// at runtime, so dirname(import.meta.url) lands inside dist/ — every relative
// asset (memory templates, skills) sits one level above. Walking up by
// package.json identity is robust against future build-output restructures.
function resolvePluginRoot(): string {
  const start = dirname(fileURLToPath(import.meta.url));
  let cur = start;
  for (let i = 0; i < 6; i++) {
    const pkgPath = join(cur, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
        if (pkg.name === PKG_NAME) return cur;
      } catch { /* keep walking */ }
    }
    const parent = dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return start;
}

const PLUGIN_ROOT = resolvePluginRoot();

type OpenClawPluginApi = WorkspaceApi & {
  id: string;
  name: string;
  version?: string;
  pluginConfig?: Partial<TravalaPluginConfig>;
  registerTool: (tool: any, options?: any) => void;
  registerCli: (fn: (ctx: { program: any }) => void, options: any) => void;
};

function register(api: OpenClawPluginApi) {
  const pluginConfig: Partial<TravalaPluginConfig> = api.pluginConfig ?? {};
  const workspacePath = resolveWorkspaceDir(api);

  try { runFirstLoadInit(api, PLUGIN_ROOT, workspacePath); }
  catch (err) { api.logger.warn(`[travala-plugin] first-load init failed: ${err}`); }

  api.registerCli(
    ({ program }) => {
      const travala = program
        .command("travala-plugin")
        .description("Travala hotel booking integration (GoPlausible)");

      travala
        .command("setup")
        .description("Reconfigure Travala plugin (interactive)")
        .action(async () => {
          console.log("\n🧳 Reconfiguring Travala plugin...\n");

          const failures: Array<{ step: string; message: string }> = [];
          const warnings: Array<{ step: string; message: string }> = [];

          const mem = writeMemoryFile(PLUGIN_ROOT, workspacePath);
          console.log(`  ${mem.success ? "✅" : "❌"} ${mem.message}`);
          if (!mem.success) failures.push({ step: "memory file", message: mem.message });

          const memIdx = ensureWorkspaceMemoryIndex(PLUGIN_ROOT, workspacePath);
          console.log(`  ${memIdx.success ? "✅" : "❌"} ${memIdx.message}`);
          if (!memIdx.success) failures.push({ step: "memory index", message: memIdx.message });

          const travel = upsertTravelMcpConfig();
          console.log(`  ${travel.success ? "✅" : "⚠️"} ${travel.message}`);
          if (!travel.success) warnings.push({ step: "mcporter config (travala-mcp)", message: travel.message });

          console.log("");
          const newConfig = await runSetup(pluginConfig);

          // Always apply the OpenClaw config sync (plugins.allow,
          // plugins.entries.<id>.enabled) — even if the wizard returns null,
          // the plugin still needs to be in the allowlist to be visible to
          // the agent. Falls back to the existing pluginConfig.
          const configToWrite = (newConfig ?? pluginConfig) as Record<string, unknown>;
          const result = writePluginConfig(configToWrite);
          if (result.success) {
            console.log("\n✅ OpenClaw config synced (~/.openclaw/openclaw.json)");
            if (result.changes && result.changes.length > 0) {
              for (const c of result.changes) console.log(`   • ${c}`);
            } else {
              console.log("   • already in place — no changes");
            }
          } else {
            console.error(`\n❌ Failed to save OpenClaw config: ${result.error}`);
            failures.push({ step: "openclaw config", message: result.error ?? "unknown error" });
          }

          console.log("");
          if (failures.length === 0 && warnings.length === 0) {
            console.log(`✅ Setup completed successfully (plugin root: ${PLUGIN_ROOT}).`);
            console.log("   Restart gateway to apply: openclaw gateway restart\n");
          } else {
            const verdict = failures.length > 0 ? "❌ Setup completed with errors" : "⚠️  Setup completed with warnings";
            console.log(`${verdict} (plugin root: ${PLUGIN_ROOT}):`);
            for (const f of failures) console.log(`   ❌ ${f.step}: ${f.message}`);
            for (const w of warnings) console.log(`   ⚠️  ${w.step}: ${w.message}`);
            console.log("   Restart gateway to apply what succeeded: openclaw gateway restart\n");
          }
        });

      travala
        .command("status")
        .description("Show Travala plugin status")
        .action(() => {
          const travelOk = isTravelMcpConfigured();

          console.log("\n🧳 Travala Plugin Status\n");
          console.log("  Skills:");
          console.log("    • travala-booking-expert");
          console.log("");
          console.log("  MCP Servers:");
          console.log(`    ${TRAVALA_MCP.id} (http):  ${travelOk ? "✅" : "⚠️ "} ${TRAVALA_MCP.baseUrl}`);
          console.log(`    mcporter.json:       ${mcporterConfigPath()}`);
          console.log("");
          console.log("  Payment:");
          console.log("    USDC via Algorand x402 — handled by algorand-mcp's make_http_request_with_x402");
          console.log(`    Facilitator: ${GOPLAUSIBLE_SERVICES.facilitator}`);
          console.log("");
          console.log("  Links:");
          console.log(`    GoPlausible: ${GOPLAUSIBLE_SERVICES.website}`);
          console.log("");
        });

      travala
        .command("mcp-config")
        .description("Show MCP config snippet for external coding agents (Claude Code, Cursor, etc.)")
        .action(() => {
          console.log("\n🧳 MCP Configuration (Travala)\n");
          console.log("  For external coding agents, add this to their MCP config:\n");
          console.log("  Claude Code (.mcp.json) / Cursor (.cursor/mcp.json):");
          console.log("  ──────────────────────────────────────────────────");
          console.log(`  {`);
          console.log(`    "mcpServers": {`);
          console.log(`      "${TRAVALA_MCP.id}": {`);
          console.log(`        "url": "${TRAVALA_MCP.baseUrl}",`);
          console.log(`        "transport": "http"`);
          console.log(`      }`);
          console.log(`    }`);
          console.log(`  }\n`);
          console.log(`  OpenClaw uses mcporter (~/.mcporter/mcporter.json); the plugin registers`);
          console.log(`  the server automatically on first load.`);
          console.log(`  Note: hotel payment uses USDC via the Algorand x402 flow — install the`);
          console.log(`  GoPlausible Algorand plugin (or algorand-mcp) so make_http_request_with_x402`);
          console.log(`  is available to complete bookings.\n`);
        });
    },
    { commands: ["travala-plugin"] },
  );

  api.logger.info(`Travala plugin registered (skills: 1, MCP: ${TRAVALA_MCP.name})`);
}

// Annotate the export so `tsc --declaration` can emit a portable .d.ts.
// definePluginEntry's return type (DefinedPluginEntry) is not publicly exported
// from the plugin SDK, so without this annotation TS2742 fails the build (the
// inferred type would reference an internal SDK module path). ReturnType<typeof
// definePluginEntry> only names `definePluginEntry`, which we already import.
const pluginEntry: ReturnType<typeof definePluginEntry> = definePluginEntry({
  id: PLUGIN_ID,
  name: "Travala Booking",
  description: "Travala hotel booking integration with MCP and skills — by GoPlausible",
  register,
});

export default pluginEntry;

export const id = PLUGIN_ID;
export const name = "Travala Booking";
