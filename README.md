# OpenClaw Travala Plugin

🧳 Travala hotel booking integration for [OpenClaw](https://openclaw.ai) — by [GoPlausible](https://goplausible.com)

## Features

- **Remote Travala MCP server**: `travala-mcp` (HTTP, `https://travel-mcp.travala.com/mcp`) — hotel search, package selection, booking, lookup, and cancellation
- **Payment in USDC on Base via x402**: on `travala_book` HTTP 402, the agent completes payment through the Coinbase Payments MCP server's `make_http_request_with_x402` tool
- **Two MCP servers auto-registered**: first-load init writes declarative entries into `~/.mcporter/mcporter.json` — `travala-mcp` (HTTP) and `payments-mcp` (stdio) — plus a memory file into the agent workspace. No `sudo`, no post-install hooks
- **1 Skill** — `travala-booking-expert`: the end-to-end hotel workflow (search → book → pay → look up → cancel), critical booking rules, OTP handling, and x402 payment recovery

> **Hotels only** — no flights, car rentals, restaurants, tours, or activities.

## Payment — Coinbase Payments MCP

Booking and search work on their own, but **payment** uses the x402 flow via the [Coinbase Payments MCP](https://github.com/coinbase/payments-mcp) server (`payments-mcp`, stdio). On `travala_book` HTTP 402, the agent calls `payments-mcp:make_http_request_with_x402` (USDC on Base).

Install the payment server once:

```bash
npx @coinbase/payments-mcp
```

This downloads the stdio server to `~/.payments-mcp/` and sets up your wallet. The plugin registers the `payments-mcp` stdio entry in mcporter automatically on first load.

We vendor the GoPlausible fork of the payments MCP as a git submodule under [`vendor/payments-mcp`](vendor/payments-mcp) for co-development; the runtime install still happens via npm/npx. Clone with submodules:

```bash
git clone --recurse-submodules <repo-url>
# or, in an existing checkout:
git submodule update --init --recursive
```

## Installation

From [ClawHub](https://clawhub.ai):

```bash
clawhub install @goplausible/travala-plugin-openclaw
```

Or from a local path (source code):

```bash
openclaw plugins install ./path/to/travala-plugin-openclaw
```

## Configuration

On first load, the plugin initializes idempotently:

- Writes the plugin memory file into your agent workspace (`memory/travala-plugin.md`)
- Adds a single pointer line under `## Plugin Routing` in your workspace `MEMORY.md`
- Registers `travala-mcp` (remote, HTTP) in `~/.mcporter/mcporter.json`
- Registers `payments-mcp` (Coinbase, stdio) in `~/.mcporter/mcporter.json`

Then install the payment server once (`npx @coinbase/payments-mcp`) and restart the OpenClaw gateway to apply changes.

## CLI

```bash
openclaw travala-plugin setup        # reconfigure (memory, mcporter, allowlist)
openclaw travala-plugin status       # show skill + MCP server status
openclaw travala-plugin mcp-config   # print an MCP config snippet for external agents
```

## Development

```bash
git submodule update --init --recursive   # fetch vendor/payments-mcp
npm install
npm run build   # tsc → dist/
```

## License

MIT © GoPlausible
