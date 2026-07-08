---
name: beacon-gmc
displayName: Google Merchant Center (shortcut)
description: "Shortcut: Onboard a real Google Merchant Center merchant onto Beacon → /ll-beacon-merchant gmc"
version: 1.0.0
category: shortcut
shortcut_for: ll-beacon-merchant
platform: gmc
---

# /beacon-gmc — Shortcut for /ll-beacon-merchant gmc

Runs the full Beacon merchant cycle for a Google Merchant Center store:
connect → catalog sync → integrity screening → publish → live agent discovery.

See /ll-beacon-merchant for full documentation.
Platform notes: no connector yet — fast path imports the merchant's existing
Google Shopping feed file (XML/TSV) through a row→BeaconOffer mapper; API path
polls the Content API (products.list). One GMC merchant onboards stores from ANY platform.
