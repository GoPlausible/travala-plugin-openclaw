import { TRAVALA_MCP, GOPLAUSIBLE_SERVICES } from "./lib/mcp-servers.js";

export interface TravalaPluginConfig {
  // Reserved for future toggles. The Travala plugin currently has no
  // configurable options — booking flows run through the remote MCP server.
}

export async function runSetup(
  _existingConfig?: Partial<TravalaPluginConfig>,
): Promise<TravalaPluginConfig | null> {
  console.log("🧳 Travala Plugin Setup — Built with love by GoPlausible\n");

  const config: TravalaPluginConfig = {};

  console.log("  MCP Server:");
  console.log(`    ${TRAVALA_MCP.name} (remote, http) — hotel search, book, look up, cancel.`);
  console.log(`    Endpoint: ${TRAVALA_MCP.baseUrl}`);
  console.log(`    Registered in ~/.mcporter/mcporter.json on first load.`);
  console.log(`    Payment uses USDC via the Algorand x402 flow (handled by algorand-mcp's`);
  console.log(`    make_http_request_with_x402 tool through the GoPlausible facilitator).\n`);

  console.log("🧳 Travala plugin configured!\n");
  console.log("   Next step: restart OpenClaw gateway.");
  console.log(`   Docs: ${GOPLAUSIBLE_SERVICES.website}\n`);

  return config;
}
