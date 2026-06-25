# OpenClaw Travala Plugin

🧳 Travala hotel booking integration for [OpenClaw](https://openclaw.ai) — by [GoPlausible](https://goplausible.com)

## Features

- **Remote Travala MCP server**: `travala-mcp` (HTTP, `https://travel-mcp.travala.com/mcp`) — hotel search, package selection, booking, lookup, and cancellation
- **Payment in USDC via Algorand x402**: on `travala_book` HTTP 402, the agent completes payment through `algorand-mcp`'s `make_http_request_with_x402` tool and the GoPlausible facilitator
- **Zero-privilege installation**: first-load init only writes a declarative entry into `~/.mcporter/mcporter.json` and a memory file into the agent workspace — no shell scripts, no system packages, no `sudo`, no post-install hooks
- **1 Skill** — `travala-booking-expert`: the end-to-end hotel workflow (search → book → pay → look up → cancel), critical booking rules, OTP handling, and x402 payment recovery

> **Hotels only** — no flights, car rentals, restaurants, tours, or activities.

## Relationship to the Algorand plugin

This plugin was carved out of the GoPlausible Algorand plugin and is fully self-contained. Booking and search work on their own, but **payment** uses the Algorand x402 flow: it calls `algorand-mcp:make_http_request_with_x402`. To complete a paid booking, install the GoPlausible [Algorand plugin](https://github.com/GoPlausible/openclaw-algorand-plugin) (or `algorand-mcp`) alongside this one so that tool is available.

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

Restart the OpenClaw gateway to apply changes.

## CLI

```bash
openclaw travala-plugin setup        # reconfigure (memory, mcporter, allowlist)
openclaw travala-plugin status       # show skill + MCP server status
openclaw travala-plugin mcp-config   # print an MCP config snippet for external agents
```

## Development

```bash
npm install
npm run build   # tsc → dist/
```

## License

MIT © GoPlausible
