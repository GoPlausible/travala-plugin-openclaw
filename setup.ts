import { TRAVALA_MCP, PAYMENTS_MCP, GOPLAUSIBLE_SERVICES } from "./lib/mcp-servers.js";

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
  console.log(`    ${PAYMENTS_MCP.name} (stdio) — x402 payment via ${PAYMENTS_MCP.x402Tool}.`);
  console.log(`    Both registered in ~/.mcporter/mcporter.json on first load.`);
  console.log(`    Payment uses USDC on Base via the x402 flow. Install the payment server with:`);
  console.log(`      ${PAYMENTS_MCP.installCommand}\n`);

  console.log("🧳 Travala plugin configured!\n");
  console.log("   Next step: restart OpenClaw gateway.");
  console.log(`   Docs: ${GOPLAUSIBLE_SERVICES.website}\n`);

  return config;
}
