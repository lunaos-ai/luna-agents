---
name: ll-beacon-merchant
displayName: Beacon Merchant Onboarding
description: Onboard a real merchant onto Beacon (AMLIQ trust layer) on any platform — Shopify, WooCommerce, BigCommerce, Magento, Wix, Google Merchant Center, hotels, or a generic feed — through the full cycle: connect → sync → integrity screen → publish → live agent discovery
version: 1.0.0
category: commerce
agent: luna-beacon-merchant
parameters:
  - name: platform
    type: string
    description: "Platform: shopify | woocommerce | bigcommerce | magento | wix | gmc | hotel | generic"
    required: true
    prompt: true
  - name: merchant_id
    type: string
    description: Merchant identifier (defaults to the store domain)
    required: false
  - name: api_url
    type: string
    description: Beacon API base URL (e.g. https://api.amliq.finance)
    required: false
  - name: demo_conversion
    type: boolean
    description: After publish, drive a live agent discovery + conversion to prove attribution end to end
    required: false
    default: false
---

# /ll-beacon-merchant — Real Merchant, Full Beacon Cycle

Takes an actual store on any supported platform through the complete Beacon
trust loop: catalog sync → integrity screening (prompt-injection, sanctions,
licence) → merchant publish → verified AI-agent discovery → (optionally) a
token-attributed conversion on the merchant dashboard.

```
/ll-beacon-merchant shopify my-store.myshopify.com
/ll-beacon-merchant woocommerce shop.example.com --demo_conversion
/ll-beacon-merchant gmc            # feed-file import, no connector needed
/ll-beacon-merchant hotel grand-hotel.example
```

## What it does

1. **Collect** — API URL, tenant API key, merchant ID; verify `BEACON_ENABLED`.
2. **Connect** — platform-specific connector setup (see the agent's platform
   table): WP plugin for Woo, Partner app for Shopify, Node service for
   BigCommerce/Magento/Wix, feed-file mapper for GMC, direct REST for
   hotel/generic.
3. **Sync** — push the real catalog to `POST /api/v1/beacon/feed/ingest`.
4. **Screen** — poll publish state while the worker runs the integrity engine;
   report every verdict and flag code honestly (blocked offers are the product
   working).
5. **Publish** — `publish-all` passing offers (merchant opt-in gate).
6. **Verify** — call `beacon_discover_offers` over MCP and confirm the offers
   surface with integrity scores + signed recommendation tokens.
7. **Demo attribution** (`--demo_conversion`) — record a surface event and a
   conversion with the real discovery-minted token; show attributed revenue on
   `GET /api/v1/beacon/merchants/{id}/dashboard`.

## Hard rules

- No fabricated conversions: a conversion requires a token minted by real discovery.
- No bypassing the publish gate or the integrity verdict.
- Fail closed: if screening errors, stop and report — never force-publish.

## Per-platform shortcuts

`/beacon-shopify` · `/beacon-woo` · `/beacon-bigcommerce` · `/beacon-magento` ·
`/beacon-wix` · `/beacon-gmc` · `/beacon-hotel`
