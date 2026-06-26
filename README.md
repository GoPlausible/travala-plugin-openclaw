# OpenClaw Travala Plugin

🧳 Travala hotel booking integration for [OpenClaw](https://openclaw.ai) — by [GoPlausible](https://goplausible.com)

## Features

- **Remote Travala MCP server**: `travala-mcp` (HTTP, `https://travel-mcp.travala.com/mcp`) — hotel search, package selection, booking, lookup, and cancellation
- **x402 payment via Algorand MCP**: on `travala_book` HTTP 402, the agent completes payment through the headless [Algorand MCP](https://github.com/GoPlausible/algorand-mcp) server's `make_http_request_with_x402` tool (USDC/ALGO)
- **Two MCP servers auto-registered**: first-load init writes declarative entries into `~/.mcporter/mcporter.json` — `travala-mcp` (HTTP) and `algorand-mcp` (headless stdio, via npx) — plus a memory file into the agent workspace. No `sudo`, no post-install hooks
- **1 Skill** — `travala-booking-expert`: the end-to-end hotel workflow (search → book → pay → look up → cancel), critical booking rules, OTP handling, and x402 payment recovery

> **Hotels only** — no flights, car rentals, restaurants, tours, or activities.

## Payment — Algorand MCP (headless x402)

Booking and search work on their own, but **payment** uses the x402 flow via [`@goplausible/algorand-mcp`](https://github.com/GoPlausible/algorand-mcp) (`algorand-mcp`, stdio). On `travala_book` HTTP 402, the agent calls `algorand-mcp:make_http_request_with_x402` (x402 micropayment in USDC/ALGO via the GoPlausible facilitator).

It is a **real headless stdio MCP server** — fetched and run by npx, no GUI, **no environment variables required**. The agent wallet is a mnemonic stored in a local SQLite database managed by the server's own tools. The plugin registers the entry in mcporter automatically on first load:

```jsonc
"algorand-mcp": { "command": "npx", "args": ["-y", "@goplausible/algorand-mcp@4.4.0"] }
```

`travala-plugin setup` also pre-fetches the package into the npm cache so the first booking doesn't wait on a cold download.

### Why not Coinbase's payments-mcp?

An earlier iteration targeted `@coinbase/payments-mcp`. It was dropped because it is **fundamentally unfit for headless deployment** (Docker / VPS — OpenClaw's main target):

- `@coinbase/payments-mcp` is an npx **installer** that downloads an **Electron desktop app**, not a server.
- Every MCP tool (including `make_http_request_with_x402`) is a thin proxy that forwards to the app's **Chromium renderer window** (`sendToWindow(...)`), and the renderer loads a Coinbase-hosted URL. A live window must exist for *any* tool to work.
- On a headless host there is no display, so the server **cannot run at all** — no sign-in, no payment. It is only viable on a desktop, or on Linux via `xvfb` + `--no-sandbox` + bundled Chromium libs (heavy, fragile, Linux-only).
- Sign-in is an interactive Electron wallet-UI flow (email + OTP through the renderer), which a headless gateway can't drive.

The Algorand MCP has none of these constraints: plain stdio, key-based signing, no browser. A full inventory of the Coinbase payments-mcp tools and their schemas (captured during evaluation, for peer-mapping) lives in [`.notes/coinbase-payments-mcp-tools.md`](.notes/coinbase-payments-mcp-tools.md).

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
- Registers `algorand-mcp` (headless stdio, via npx) in `~/.mcporter/mcporter.json`

Then restart the OpenClaw gateway to apply changes. The Algorand MCP is fetched by npx on first use (no separate install step); `travala-plugin setup` pre-warms the npm cache.

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
