---
name: beacon-hotel
displayName: Hotel / Travel (shortcut)
description: "Shortcut: Onboard a real Hotel / Travel merchant onto Beacon → /ll-beacon-merchant hotel"
version: 1.0.0
category: shortcut
shortcut_for: ll-beacon-merchant
platform: hotel
---

# /beacon-hotel — Shortcut for /ll-beacon-merchant hotel

Runs the full Beacon merchant cycle for a Hotel / Travel store:
connect → catalog sync → integrity screening → publish → live agent discovery.

See /ll-beacon-merchant for full documentation.
Platform notes: direct-merchant path works today — rooms/rate-plans → offers,
tourism licence in attributes (base-tier screening until a tourism-registry
verifier is added via the NewVerifierForRegistry pattern).
