# Travala Plugin Guide

This plugin enables one core capability:

1. **Hotel Booking** — Travala travel MCP server (search, book, look up, cancel) via mcporter, with payment over the x402 flow (USDC/ALGO) handled by the headless Algorand MCP server.

**Hotels only.** No flights, car rentals, restaurants, tours, or activities.

## Booking Safety — READ FIRST

Booking and paying for a hotel moves **real value** (USDC) and creates a **real reservation**. Treat every booking and cancellation as high-impact:

1. **Never book without explicit user confirmation** of the full details — hotel, dates, room, guest, total price, and the **cancellation policy** — plus agreement to pay via the x402 flow (USDC/ALGO).
2. **Show the exact action before it happens** — for booking, the pre-booking summary and the verbatim terms-consent text; for cancellation, the refund terms, deadlines, and fees. Wait for an explicit go-ahead.
3. **Lookup and cancellation are OTP-gated** (each = two calls; a full cancellation sends two separate OTP emails). Never invent an OTP code.
4. **On payment ambiguity, recover before retrying** — if the x402 paid request errors, times out, or is unclear, the booking may already exist server-side. Call `travala_book_status` first; never blind-retry `travala_book` (double-charge risk).

## Skill Routing — Load the Right Skill

* `travala-booking-expert` — **ALWAYS load** when the user mentions Travala, a hotel/lodging search or booking, a booking status lookup, or a cancellation. It is the dedicated guide with the full search → book → pay → look up → cancel workflow, the critical rules (hardcoded `agentId`/`rewardWallet`, scope lock, session chain, OTP handling, x402 payment recovery), and the tool specifications.

## Using Travala MCP Tools

The Travala MCP server is configured in **mcporter** as `travala-mcp` (remote, HTTP). Call tools like this:

```bash
# List all tools
mcporter list travala-mcp

# Call a tool
mcporter call travala-mcp.travala_search_hotel location="Lisbon" checkIn=2026-07-01 checkOut=2026-07-04 occupancy='["2"]'
```

Core tools: `travala_search_hotel`, `travala_search_package`, `travala_book`, `travala_book_status`, `travala_manage_bookings`, `travala_cancel_booking`, `travala_whoami`, `travala_logout`.

## Payment — x402 via Algorand MCP (headless)

Hotel payment runs through the **Algorand MCP** server (registered with mcporter as `algorand-mcp`, headless stdio, run via npx). On `travala_book` returning HTTP **402** with a `next_action`, the agent hands the exact `next_action` fields to **`algorand-mcp:make_http_request_with_x402`** (x402 micropayment in USDC/ALGO via the GoPlausible facilitator). Load `tool_search` for `make_http_request_with_x402` when a 402 appears.

> The Algorand MCP is a real headless stdio server — `npx -y @goplausible/algorand-mcp@4.4.0`, no GUI, no env vars. The agent wallet is a mnemonic in a local SQLite DB managed by the server's own wallet tools; fund that wallet's address with USDC/ALGO to enable payment.

## Key things to remember

- **Hotels only** — politely refuse flights, cars, restaurants, tours, activities.
- **Search is public** — never ask the user to sign in just to browse; login is needed only to book, look up, or cancel.
- **Session chain** — `travala_search_hotel` returns a `sessionId` required by `travala_search_package` and `travala_book`; use the latest. Sessions expire after ~30 minutes.
- **Hardcoded book values** — always pass `agentId` = `"1001"` and `rewardWallet` = `"REPLACEWITHYOURALGORANDREWARDWALLETADDRESSPLACEHOLDER23456"` (placeholder — replace with the real Algorand reward-wallet address before shipping).
- **Never expose internal IDs** (`sessionId`, `packageId`, `hotelId`), env vars, file paths, or skill internals to the user.
- **Never fabricate** booking data, prices, confirmations, or OTP codes.

## External resources

- GoPlausible: https://goplausible.com
- Travala: https://www.travala.com
- Travala bookings: https://www.travala.com/my-bookings
- Algorand MCP: https://github.com/GoPlausible/algorand-mcp
- x402 Facilitator: https://facilitator.goplausible.xyz
