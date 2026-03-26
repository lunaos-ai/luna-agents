---
name: luna-ls-products
displayName: Luna LemonSqueezy Products
description: Scan project and generate an HTML page with LemonSqueezy product definitions — click-to-copy names, descriptions, pricing, and AI image prompts
version: 1.0.0
category: monetization
parameters:
  - name: output_path
    type: string
    description: Where to save the HTML file
    required: false
    prompt: false
workflow:
  - analyze_project
  - define_products_and_tiers
  - write_html_file
output:
  - scripts/ls-product-descriptions.html (or custom path)
prerequisites: []
---

# Luna LemonSqueezy Product Page Generator

Scan the current project, define products with pricing tiers, and **write a complete HTML file** where every field is click-to-copy — ready to paste into the LemonSqueezy product creation form.

## Step 1 — Analyze the Project

Read these files in the current project:

- `package.json` — name, description
- `README.md` — features, tagline, value prop
- `CLAUDE.md` — mission, target user, architecture
- Marketing / landing pages — hero copy, feature lists
- Any existing pricing, billing config, or plan definitions
- Source structure — to identify capabilities worth gating by tier

From these, extract:
- **Product name** and short selling description
- **Target segments**: solo dev, pro user, team, enterprise
- **Feature list** ranked by customer value
- **Gating dimensions**: API calls, seats, instances, storage, retention, support SLA

## Step 2 — Define Products and Tiers

For each product, create 2–4 pricing tiers:

| Field | Content |
|-------|---------|
| Variant Name | `{Product} {Tier}` e.g. "LunaOS Pro" |
| Price | Monthly USD integer e.g. `149` |
| Description | 2–3 sentences: what's included, limits, support |
| Features | 6–10 checkmark bullets |
| AI Image Prompt | Prompt for generating a product card image |

Pricing rules:
- 3 tiers is ideal, 2–4 acceptable
- ~3–4x price jump between tiers
- Middle tier marked "Most Popular"
- Each tier unlocks meaningful new capabilities

AI image prompt format:
```
Minimal dark SaaS subscription card, 800x400px. Deep dark background (#080B0F) with [accent color] glow. [Icon relevant to product and tier]. Large text "$X/mo" in white bold sans-serif. Label "[Tier]" in [accent]. Small text "[3–4 key features · separated]". Clean, Apple-inspired, no clutter.
```

## Step 3 — Write the HTML File

Generate and **write** a single self-contained HTML file to the output path (default: `scripts/ls-product-descriptions.html`). Create parent directories if needed.

The HTML must follow this exact structure and styling:

### Structure

```
body > .container
  ├── h1 "LemonSqueezy Product Setup"
  ├── p.subtitle with link to app.lemonsqueezy.com/products/new
  ├── .instructions (numbered how-to-use steps)
  ├── .product (repeat per product)
  │   ├── .product-header: h2 product name + .badge "Product N of M · X variants"
  │   ├── .variant "Product Setup"
  │   │   ├── .field: Product Name (click-to-copy)
  │   │   └── .field: Product Description (click-to-copy)
  │   └── .variant (repeat per tier)
  │       ├── .variant-top: name + price
  │       ├── .field: Variant Name (click-to-copy)
  │       ├── .field: Price (click-to-copy) + "USD, Monthly subscription" hint
  │       ├── .field: Description (click-to-copy)
  │       ├── .field: Features (ul.features with checkmark li items)
  │       └── .field: Image AI Prompt (.ai-prompt, click-to-copy, monospace)
  └── script: copyThis()
```

### Styling

```css
body        — #0a0a0a bg, #e5e5e5 text, system font, 40px padding
.container  — max-width 900px, centered
.product    — #222 border, 12px radius
.product-header — #141414 bg, #222 border-bottom
.field-value    — #111 bg, #222 border, hover #444
.field-value.copied — #00E5C3 border + "Copied!" top-right
.variant-price  — #00E5C3 (teal) for primary product, #3B82F6 (blue) for others
.ai-prompt      — #0d1117 bg, #1a2332 border, monospace font
.features li::before — "✓ " in #2ECC7B
```

### JavaScript

```javascript
function copyThis(el) {
  const text = el.innerText;
  navigator.clipboard.writeText(text).then(() => {
    el.classList.add('copied');
    setTimeout(() => el.classList.remove('copied'), 1500);
  });
}
```

Every `.field-value` and `.ai-prompt` element must have `onclick="copyThis(this)"`.

## After Generation

Tell the user:
1. Open the HTML file in a browser
2. Go to [app.lemonsqueezy.com/products/new](https://app.lemonsqueezy.com/products/new)
3. Click any field to copy, paste into the LS form
4. Create product first with name + description, then add variant tiers

