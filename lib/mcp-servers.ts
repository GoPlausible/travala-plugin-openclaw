export const TRAVALA_MCP = {
  id: "travala-mcp",
  name: "Travala Travel MCP",
  description: "Remote Travala travel booking MCP (search, book, pay, confirm)",
  type: "http" as const,
  baseUrl: "https://travel-mcp.travala.com/mcp",
} as const;

// Coinbase Payments MCP — the x402 payment backend for `travala_book`.
// Distributed as an npx installer (`@coinbase/payments-mcp`) that downloads a
// self-contained stdio server to `~/.payments-mcp/bundle.js` and runs it under
// node. The server exposes `make_http_request_with_x402` (USDC on Base) plus
// Bazaar discovery and wallet tools. We vendor the GoPlausible fork as a git
// submodule under `vendor/payments-mcp` for co-development; the runtime install
// still happens via npm/npx, and the server is registered with mcporter as a
// stdio server (see lib/mcporter.ts).
export const PAYMENTS_MCP = {
  id: "payments-mcp",
  name: "Coinbase Payments MCP",
  description: "x402 payments MCP — USDC on Base (make_http_request_with_x402)",
  type: "stdio" as const,
  npmPackage: "@coinbase/payments-mcp",
  installCommand: "npx @coinbase/payments-mcp",
  // The installer drops the stdio server bundle here, under the user's home dir.
  installDirName: ".payments-mcp",
  bundleFile: "bundle.js",
  x402Tool: "make_http_request_with_x402",
} as const;

export const GOPLAUSIBLE_SERVICES = {
  website: "https://goplausible.com",
} as const;
