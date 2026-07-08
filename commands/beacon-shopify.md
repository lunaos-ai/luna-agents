---
name: beacon-shopify
displayName: Shopify (shortcut)
description: "Shortcut: Onboard a real Shopify merchant onto Beacon → /ll-beacon-merchant shopify"
version: 1.0.0
category: shortcut
shortcut_for: ll-beacon-merchant
platform: shopify
---

# /beacon-shopify — Shortcut for /ll-beacon-merchant shopify

Runs the full Beacon merchant cycle for a Shopify store:
connect → catalog sync → integrity screening → publish → live agent discovery.

See /ll-beacon-merchant for full documentation.
Platform notes: embedded Remix app (docs/amliq-session/04-code/beacon-shopify);
needs a Shopify Partner app (SHOPIFY_API_KEY/SECRET, SCOPES=read_products,
BEACON_FEED_URL, BEACON_API_KEY); swap in-memory session storage before distribution.
