export const TRAVALA_MCP = {
  id: "travala-mcp",
  name: "Travala Travel MCP",
  description: "Remote Travala travel booking MCP (search, book, pay, confirm)",
  type: "http" as const,
  baseUrl: "https://travel-mcp.travala.com/mcp",
} as const;

// Algorand MCP — the x402 payment backend for `travala_book`. A real headless
// stdio MCP server (no GUI), run straight from npm via npx. Exposes
// `make_http_request_with_x402` (x402 micropayments in USDC/ALGO) plus Bazaar
// discovery and Algorand wallet tools. The agent wallet is a mnemonic kept in a
// local SQLite DB managed by the server's own tools — no env vars required and
// nothing to sign in to via a browser, so it runs cleanly in Docker / headless
// VPS targets (unlike Coinbase's Electron-based payments-mcp; see README).
// Registered with mcporter as a stdio server (see lib/mcporter.ts).
export const ALGORAND_MCP = {
  id: "algorand-mcp",
  name: "Algorand MCP",
  description: "Headless x402 payments + Algorand tools (make_http_request_with_x402)",
  type: "stdio" as const,
  npmPackage: "@goplausible/algorand-mcp",
  version: "4.4.0",
  // Run command for the stdio server. Pinned for reproducibility — bump here.
  get spec(): string {
    return `${this.npmPackage}@${this.version}`;
  },
  get installCommand(): string {
    return `npx -y ${this.npmPackage}@${this.version}`;
  },
  x402Tool: "make_http_request_with_x402",
} as const;

export const GOPLAUSIBLE_SERVICES = {
  website: "https://goplausible.com",
  facilitator: "https://facilitator.goplausible.xyz",
} as const;
