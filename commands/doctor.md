---
name: doctor
displayName: Doctor (shortcut)
description: "Shortcut: Framework-aware diagnose + fix; auto-routes to react-doctor / svelte-doctor / zen -> /ll-doctor"
version: 1.0.0
category: quality
agent: luna-code-review
shortcut_for: ll-doctor
---

# Doctor

Shortcut for `/ll-doctor`.

Reads `package.json`, detects React / Next / Svelte / SvelteKit / Vue /
Nuxt / Solid / Astro, and routes to the right doctor. Falls back to
`/ll-zen` for polyglot repos.
