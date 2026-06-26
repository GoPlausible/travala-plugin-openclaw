import { TRAVALA_MCP, ALGORAND_MCP, GOPLAUSIBLE_SERVICES } from "./lib/mcp-servers.js";

export interface TravalaPluginConfig {
  // Reserved for future toggles. The Travala plugin currently has no
  // configurable options — booking flows run through the remote MCP server.
}

export async function runSetup(
  _existingConfig?: Partial<TravalaPluginConfig>,
): Promise<TravalaPluginConfig | null> {
  console.log("🧳 Travala Plugin Setup — Built with love by GoPlausible\n");

  const config: TravalaPluginConfig = {};

  console.log("  MCP Servers:");
  console.log(`    ${TRAVALA_MCP.name} (remote, http) — hotel search, book, look up, cancel.`);
  console.log(`    Endpoint: ${TRAVALA_MCP.baseUrl}`);
  console.log(`    ${ALGORAND_MCP.name} (headless stdio) — x402 payment via ${ALGORAND_MCP.x402Tool}.`);
  console.log(`    Run: ${ALGORAND_MCP.installCommand}`);
  console.log(`    Both registered in ~/.mcporter/mcporter.json on first load.`);
  console.log(`    Payment uses x402 micropayments (USDC/ALGO). The Algorand MCP is a headless`);
  console.log(`    stdio server fetched by npx — no GUI, no env vars required.\n`);

  console.log("🧳 Travala plugin configured!\n");
  console.log("   Next step: restart OpenClaw gateway.");
  console.log(`   Docs: ${GOPLAUSIBLE_SERVICES.website}\n`);

  return config;
}
