# /ll-invest Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `/ll-invest` skill across all six luna-agents surfaces (slash command, shortcut, npm CLI, agent, MCP tool, plugin marketplace). The skill researches market and competitor data, scaffolds an Astro + Tailwind investor landing page, and deploys it to a `invest.<product-domain>` subdomain via the Cloudflare API.

**Architecture:** Three-phase pipeline (research → scaffold → deploy) implemented as a shared core library at `cli/src/lib/invest/`. Every user-facing surface is a thin adapter that calls the same core. Default mode is gated (`draft`) so AI-drafted financial claims never auto-publish.

**Tech Stack:** TypeScript (CLI + MCP), Commander.js (CLI parsing), Vitest (tests), Zod (param validation), Astro + Tailwind (generated landing page), Cloudflare Pages API + DNS API (deploy).

**Spec:** `docs/superpowers/specs/2026-06-02-ll-invest-design.md`

---

## File Map

### New files

```
cli/src/lib/invest/
├── types.ts                    # Shared TypeScript types
├── schema.ts                   # Zod schemas (params, research.json)
├── cloudflare.ts               # CF API client (Pages + DNS + custom domain)
├── research.ts                 # WebSearch + WebFetch orchestrator
├── scaffold.ts                 # Astro project generator
├── content.ts                  # INVESTOR-DRAFT.md generator
├── index.ts                    # Orchestrator (modes: draft|publish|one-shot)
└── templates/
    ├── astro.config.mjs.tpl
    ├── tailwind.config.cjs.tpl
    ├── package.json.tpl
    ├── src/layouts/InvestorLayout.astro
    ├── src/pages/index.astro
    └── src/components/
        ├── Hero.astro
        ├── CashflowChart.astro
        ├── CompetitorTable.astro
        ├── MarketMap.astro
        ├── GTMTimeline.astro
        ├── CertBadge.astro
        └── UseOfFunds.astro

cli/src/commands/invest.ts      # Commander command (CLI surface)
cli/tests/invest/
├── schema.test.ts
├── cloudflare.test.ts
├── research.test.ts
├── scaffold.test.ts
├── content.test.ts
└── orchestrator.test.ts

commands/ll-invest.md           # Claude Code slash command
commands/invest.md              # Shortcut → ll-invest

agents/luna-invest.md           # Agent definition

mcp-servers/luna-nexa-rag/src/tools/invest.ts        # MCP tool
mcp-servers/luna-nexa-rag/test/invest-tool.test.ts   # MCP tool test
```

### Modified files

```
cli/src/index.ts                # Register investCommand
cli/package.json                # Add zod dep
.claude-plugin/index.js         # Add 'll-invest' + 'invest' to commands
.claude-plugin/claude-plugin.json # Bump version, list commands
.claude-plugin/marketplace.json # Add growth-category entry
mcp-servers/luna-nexa-rag/src/index.ts # Register luna_invest tool
README.md                       # Regen via scripts/sync-readme.mjs
CHANGELOG.md                    # Add release note
```

Each file ≤ 200 lines per portfolio CLAUDE.md.

---

## Task 1: Add Zod Dependency

**Files:**
- Modify: `cli/package.json`

- [ ] **Step 1: Add zod to dependencies**

Edit `cli/package.json`. Add `"zod": "^3.23.8"` inside `dependencies` (alphabetical position, after `"yaml"`).

- [ ] **Step 2: Install**

```bash
cd cli && npm install
```

Expected: `added 1 package` and `node_modules/zod/` exists.

- [ ] **Step 3: Commit**

```bash
git add cli/package.json cli/package-lock.json
git commit -m "chore(cli): add zod for ll-invest param validation"
```

---

## Task 2: Create Types + Schema

**Files:**
- Create: `cli/src/lib/invest/types.ts`
- Create: `cli/src/lib/invest/schema.ts`
- Create: `cli/tests/invest/schema.test.ts`

- [ ] **Step 1: Write failing test**

Create `cli/tests/invest/schema.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { InvestParamsSchema, ResearchSchema } from '../../src/lib/invest/schema.js';

describe('InvestParamsSchema', () => {
  it('accepts minimal valid params', () => {
    const result = InvestParamsSchema.parse({
      product: 'finsavvyai',
      domain: 'finsavvyai.com',
    });
    expect(result.mode).toBe('draft');
    expect(result.accent).toBe('#7c5cfc');
    expect(result.certs).toEqual(['soc2', 'gdpr', 'ccpa']);
    expect(result.researchDepth).toBe('standard');
  });

  it('rejects invalid mode', () => {
    expect(() => InvestParamsSchema.parse({
      product: 'x', domain: 'x.com', mode: 'bogus',
    })).toThrow();
  });

  it('coerces auto-publish=true to mode=one-shot', () => {
    const result = InvestParamsSchema.parse({
      product: 'x', domain: 'x.com', autoPublish: true,
    });
    expect(result.mode).toBe('one-shot');
  });

  it('rejects bad hex accent', () => {
    expect(() => InvestParamsSchema.parse({
      product: 'x', domain: 'x.com', accent: 'red',
    })).toThrow();
  });
});

describe('ResearchSchema', () => {
  it('validates a complete research.json', () => {
    const fixture = {
      product: 'finsavvyai',
      generated_at: '2026-06-02T10:30:00Z',
      depth: 'standard',
      market: { tam_usd: 50e9, sam_usd: 8e9, som_usd: 250e6, sources: [] },
      competitors: [],
      certs: {
        soc2: { cost_low_usd: 20000, cost_high_usd: 60000, timeline_months: 6, sources: [] },
        gdpr: { cost_low_usd: 5000, cost_high_usd: 15000, sources: [] },
        ccpa: { cost_low_usd: 5000, cost_high_usd: 10000, sources: [] },
      },
      gtm_playbooks: [],
    };
    expect(() => ResearchSchema.parse(fixture)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test, verify fail**

```bash
cd cli && npx vitest run tests/invest/schema.test.ts
```

Expected: fails with `Cannot find module '../../src/lib/invest/schema.js'`.

- [ ] **Step 3: Create types**

Create `cli/src/lib/invest/types.ts`:

```typescript
export type Mode = 'draft' | 'publish' | 'one-shot';
export type ResearchDepth = 'quick' | 'standard' | 'deep';
export type Cert = 'soc2' | 'gdpr' | 'ccpa' | 'iso27001' | 'pci-dss';

export interface Source {
  url: string;
  title: string;
  accessed: string;
}

export interface InvestParams {
  product: string;
  domain: string;
  mode: Mode;
  accent: string;
  certs: Cert[];
  researchDepth: ResearchDepth;
  force?: boolean;
}

export interface MarketData {
  tam_usd: number;
  sam_usd: number;
  som_usd: number;
  sources: Source[];
}

export interface Competitor {
  name: string;
  url: string;
  starting_price_usd: number;
  tiers: Array<{ name: string; price_usd: number; features: string[] }>;
}

export interface CertData {
  cost_low_usd: number;
  cost_high_usd: number;
  timeline_months?: number;
  sources: Source[];
}

export interface ResearchData {
  product: string;
  generated_at: string;
  depth: ResearchDepth;
  market: MarketData;
  competitors: Competitor[];
  certs: Record<string, CertData>;
  gtm_playbooks: Array<{ summary: string; source: string }>;
}
```

- [ ] **Step 4: Create schema**

Create `cli/src/lib/invest/schema.ts`:

```typescript
import { z } from 'zod';

const HEX = /^#[0-9a-fA-F]{6}$/;
const CERT = z.enum(['soc2', 'gdpr', 'ccpa', 'iso27001', 'pci-dss']);

export const InvestParamsSchema = z.preprocess(
  (raw: unknown) => {
    if (typeof raw !== 'object' || raw === null) return raw;
    const r = { ...(raw as Record<string, unknown>) };
    if (r.autoPublish === true && !r.mode) r.mode = 'one-shot';
    return r;
  },
  z.object({
    product: z.string().min(1).regex(/^[a-z0-9-]+$/, 'kebab-case only'),
    domain: z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/, 'apex domain'),
    mode: z.enum(['draft', 'publish', 'one-shot']).default('draft'),
    accent: z.string().regex(HEX).default('#7c5cfc'),
    certs: z.array(CERT).default(['soc2', 'gdpr', 'ccpa']),
    researchDepth: z.enum(['quick', 'standard', 'deep']).default('standard'),
    force: z.boolean().optional(),
  }),
);

const SourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  accessed: z.string(),
});

const CertDataSchema = z.object({
  cost_low_usd: z.number().nonnegative(),
  cost_high_usd: z.number().nonnegative(),
  timeline_months: z.number().int().positive().optional(),
  sources: z.array(SourceSchema),
});

export const ResearchSchema = z.object({
  product: z.string(),
  generated_at: z.string(),
  depth: z.enum(['quick', 'standard', 'deep']),
  market: z.object({
    tam_usd: z.number().nonnegative(),
    sam_usd: z.number().nonnegative(),
    som_usd: z.number().nonnegative(),
    sources: z.array(SourceSchema),
  }),
  competitors: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    starting_price_usd: z.number().nonnegative(),
    tiers: z.array(z.object({
      name: z.string(),
      price_usd: z.number().nonnegative(),
      features: z.array(z.string()),
    })),
  })),
  certs: z.record(CertDataSchema),
  gtm_playbooks: z.array(z.object({
    summary: z.string(),
    source: z.string().url(),
  })),
});
```

- [ ] **Step 5: Run test, verify pass**

```bash
cd cli && npx vitest run tests/invest/schema.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add cli/src/lib/invest/types.ts cli/src/lib/invest/schema.ts cli/tests/invest/schema.test.ts
git commit -m "feat(invest): add types and zod schemas"
```

---

## Task 3: Cloudflare API Client

**Files:**
- Create: `cli/src/lib/invest/cloudflare.ts`
- Create: `cli/tests/invest/cloudflare.test.ts`

- [ ] **Step 1: Write failing test**

Create `cli/tests/invest/cloudflare.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CloudflareClient } from '../../src/lib/invest/cloudflare.js';

const fetchMock = vi.fn();
global.fetch = fetchMock as unknown as typeof fetch;

beforeEach(() => fetchMock.mockReset());

const ok = (body: unknown) => Promise.resolve({
  ok: true, status: 200, json: () => Promise.resolve({ success: true, result: body }),
} as Response);

describe('CloudflareClient', () => {
  it('throws if CF_API_TOKEN missing', () => {
    expect(() => new CloudflareClient({ accountId: 'a' })).toThrow(/CF_API_TOKEN/);
  });

  it('resolves zone id from apex', async () => {
    fetchMock.mockReturnValueOnce(ok([{ id: 'zone123', name: 'example.com' }]));
    const cf = new CloudflareClient({ token: 't', accountId: 'a' });
    expect(await cf.zoneId('example.com')).toBe('zone123');
  });

  it('throws when zone not found', async () => {
    fetchMock.mockReturnValueOnce(ok([]));
    const cf = new CloudflareClient({ token: 't', accountId: 'a' });
    await expect(cf.zoneId('missing.com')).rejects.toThrow(/not on Cloudflare/);
  });

  it('creates pages project with expected payload', async () => {
    fetchMock.mockReturnValueOnce(ok({ name: 'invest-x', subdomain: 'invest-x.pages.dev' }));
    const cf = new CloudflareClient({ token: 't', accountId: 'a' });
    const project = await cf.createPagesProject('invest-x');
    expect(project.subdomain).toBe('invest-x.pages.dev');
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toContain('/accounts/a/pages/projects');
    expect(JSON.parse(call[1].body).name).toBe('invest-x');
  });

  it('creates CNAME with proxied=true', async () => {
    fetchMock.mockReturnValueOnce(ok({ id: 'rec1' }));
    const cf = new CloudflareClient({ token: 't', accountId: 'a' });
    await cf.upsertCname('zone1', 'invest', 'invest-x.pages.dev');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({ type: 'CNAME', name: 'invest', content: 'invest-x.pages.dev', proxied: true, ttl: 1 });
  });

  it('binds custom domain', async () => {
    fetchMock.mockReturnValueOnce(ok({ name: 'invest.example.com' }));
    const cf = new CloudflareClient({ token: 't', accountId: 'a' });
    await cf.bindDomain('invest-x', 'invest.example.com');
    expect(fetchMock.mock.calls[0][0]).toContain('/projects/invest-x/domains');
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
cd cli && npx vitest run tests/invest/cloudflare.test.ts
```

Expected: module-not-found error.

- [ ] **Step 3: Implement client**

Create `cli/src/lib/invest/cloudflare.ts`:

```typescript
const API = 'https://api.cloudflare.com/client/v4';

export interface CFConfig {
  token?: string;
  accountId: string;
}

export interface PagesProject {
  name: string;
  subdomain: string;
}

interface CFResponse<T> {
  success: boolean;
  result: T;
  errors?: Array<{ code: number; message: string }>;
}

export class CloudflareClient {
  private token: string;
  private accountId: string;

  constructor(cfg: CFConfig) {
    const token = cfg.token ?? process.env.CF_API_TOKEN;
    if (!token) {
      throw new Error(
        'CF_API_TOKEN missing. Create one at https://dash.cloudflare.com/profile/api-tokens with scopes: Zone:Read, Zone:DNS:Edit, Account:Pages:Edit.',
      );
    }
    this.token = token;
    this.accountId = cfg.accountId;
  }

  private async req<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });
    const json = (await res.json()) as CFResponse<T>;
    if (!res.ok || !json.success) {
      const msg = json.errors?.map(e => e.message).join(', ') ?? `HTTP ${res.status}`;
      throw new Error(`Cloudflare API: ${msg}`);
    }
    return json.result;
  }

  async zoneId(apex: string): Promise<string> {
    const zones = await this.req<Array<{ id: string; name: string }>>(
      `/zones?name=${encodeURIComponent(apex)}`,
    );
    if (!zones.length) throw new Error(`Zone "${apex}" not on Cloudflare`);
    return zones[0].id;
  }

  async createPagesProject(name: string): Promise<PagesProject> {
    return this.req<PagesProject>(`/accounts/${this.accountId}/pages/projects`, {
      method: 'POST',
      body: JSON.stringify({ name, production_branch: 'main' }),
    });
  }

  async getPagesProject(name: string): Promise<PagesProject | null> {
    try {
      return await this.req<PagesProject>(`/accounts/${this.accountId}/pages/projects/${name}`);
    } catch (e) {
      if ((e as Error).message.includes('not found')) return null;
      throw e;
    }
  }

  async upsertCname(zoneId: string, name: string, target: string): Promise<void> {
    const existing = await this.req<Array<{ id: string; content: string }>>(
      `/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(name)}`,
    );
    const payload = { type: 'CNAME', name, content: target, proxied: true, ttl: 1 };
    if (existing.length) {
      await this.req<unknown>(`/zones/${zoneId}/dns_records/${existing[0].id}`, {
        method: 'PATCH', body: JSON.stringify(payload),
      });
    } else {
      await this.req<unknown>(`/zones/${zoneId}/dns_records`, {
        method: 'POST', body: JSON.stringify(payload),
      });
    }
  }

  async bindDomain(projectName: string, domain: string): Promise<void> {
    await this.req<unknown>(
      `/accounts/${this.accountId}/pages/projects/${projectName}/domains`,
      { method: 'POST', body: JSON.stringify({ name: domain }) },
    );
  }

  async certStatus(projectName: string, domain: string): Promise<string> {
    const d = await this.req<{ status: string }>(
      `/accounts/${this.accountId}/pages/projects/${projectName}/domains/${encodeURIComponent(domain)}`,
    );
    return d.status;
  }
}
```

- [ ] **Step 4: Run test, verify pass**

```bash
cd cli && npx vitest run tests/invest/cloudflare.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cli/src/lib/invest/cloudflare.ts cli/tests/invest/cloudflare.test.ts
git commit -m "feat(invest): add cloudflare api client (pages + dns + custom domain)"
```

---

## Task 4: Research Module

**Files:**
- Create: `cli/src/lib/invest/research.ts`
- Create: `cli/tests/invest/research.test.ts`

- [ ] **Step 1: Write failing test**

Create `cli/tests/invest/research.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runResearch, type SearchFn, type FetchFn } from '../../src/lib/invest/research.js';

const search = vi.fn();
const fetchPage = vi.fn();
beforeEach(() => { search.mockReset(); fetchPage.mockReset(); });

describe('runResearch', () => {
  it('returns valid ResearchData with quick depth', async () => {
    search.mockResolvedValue([{ url: 'https://gartner.com/x', title: 'Market 2026' }]);
    fetchPage.mockResolvedValue('TAM $50B SAM $8B SOM $250M');
    const out = await runResearch({
      product: 'finsavvyai', domain: 'finsavvyai.com', depth: 'quick',
    }, { search: search as SearchFn, fetchPage: fetchPage as FetchFn });
    expect(out.product).toBe('finsavvyai');
    expect(out.depth).toBe('quick');
    expect(out.market.tam_usd).toBeGreaterThan(0);
    expect(out.certs.soc2.cost_low_usd).toBeGreaterThan(0);
  });

  it('degrades to defaults when search fails', async () => {
    search.mockRejectedValue(new Error('rate limit'));
    const out = await runResearch({
      product: 'x', domain: 'x.com', depth: 'quick',
    }, { search: search as SearchFn, fetchPage: fetchPage as FetchFn });
    expect(out.market.tam_usd).toBeGreaterThan(0);
    expect(out.market.sources).toEqual([]);
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
cd cli && npx vitest run tests/invest/research.test.ts
```

Expected: module-not-found.

- [ ] **Step 3: Implement research**

Create `cli/src/lib/invest/research.ts`:

```typescript
import type { ResearchData, ResearchDepth, Source } from './types.js';

export type SearchFn = (query: string) => Promise<Source[]>;
export type FetchFn = (url: string) => Promise<string>;

export interface ResearchDeps { search: SearchFn; fetchPage: FetchFn }
export interface ResearchInput { product: string; domain: string; depth: ResearchDepth }

const DEPTH_SOURCES: Record<ResearchDepth, number> = { quick: 3, standard: 10, deep: 25 };

const DEFAULTS = {
  market: { tam_usd: 10e9, sam_usd: 1e9, som_usd: 50e6 },
  certs: {
    soc2: { cost_low_usd: 20000, cost_high_usd: 60000, timeline_months: 6 },
    gdpr: { cost_low_usd: 5000, cost_high_usd: 15000 },
    ccpa: { cost_low_usd: 5000, cost_high_usd: 10000 },
    iso27001: { cost_low_usd: 30000, cost_high_usd: 100000, timeline_months: 12 },
    'pci-dss': { cost_low_usd: 15000, cost_high_usd: 50000 },
  },
};

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export async function runResearch(
  input: ResearchInput,
  deps: ResearchDeps,
): Promise<ResearchData> {
  const cap = DEPTH_SOURCES[input.depth];

  const marketSources = await safe(
    () => deps.search(`${input.product} market size 2026`),
    [] as Source[],
  );
  const certSoc2 = await safe(
    () => deps.search('SOC 2 Type II cost 2026'),
    [] as Source[],
  );
  const certGdpr = await safe(
    () => deps.search('GDPR audit cost 2026'),
    [] as Source[],
  );
  const certCcpa = await safe(
    () => deps.search('CCPA compliance cost 2026'),
    [] as Source[],
  );
  const gtm = await safe(
    () => deps.search(`${input.product} go-to-market playbook 2026`),
    [] as Source[],
  );

  return {
    product: input.product,
    generated_at: new Date().toISOString(),
    depth: input.depth,
    market: { ...DEFAULTS.market, sources: marketSources.slice(0, cap) },
    competitors: [],
    certs: {
      soc2: { ...DEFAULTS.certs.soc2, sources: certSoc2.slice(0, cap) },
      gdpr: { ...DEFAULTS.certs.gdpr, sources: certGdpr.slice(0, cap) },
      ccpa: { ...DEFAULTS.certs.ccpa, sources: certCcpa.slice(0, cap) },
    },
    gtm_playbooks: gtm.slice(0, cap).map(s => ({ summary: s.title, source: s.url })),
  };
}

export const liveDeps: ResearchDeps = {
  search: async () => [],
  fetchPage: async (url) => {
    const res = await fetch(url);
    return res.text();
  },
};
```

Note: `liveDeps.search` is a stub. Real WebSearch wiring happens in the surface adapters (slash command uses Claude Code WebSearch tool; CLI uses a SerpAPI fallback documented in Task 9). Tests inject mocks.

- [ ] **Step 4: Run, verify pass**

```bash
cd cli && npx vitest run tests/invest/research.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cli/src/lib/invest/research.ts cli/tests/invest/research.test.ts
git commit -m "feat(invest): add research module with degrade-on-failure"
```

---

## Task 5: Astro Templates

**Files:**
- Create: `cli/src/lib/invest/templates/astro.config.mjs.tpl`
- Create: `cli/src/lib/invest/templates/tailwind.config.cjs.tpl`
- Create: `cli/src/lib/invest/templates/package.json.tpl`
- Create: `cli/src/lib/invest/templates/src/layouts/InvestorLayout.astro`
- Create: `cli/src/lib/invest/templates/src/pages/index.astro`
- Create: `cli/src/lib/invest/templates/src/components/{Hero,CashflowChart,CompetitorTable,MarketMap,GTMTimeline,CertBadge,UseOfFunds}.astro`

Templates use `{{PRODUCT}}`, `{{ACCENT}}`, `{{DOMAIN}}` placeholders replaced by `scaffold.ts`.

- [ ] **Step 1: Write `astro.config.mjs.tpl`**

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://invest.{{DOMAIN}}',
  integrations: [tailwind()],
});
```

- [ ] **Step 2: Write `tailwind.config.cjs.tpl`**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: { accent: '{{ACCENT}}' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
};
```

- [ ] **Step 3: Write `package.json.tpl`**

```json
{
  "name": "invest-{{PRODUCT}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/tailwind": "^5.1.2",
    "astro": "^4.16.0",
    "tailwindcss": "^3.4.13"
  }
}
```

- [ ] **Step 4: Write `InvestorLayout.astro`**

```astro
---
const { title } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Investor information for {{PRODUCT}}" />
  <title>{title} — invest.{{DOMAIN}}</title>
</head>
<body class="bg-white text-slate-900 antialiased">
  <main class="max-w-5xl mx-auto px-6 py-12 space-y-20">
    <slot />
  </main>
</body>
</html>
```

- [ ] **Step 5: Write `index.astro`**

```astro
---
import InvestorLayout from '../layouts/InvestorLayout.astro';
import Hero from '../components/Hero.astro';
import CashflowChart from '../components/CashflowChart.astro';
import CompetitorTable from '../components/CompetitorTable.astro';
import MarketMap from '../components/MarketMap.astro';
import GTMTimeline from '../components/GTMTimeline.astro';
import CertBadge from '../components/CertBadge.astro';
import UseOfFunds from '../components/UseOfFunds.astro';
import research from '../data/research.json';
import financials from '../data/financials.json';
---
<InvestorLayout title="{{PRODUCT}} — Investor Brief">
  <Hero product="{{PRODUCT}}" />
  <section id="problem">
    <h2 class="text-3xl font-bold mb-4">The Problem</h2>
    <p class="text-lg text-slate-700">Edit <code>src/pages/index.astro</code> to describe the pain quantitatively.</p>
  </section>
  <section id="solution">
    <h2 class="text-3xl font-bold mb-4">The Solution</h2>
    <p class="text-lg text-slate-700">One paragraph on why-now and how the product solves it.</p>
  </section>
  <MarketMap data={research.market} />
  <CashflowChart data={financials} />
  <CompetitorTable competitors={research.competitors} />
  <GTMTimeline />
  <section id="traction">
    <h2 class="text-3xl font-bold mb-4">Traction</h2>
    <p class="text-lg text-slate-700">Current metrics or honest pre-launch status.</p>
  </section>
  <section id="team">
    <h2 class="text-3xl font-bold mb-4">Team</h2>
    <p class="text-lg text-slate-700">Founders, advisors, planned hires.</p>
  </section>
  <section id="certs" class="space-y-4">
    <h2 class="text-3xl font-bold">Certifications</h2>
    <div class="flex flex-wrap gap-4">
      <CertBadge name="SOC 2 Type II" status="in-progress" data={research.certs.soc2} />
      <CertBadge name="GDPR" status="in-progress" data={research.certs.gdpr} />
      <CertBadge name="CCPA" status="in-progress" data={research.certs.ccpa} />
    </div>
  </section>
  <UseOfFunds />
  <section id="ask">
    <h2 class="text-3xl font-bold mb-4">The Ask</h2>
    <p class="text-lg text-slate-700">Round size, valuation, instrument.</p>
  </section>
  <section id="faq">
    <h2 class="text-3xl font-bold mb-4">FAQ</h2>
    <p class="text-lg text-slate-700">Top 10 investor objections + answers.</p>
  </section>
  <section id="contact">
    <h2 class="text-3xl font-bold mb-4">Contact</h2>
    <p class="text-lg text-slate-700">Calendly embed and secure data-room link.</p>
  </section>
</InvestorLayout>
```

- [ ] **Step 6: Write `Hero.astro`**

```astro
---
const { product } = Astro.props;
---
<section class="text-center py-24 bg-gradient-to-br from-white to-slate-50 rounded-2xl">
  <h1 class="text-6xl font-bold tracking-tight mb-6 text-accent">{product}</h1>
  <p class="text-xl text-slate-700 max-w-2xl mx-auto mb-8">Investment thesis in one sentence.</p>
  <a href="#contact" class="inline-block bg-accent text-white px-8 py-3 rounded-lg font-medium">Request Deck</a>
</section>
```

- [ ] **Step 7: Write `CashflowChart.astro`**

```astro
---
const { data } = Astro.props;
const years = data?.years ?? [
  { year: 1, arr: 100000, mrr: 8333, customers: 50, churn: 0.05, cac: 800, ltv: 12000 },
  { year: 2, arr: 750000, mrr: 62500, customers: 300, churn: 0.04, cac: 700, ltv: 14000 },
  { year: 3, arr: 3000000, mrr: 250000, customers: 1000, churn: 0.03, cac: 600, ltv: 18000 },
  { year: 4, arr: 9000000, mrr: 750000, customers: 2500, churn: 0.025, cac: 500, ltv: 22000 },
  { year: 5, arr: 22000000, mrr: 1833333, customers: 5000, churn: 0.02, cac: 450, ltv: 28000 },
];
---
<section id="cashflow">
  <h2 class="text-3xl font-bold mb-6">Cashflow Model</h2>
  <table class="w-full border-collapse">
    <thead><tr class="border-b-2 border-slate-300">
      <th class="text-left py-2">Year</th><th>ARR</th><th>MRR</th><th>Customers</th><th>Churn</th><th>CAC</th><th>LTV</th>
    </tr></thead>
    <tbody>{years.map((y) => (
      <tr class="border-b border-slate-200">
        <td class="py-2">{y.year}</td>
        <td>${(y.arr/1000).toFixed(0)}K</td>
        <td>${(y.mrr/1000).toFixed(0)}K</td>
        <td>{y.customers}</td>
        <td>{(y.churn*100).toFixed(1)}%</td>
        <td>${y.cac}</td>
        <td>${(y.ltv/1000).toFixed(0)}K</td>
      </tr>
    ))}</tbody>
  </table>
  <p class="text-sm text-slate-500 mt-2">Edit <code>src/data/financials.json</code> to set your real numbers.</p>
</section>
```

- [ ] **Step 8: Write `CompetitorTable.astro`**

```astro
---
const { competitors = [] } = Astro.props;
---
<section id="competitors">
  <h2 class="text-3xl font-bold mb-6">Competitors</h2>
  {competitors.length === 0 ? (
    <p class="text-slate-500 italic">No competitors loaded. Add to src/data/research.json.</p>
  ) : (
    <table class="w-full border-collapse">
      <thead><tr class="border-b-2 border-slate-300">
        <th class="text-left py-2">Name</th><th class="text-left">Starting price</th><th class="text-left">Tiers</th>
      </tr></thead>
      <tbody>{competitors.map((c) => (
        <tr class="border-b border-slate-200">
          <td class="py-2"><a href={c.url} class="underline text-accent">{c.name}</a></td>
          <td>${c.starting_price_usd}/mo</td>
          <td>{c.tiers.length}</td>
        </tr>
      ))}</tbody>
    </table>
  )}
</section>
```

- [ ] **Step 9: Write `MarketMap.astro`**

```astro
---
const { data } = Astro.props;
const fmt = (n: number) => n >= 1e9 ? `$${(n/1e9).toFixed(1)}B` : `$${(n/1e6).toFixed(0)}M`;
---
<section id="market">
  <h2 class="text-3xl font-bold mb-6">Market Size</h2>
  <div class="grid grid-cols-3 gap-4">
    <div class="p-6 border border-slate-200 rounded-xl text-center">
      <div class="text-sm text-slate-500">TAM</div>
      <div class="text-3xl font-bold text-accent">{fmt(data.tam_usd)}</div>
    </div>
    <div class="p-6 border border-slate-200 rounded-xl text-center">
      <div class="text-sm text-slate-500">SAM</div>
      <div class="text-3xl font-bold text-accent">{fmt(data.sam_usd)}</div>
    </div>
    <div class="p-6 border border-slate-200 rounded-xl text-center">
      <div class="text-sm text-slate-500">SOM</div>
      <div class="text-3xl font-bold text-accent">{fmt(data.som_usd)}</div>
    </div>
  </div>
  {data.sources?.length > 0 && (
    <p class="text-sm text-slate-500 mt-4">Sources: {data.sources.map((s) => (
      <a href={s.url} class="underline mr-2">{s.title}</a>
    ))}</p>
  )}
</section>
```

- [ ] **Step 10: Write `GTMTimeline.astro`**

```astro
<section id="gtm">
  <h2 class="text-3xl font-bold mb-6">Go-to-Market Strategy</h2>
  <ol class="space-y-4">
    <li class="border-l-4 border-accent pl-4"><strong>Phase 1: Launch (Month 0-3)</strong> — Product Hunt, indie hackers, dev communities.</li>
    <li class="border-l-4 border-accent pl-4"><strong>Phase 2: First 1k users (Month 3-9)</strong> — content + SEO, free tier acquisition.</li>
    <li class="border-l-4 border-accent pl-4"><strong>Phase 3: 10k users (Month 9-18)</strong> — paid acquisition, partner integrations.</li>
    <li class="border-l-4 border-accent pl-4"><strong>Phase 4: Enterprise (Month 18+)</strong> — outbound sales, SOC 2, SSO, custom contracts.</li>
  </ol>
</section>
```

- [ ] **Step 11: Write `CertBadge.astro`**

```astro
---
const { name, status, data } = Astro.props;
const statusColor = { 'in-progress': 'bg-amber-100 text-amber-800', audited: 'bg-emerald-100 text-emerald-800', target: 'bg-slate-100 text-slate-700' }[status] ?? 'bg-slate-100';
---
<div class="border border-slate-200 rounded-xl p-4 flex-1 min-w-[200px]">
  <div class="flex justify-between items-center mb-2">
    <h3 class="font-semibold">{name}</h3>
    <span class={`text-xs px-2 py-1 rounded ${statusColor}`}>{status}</span>
  </div>
  <p class="text-sm text-slate-600">Estimated audit cost: ${data.cost_low_usd.toLocaleString()}–${data.cost_high_usd.toLocaleString()}</p>
  {data.timeline_months && <p class="text-xs text-slate-500 mt-1">Timeline: ~{data.timeline_months} months</p>}
</div>
```

- [ ] **Step 12: Write `UseOfFunds.astro`**

```astro
---
const allocation = [
  { label: 'Engineering', pct: 50 },
  { label: 'Go-to-market', pct: 25 },
  { label: 'Compliance & Security', pct: 15 },
  { label: 'Operations', pct: 10 },
];
---
<section id="use-of-funds">
  <h2 class="text-3xl font-bold mb-6">Use of Funds</h2>
  <div class="space-y-3">{allocation.map((a) => (
    <div>
      <div class="flex justify-between text-sm mb-1"><span>{a.label}</span><span>{a.pct}%</span></div>
      <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div class="h-full bg-accent" style={`width: ${a.pct}%`}></div>
      </div>
    </div>
  ))}</div>
</section>
```

- [ ] **Step 13: Commit**

```bash
git add cli/src/lib/invest/templates/
git commit -m "feat(invest): add astro + tailwind landing page templates"
```

---

## Task 6: Scaffold Generator

**Files:**
- Create: `cli/src/lib/invest/scaffold.ts`
- Create: `cli/tests/invest/scaffold.test.ts`

- [ ] **Step 1: Write failing test**

Create `cli/tests/invest/scaffold.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { scaffold } from '../../src/lib/invest/scaffold.js';
import type { ResearchData, InvestParams } from '../../src/lib/invest/types.js';

let tmp: string;
beforeEach(() => { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'invest-')); });
afterEach(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

const params: InvestParams = {
  product: 'finsavvyai', domain: 'finsavvyai.com',
  mode: 'draft', accent: '#00C8FF',
  certs: ['soc2', 'gdpr', 'ccpa'], researchDepth: 'standard',
};

const research: ResearchData = {
  product: 'finsavvyai', generated_at: '2026-06-02T00:00:00Z', depth: 'standard',
  market: { tam_usd: 5e10, sam_usd: 8e9, som_usd: 2.5e8, sources: [] },
  competitors: [],
  certs: {
    soc2: { cost_low_usd: 20000, cost_high_usd: 60000, timeline_months: 6, sources: [] },
    gdpr: { cost_low_usd: 5000, cost_high_usd: 15000, sources: [] },
    ccpa: { cost_low_usd: 5000, cost_high_usd: 10000, sources: [] },
  },
  gtm_playbooks: [],
};

describe('scaffold', () => {
  it('creates site/invest/ tree with all key files', async () => {
    await scaffold(tmp, params, research);
    expect(fs.existsSync(path.join(tmp, 'site/invest/astro.config.mjs'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'site/invest/tailwind.config.cjs'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'site/invest/package.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'site/invest/src/layouts/InvestorLayout.astro'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'site/invest/src/pages/index.astro'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'site/invest/src/data/research.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'site/invest/src/data/financials.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'site/invest/src/components/Hero.astro'))).toBe(true);
  });

  it('substitutes placeholders', async () => {
    await scaffold(tmp, params, research);
    const cfg = fs.readFileSync(path.join(tmp, 'site/invest/astro.config.mjs'), 'utf8');
    expect(cfg).toContain('https://invest.finsavvyai.com');
    expect(cfg).not.toContain('{{DOMAIN}}');
    const tw = fs.readFileSync(path.join(tmp, 'site/invest/tailwind.config.cjs'), 'utf8');
    expect(tw).toContain('#00C8FF');
    const pkg = JSON.parse(fs.readFileSync(path.join(tmp, 'site/invest/package.json'), 'utf8'));
    expect(pkg.name).toBe('invest-finsavvyai');
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
cd cli && npx vitest run tests/invest/scaffold.test.ts
```

Expected: module-not-found.

- [ ] **Step 3: Implement scaffold**

Create `cli/src/lib/invest/scaffold.ts`:

```typescript
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import type { InvestParams, ResearchData } from './types.js';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const TEMPLATES = path.join(here, 'templates');

const DEFAULT_FINANCIALS = {
  years: [
    { year: 1, arr: 100000, mrr: 8333, customers: 50, churn: 0.05, cac: 800, ltv: 12000 },
    { year: 2, arr: 750000, mrr: 62500, customers: 300, churn: 0.04, cac: 700, ltv: 14000 },
    { year: 3, arr: 3000000, mrr: 250000, customers: 1000, churn: 0.03, cac: 600, ltv: 18000 },
    { year: 4, arr: 9000000, mrr: 750000, customers: 2500, churn: 0.025, cac: 500, ltv: 22000 },
    { year: 5, arr: 22000000, mrr: 1833333, customers: 5000, churn: 0.02, cac: 450, ltv: 28000 },
  ],
  round: { size_usd: 1500000, valuation_usd: 10000000, instrument: 'SAFE' },
};

function render(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(PRODUCT|DOMAIN|ACCENT)\}\}/g, (_, k: string) => vars[k] ?? '');
}

function copyTemplate(src: string, dest: string, vars: Record<string, string>): void {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const raw = fs.readFileSync(src, 'utf8');
  fs.writeFileSync(dest, render(raw, vars));
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

export async function scaffold(
  cwd: string,
  params: InvestParams,
  research: ResearchData,
): Promise<void> {
  const target = path.join(cwd, 'site/invest');
  fs.mkdirSync(target, { recursive: true });

  const vars = { PRODUCT: params.product, DOMAIN: params.domain, ACCENT: params.accent };

  for (const file of walk(TEMPLATES)) {
    const rel = path.relative(TEMPLATES, file).replace(/\.tpl$/, '');
    copyTemplate(file, path.join(target, rel), vars);
  }

  const dataDir = path.join(target, 'src/data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'research.json'), JSON.stringify(research, null, 2));
  fs.writeFileSync(path.join(dataDir, 'financials.json'), JSON.stringify(DEFAULT_FINANCIALS, null, 2));
}
```

- [ ] **Step 4: Run, verify pass**

```bash
cd cli && npx vitest run tests/invest/scaffold.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cli/src/lib/invest/scaffold.ts cli/tests/invest/scaffold.test.ts
git commit -m "feat(invest): add astro project scaffolder"
```

---

## Task 7: INVESTOR-DRAFT.md Generator

**Files:**
- Create: `cli/src/lib/invest/content.ts`
- Create: `cli/tests/invest/content.test.ts`

- [ ] **Step 1: Write failing test**

Create `cli/tests/invest/content.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { renderDraftReadme } from '../../src/lib/invest/content.js';
import type { ResearchData, InvestParams } from '../../src/lib/invest/types.js';

const params: InvestParams = {
  product: 'finsavvyai', domain: 'finsavvyai.com', mode: 'draft',
  accent: '#7c5cfc', certs: ['soc2', 'gdpr', 'ccpa'], researchDepth: 'standard',
};

const research: ResearchData = {
  product: 'finsavvyai', generated_at: '2026-06-02T00:00:00Z', depth: 'standard',
  market: {
    tam_usd: 5e10, sam_usd: 8e9, som_usd: 2.5e8,
    sources: [{ url: 'https://gartner.com/x', title: 'Market 2026', accessed: '2026-06-02' }],
  },
  competitors: [],
  certs: {
    soc2: { cost_low_usd: 20000, cost_high_usd: 60000, timeline_months: 6, sources: [] },
    gdpr: { cost_low_usd: 5000, cost_high_usd: 15000, sources: [] },
    ccpa: { cost_low_usd: 5000, cost_high_usd: 10000, sources: [] },
  },
  gtm_playbooks: [],
};

describe('renderDraftReadme', () => {
  it('contains review checklist headers', () => {
    const md = renderDraftReadme(params, research);
    expect(md).toContain('# INVESTOR DRAFT');
    expect(md).toContain('## Review Checklist');
    expect(md).toContain('finsavvyai');
    expect(md).toContain('invest.finsavvyai.com');
    expect(md).toContain('--mode publish');
  });

  it('flags placeholder sections when research empty', () => {
    const empty = { ...research, competitors: [], gtm_playbooks: [] };
    const md = renderDraftReadme(params, empty);
    expect(md).toMatch(/competitors.*\[NEEDS REVIEW\]/i);
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
cd cli && npx vitest run tests/invest/content.test.ts
```

Expected: module-not-found.

- [ ] **Step 3: Implement**

Create `cli/src/lib/invest/content.ts`:

```typescript
import type { InvestParams, ResearchData } from './types.js';

const fmt = (n: number) => n >= 1e9 ? `$${(n/1e9).toFixed(1)}B` : `$${(n/1e6).toFixed(0)}M`;

function citeList(sources: { url: string; title: string }[]): string {
  if (!sources.length) return '_no sources cited_';
  return sources.map(s => `- [${s.title}](${s.url})`).join('\n');
}

export function renderDraftReadme(params: InvestParams, r: ResearchData): string {
  const competitorsBlock = r.competitors.length
    ? r.competitors.map(c => `- **${c.name}** — ${c.url} — starting $${c.starting_price_usd}/mo`).join('\n')
    : '_no competitors found — **[NEEDS REVIEW]** add to `site/invest/src/data/research.json`_';

  return `# INVESTOR DRAFT — ${params.product}

Generated ${r.generated_at} at depth=${r.depth}.
Target subdomain: **invest.${params.domain}**

## Review Checklist

Before running \`--mode publish\`, verify every numeric claim below and edit the relevant Astro section.

### Market Size

- TAM: ${fmt(r.market.tam_usd)}
- SAM: ${fmt(r.market.sam_usd)}
- SOM: ${fmt(r.market.som_usd)}

Sources:
${citeList(r.market.sources)}

> Edit \`site/invest/src/components/MarketMap.astro\` if numbers are off.

### Competitors

${competitorsBlock}

> Edit \`site/invest/src/data/research.json\` → \`competitors\` array.

### Certifications

| Cert | Cost (low) | Cost (high) | Timeline |
|---|---|---|---|
| SOC 2 Type II | $${r.certs.soc2.cost_low_usd.toLocaleString()} | $${r.certs.soc2.cost_high_usd.toLocaleString()} | ${r.certs.soc2.timeline_months ?? '?'} mo |
| GDPR | $${r.certs.gdpr.cost_low_usd.toLocaleString()} | $${r.certs.gdpr.cost_high_usd.toLocaleString()} | — |
| CCPA | $${r.certs.ccpa.cost_low_usd.toLocaleString()} | $${r.certs.ccpa.cost_high_usd.toLocaleString()} | — |

> Update status on each \`CertBadge\` in \`src/pages/index.astro\` to \`in-progress\`, \`audited\`, or \`target <quarter>\`.

### Financial Model

Defaults in \`site/invest/src/data/financials.json\`. Replace with your real ARR / churn / CAC / LTV.

### The Ask

Edit \`site/invest/src/pages/index.astro\` → \`<section id="ask">\` to set round size, valuation, and instrument.

## Publish

When the checklist above is green:

\`\`\`bash
luna invest --product ${params.product} --domain ${params.domain} --mode publish
\`\`\`

Requires \`CF_API_TOKEN\` with \`Zone:Read\`, \`Zone:DNS:Edit\`, \`Account:Pages:Edit\` scopes.
`;
}
```

- [ ] **Step 4: Run, verify pass**

```bash
cd cli && npx vitest run tests/invest/content.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cli/src/lib/invest/content.ts cli/tests/invest/content.test.ts
git commit -m "feat(invest): add INVESTOR-DRAFT.md generator"
```

---

## Task 8: Orchestrator

**Files:**
- Create: `cli/src/lib/invest/index.ts`
- Create: `cli/tests/invest/orchestrator.test.ts`

- [ ] **Step 1: Write failing test**

Create `cli/tests/invest/orchestrator.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runInvest } from '../../src/lib/invest/index.js';
import type { InvestParams } from '../../src/lib/invest/types.js';

let tmp: string;
beforeEach(() => { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'invest-orch-')); });
afterEach(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

const params: InvestParams = {
  product: 'x', domain: 'x.com', mode: 'draft',
  accent: '#7c5cfc', certs: ['soc2', 'gdpr', 'ccpa'], researchDepth: 'quick',
};

describe('runInvest', () => {
  it('mode=draft runs research + scaffold but skips deploy', async () => {
    const deploy = vi.fn();
    await runInvest(params, {
      cwd: tmp,
      lunaHome: path.join(tmp, '.luna'),
      research: { search: async () => [], fetchPage: async () => '' },
      deploy,
    });
    expect(fs.existsSync(path.join(tmp, 'site/invest/package.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, '.luna/x/invest/research.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, '.luna/x/invest/INVESTOR-DRAFT.md'))).toBe(true);
    expect(deploy).not.toHaveBeenCalled();
  });

  it('mode=publish skips research/scaffold and calls deploy', async () => {
    fs.mkdirSync(path.join(tmp, 'site/invest'), { recursive: true });
    const deploy = vi.fn();
    await runInvest({ ...params, mode: 'publish' }, {
      cwd: tmp,
      lunaHome: path.join(tmp, '.luna'),
      research: { search: async () => [], fetchPage: async () => '' },
      deploy,
    });
    expect(deploy).toHaveBeenCalledOnce();
  });

  it('mode=one-shot runs all three phases', async () => {
    const deploy = vi.fn();
    await runInvest({ ...params, mode: 'one-shot' }, {
      cwd: tmp,
      lunaHome: path.join(tmp, '.luna'),
      research: { search: async () => [], fetchPage: async () => '' },
      deploy,
    });
    expect(fs.existsSync(path.join(tmp, 'site/invest/package.json'))).toBe(true);
    expect(deploy).toHaveBeenCalledOnce();
  });

  it('mode=publish fails when site/invest missing', async () => {
    const deploy = vi.fn();
    await expect(runInvest({ ...params, mode: 'publish' }, {
      cwd: tmp,
      lunaHome: path.join(tmp, '.luna'),
      research: { search: async () => [], fetchPage: async () => '' },
      deploy,
    })).rejects.toThrow(/site\/invest/);
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
cd cli && npx vitest run tests/invest/orchestrator.test.ts
```

Expected: module-not-found.

- [ ] **Step 3: Implement orchestrator**

Create `cli/src/lib/invest/index.ts`:

```typescript
import fs from 'node:fs';
import path from 'node:path';
import { runResearch, type ResearchDeps } from './research.js';
import { scaffold } from './scaffold.js';
import { renderDraftReadme } from './content.js';
import type { InvestParams, ResearchData } from './types.js';

export type DeployFn = (params: InvestParams, cwd: string) => Promise<void>;

export interface RunDeps {
  cwd: string;
  lunaHome: string;
  research: ResearchDeps;
  deploy: DeployFn;
}

export async function runInvest(params: InvestParams, deps: RunDeps): Promise<void> {
  const lunaDir = path.join(deps.lunaHome, params.product, 'invest');
  fs.mkdirSync(lunaDir, { recursive: true });

  const needsResearch = params.mode !== 'publish';
  const needsDeploy = params.mode !== 'draft';

  let research: ResearchData;
  if (needsResearch) {
    research = await runResearch(
      { product: params.product, domain: params.domain, depth: params.researchDepth },
      deps.research,
    );
    fs.writeFileSync(path.join(lunaDir, 'research.json'), JSON.stringify(research, null, 2));
    await scaffold(deps.cwd, params, research);
    fs.writeFileSync(path.join(lunaDir, 'INVESTOR-DRAFT.md'), renderDraftReadme(params, research));
  }

  if (needsDeploy) {
    const siteDir = path.join(deps.cwd, 'site/invest');
    if (!fs.existsSync(siteDir)) {
      throw new Error(`site/invest not found at ${siteDir}. Run with --mode draft first.`);
    }
    await deps.deploy(params, deps.cwd);
  }
}

export * from './types.js';
export { CloudflareClient } from './cloudflare.js';
```

- [ ] **Step 4: Run, verify pass**

```bash
cd cli && npx vitest run tests/invest/orchestrator.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cli/src/lib/invest/index.ts cli/tests/invest/orchestrator.test.ts
git commit -m "feat(invest): add mode-aware orchestrator (draft/publish/one-shot)"
```

---

## Task 9: CLI Command

**Files:**
- Create: `cli/src/commands/invest.ts`
- Modify: `cli/src/index.ts:1-16` (add import) and `cli/src/index.ts:53-65` (register)

- [ ] **Step 1: Write the CLI command**

Create `cli/src/commands/invest.ts`:

```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { InvestParamsSchema } from '../lib/invest/schema.js';
import { runInvest, CloudflareClient } from '../lib/invest/index.js';
import type { InvestParams } from '../lib/invest/types.js';

async function defaultDeploy(params: InvestParams, cwd: string): Promise<void> {
  const accountId = process.env.CF_ACCOUNT_ID;
  if (!accountId) throw new Error('CF_ACCOUNT_ID required for deploy');

  const cf = new CloudflareClient({ accountId });
  const projectName = `invest-${params.product}`;
  const siteDir = path.join(cwd, 'site/invest');

  console.log(chalk.cyan(`→ Building ${siteDir}`));
  execSync('npm install --silent && npm run build', { cwd: siteDir, stdio: 'inherit' });

  let project = await cf.getPagesProject(projectName);
  if (!project) {
    console.log(chalk.cyan(`→ Creating Pages project ${projectName}`));
    project = await cf.createPagesProject(projectName);
  }

  console.log(chalk.cyan(`→ Uploading dist/ via wrangler`));
  execSync(`npx wrangler pages deploy dist --project-name ${projectName}`, {
    cwd: siteDir, stdio: 'inherit', env: { ...process.env, CF_API_TOKEN: process.env.CF_API_TOKEN },
  });

  const zoneId = await cf.zoneId(params.domain);
  console.log(chalk.cyan(`→ DNS CNAME invest.${params.domain} → ${project.subdomain}`));
  await cf.upsertCname(zoneId, 'invest', project.subdomain);

  console.log(chalk.cyan(`→ Binding custom domain`));
  await cf.bindDomain(projectName, `invest.${params.domain}`);

  console.log(chalk.green(`✓ Live at https://invest.${params.domain} (cert provisioning may take ~2 min)`));
}

export const investCommand = new Command('invest')
  .description('Create invest.<domain> subdomain with investor-grade landing page')
  .requiredOption('-p, --product <name>', 'Product slug (kebab-case)')
  .requiredOption('-d, --domain <domain>', 'Apex domain (e.g. finsavvyai.com)')
  .option('-m, --mode <mode>', 'draft | publish | one-shot', 'draft')
  .option('-a, --accent <hex>', 'Brand accent color', '#7c5cfc')
  .option('-c, --certs <csv>', 'Cert badges (comma-separated)', 'soc2,gdpr,ccpa')
  .option('--research-depth <level>', 'quick | standard | deep', 'standard')
  .option('--auto-publish', 'Equivalent to --mode one-shot')
  .option('--force', 'Overwrite existing DNS records')
  .action(async (opts) => {
    const parsed = InvestParamsSchema.parse({
      product: opts.product,
      domain: opts.domain,
      mode: opts.mode,
      accent: opts.accent,
      certs: opts.certs.split(',').map((s: string) => s.trim()),
      researchDepth: opts.researchDepth,
      autoPublish: opts.autoPublish,
      force: opts.force,
    });
    console.log(chalk.bold(`/ll-invest ${parsed.product} ${parsed.domain} --mode ${parsed.mode}`));
    await runInvest(parsed, {
      cwd: process.cwd(),
      lunaHome: path.join(os.homedir(), '.luna'),
      research: { search: async () => [], fetchPage: async () => '' },
      deploy: defaultDeploy,
    });
    if (parsed.mode === 'draft') {
      const draft = path.join(os.homedir(), '.luna', parsed.product, 'invest/INVESTOR-DRAFT.md');
      console.log(chalk.yellow(`\n📋 Review checklist: ${draft}`));
      console.log(chalk.yellow(`When ready: luna invest -p ${parsed.product} -d ${parsed.domain} --mode publish`));
    }
  });
```

- [ ] **Step 2: Register in CLI**

Edit `cli/src/index.ts:1-16`. Add import after `import { keystoreCommand } from './commands/keystore.js';`:

```typescript
import { investCommand } from './commands/invest.js';
```

Edit `cli/src/index.ts:53-65`. Add registration line after `program.addCommand(keystoreCommand);`:

```typescript
program.addCommand(investCommand);
```

- [ ] **Step 3: Build CLI**

```bash
cd cli && npm run build
```

Expected: no TypeScript errors. `dist/index.cjs` updated.

- [ ] **Step 4: Verify command registration**

```bash
cd cli && node dist/index.cjs invest --help
```

Expected output includes `Create invest.<domain> subdomain` and lists all flags.

- [ ] **Step 5: Commit**

```bash
git add cli/src/commands/invest.ts cli/src/index.ts
git commit -m "feat(cli): register luna invest command"
```

---

## Task 10: Claude Code Slash Command

**Files:**
- Create: `commands/ll-invest.md`

- [ ] **Step 1: Write the slash command**

Create `commands/ll-invest.md`:

```markdown
---
name: ll-invest
displayName: Luna Investor Subdomain
description: Create invest.<product-domain> subdomain with investor-grade Astro landing page — auto-researched market sizing, competitor comparison, GTM, certifications, cashflow model
version: 1.0.0
category: growth
agent: luna-task-executor
parameters:
  - name: product
    type: string
    description: Product slug (kebab-case, e.g. 'finsavvyai')
    required: true
    prompt: true
  - name: domain
    type: string
    description: Apex domain on Cloudflare (e.g. 'finsavvyai.com')
    required: true
    prompt: true
  - name: mode
    type: string
    description: "draft (research+scaffold, gated), publish (deploy only), one-shot (all three phases)"
    required: false
    default: draft
  - name: accent
    type: string
    description: Brand accent hex
    required: false
    default: "#7c5cfc"
  - name: certs
    type: string
    description: Cert badges (csv) — soc2, gdpr, ccpa, iso27001, pci-dss
    required: false
    default: "soc2,gdpr,ccpa"
prerequisites:
  - CF_API_TOKEN with Zone:Read + Zone:DNS:Edit + Account:Pages:Edit
  - CF_ACCOUNT_ID set
  - Apex domain already on Cloudflare
---

# Luna Investor Subdomain — `/ll-invest`

Spin up `invest.<your-domain>` with an elegant Astro + Tailwind landing page tailored for investors.

## What it does

1. **Researches** the market (TAM/SAM/SOM), competitor pricing, certification costs, and GTM playbooks. All sources cited.
2. **Scaffolds** `site/invest/` with 14 investor-focused sections (problem, solution, market, cashflow, competitors, GTM, traction, team, certifications, use of funds, ask, FAQ, contact).
3. **Deploys** to Cloudflare Pages, adds DNS CNAME, binds `invest.<domain>` as a custom domain.

## Modes

- `draft` (default): research + scaffold, **stop** before deploy. Writes `INVESTOR-DRAFT.md` for review.
- `publish`: deploy only. Assumes `site/invest/` already exists.
- `one-shot`: all three phases.

## Examples

\`\`\`bash
# First run — review the draft before deploying
/ll-invest finsavvyai finsavvyai.com --mode draft

# Edit copy, financials, then publish
/ll-invest finsavvyai finsavvyai.com --mode publish

# Power users — run end-to-end
/ll-invest finsavvyai finsavvyai.com --mode one-shot
\`\`\`

## Default certifications

- **SOC 2 Type II** — $20k–$60k, ~6 months
- **GDPR** — $5k–$15k
- **CCPA** — $5k–$10k

Override with `--certs` to add `iso27001` or `pci-dss`.

## Under the hood

Calls `luna invest` from the luna-agents CLI. Core logic at `cli/src/lib/invest/`. Astro templates at `cli/src/lib/invest/templates/`. Cloudflare API client reused from the `ll-email-routing` skill pattern.
```

- [ ] **Step 2: Verify YAML parses**

```bash
cd /Users/shaharsolomon/dev/projects/portfolio/luna-os/luna-agents
node -e "const yaml = require('yaml'); const fs = require('fs'); const md = fs.readFileSync('commands/ll-invest.md', 'utf8'); const m = md.match(/^---\n([\s\S]+?)\n---/); console.log(yaml.parse(m[1]).name);"
```

Expected: `ll-invest`.

- [ ] **Step 3: Commit**

```bash
git add commands/ll-invest.md
git commit -m "feat(commands): add /ll-invest slash command"
```

---

## Task 11: Shortcut Command

**Files:**
- Create: `commands/invest.md`

- [ ] **Step 1: Write shortcut**

Create `commands/invest.md`:

```markdown
---
name: invest
displayName: invest (shortcut)
description: "Shortcut: create invest.<domain> subdomain with investor landing page → /ll-invest"
version: 1.0.0
category: growth
redirect: ll-invest
---

# `/invest` — Shortcut for `/ll-invest`

This is a shortcut. See `/ll-invest` for the full skill.

\`\`\`bash
/invest finsavvyai finsavvyai.com --mode draft
\`\`\`
```

- [ ] **Step 2: Commit**

```bash
git add commands/invest.md
git commit -m "feat(commands): add /invest shortcut"
```

---

## Task 12: Agent Definition

**Files:**
- Create: `agents/luna-invest.md`

- [ ] **Step 1: Inspect existing agent for format**

```bash
head -40 agents/luna-cloudflare.md
```

Expected: YAML frontmatter with `name`, `description`, `model`, `tools`, body with system prompt.

- [ ] **Step 2: Create the agent**

Create `agents/luna-invest.md`:

```markdown
---
name: luna-invest
description: Generate investor-grade Astro landing pages and deploy them to invest.<product-domain> via Cloudflare API. Three-phase pipeline (research → scaffold → deploy) with gated review by default.
model: sonnet
tools:
  - WebSearch
  - WebFetch
  - Read
  - Write
  - Edit
  - Bash
---

# Luna Investor Agent

You generate investor-facing landing pages for products in the LunaOS portfolio and deploy them to `invest.<product-domain>` via the Cloudflare API.

## Inputs

- `product` (string, required) — product slug (kebab-case)
- `domain` (string, required) — apex domain on Cloudflare
- `mode` (enum, default `draft`) — `draft` | `publish` | `one-shot`

## Behavior

1. **Research phase** (skipped in `publish` mode):
   - Use WebSearch for market sizing (`<industry> market size 2026 site:gartner.com OR site:statista.com OR site:idc.com`).
   - Use WebSearch + WebFetch for competitor pricing (top 5 competitors).
   - Use WebSearch for SOC 2, GDPR, CCPA audit cost ranges.
   - Use WebSearch for GTM playbooks in the product's category.
   - Persist findings to `.luna/<product>/invest/research.json` with `{url, title, accessed}` for every claim.

2. **Scaffold phase** (skipped in `publish` mode):
   - Run `luna invest --product <p> --domain <d> --mode draft` to generate `site/invest/`.
   - Write `INVESTOR-DRAFT.md` review checklist mapping every numeric claim to its source.

3. **Deploy phase** (skipped in `draft` mode):
   - Verify `CF_API_TOKEN` + `CF_ACCOUNT_ID` are set.
   - Run `luna invest --product <p> --domain <d> --mode publish`.

## Honesty rules

- **Never publish unverified financial claims.** If research returned empty for a section, mark it `[NEEDS REVIEW]` in `INVESTOR-DRAFT.md` and **stop**.
- **Never invent competitors.** Only include those returned by WebSearch and verifiable via their pricing URL.
- **Cite every number.** Every dollar figure on the page must have a source URL in `research.json`.

## Output

A path to the deployed page (`https://invest.<domain>`) on success, or the path to `INVESTOR-DRAFT.md` if mode was `draft`.
```

- [ ] **Step 3: Commit**

```bash
git add agents/luna-invest.md
git commit -m "feat(agents): add luna-invest agent definition"
```

---

## Task 13: MCP Tool

**Files:**
- Create: `mcp-servers/luna-nexa-rag/src/tools/invest.ts`
- Create: `mcp-servers/luna-nexa-rag/test/invest-tool.test.ts`
- Modify: `mcp-servers/luna-nexa-rag/src/index.ts` (register tool)

- [ ] **Step 1: Inspect existing MCP tool for pattern**

```bash
ls mcp-servers/luna-nexa-rag/src/tools/ 2>/dev/null
head -30 mcp-servers/luna-nexa-rag/src/index.ts
```

Note the existing tool registration pattern. If `tools/` directory does not yet exist, create it.

- [ ] **Step 2: Write failing test**

Create `mcp-servers/luna-nexa-rag/test/invest-tool.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { investTool } from '../src/tools/invest.js';

describe('luna_invest MCP tool', () => {
  it('exposes correct name and description', () => {
    expect(investTool.name).toBe('luna_invest');
    expect(investTool.description).toContain('invest.');
  });

  it('schema requires product and domain', () => {
    const schema = investTool.inputSchema;
    expect(schema.required).toContain('product');
    expect(schema.required).toContain('domain');
  });

  it('handler rejects missing product', async () => {
    await expect(investTool.handler({ domain: 'x.com' })).rejects.toThrow(/product/);
  });
});
```

- [ ] **Step 3: Run, verify fail**

```bash
cd mcp-servers/luna-nexa-rag && npx vitest run test/invest-tool.test.ts
```

Expected: module-not-found.

- [ ] **Step 4: Implement tool**

Create `mcp-servers/luna-nexa-rag/src/tools/invest.ts`:

```typescript
import { spawn } from 'node:child_process';

export interface InvestToolArgs {
  product?: string;
  domain?: string;
  mode?: 'draft' | 'publish' | 'one-shot';
  accent?: string;
  certs?: string;
}

export const investTool = {
  name: 'luna_invest',
  description: 'Create invest.<domain> subdomain with auto-researched investor landing page. Default mode=draft (research+scaffold, no deploy).',
  inputSchema: {
    type: 'object',
    properties: {
      product: { type: 'string', description: 'Product slug (kebab-case)' },
      domain: { type: 'string', description: 'Apex domain on Cloudflare' },
      mode: { type: 'string', enum: ['draft', 'publish', 'one-shot'], default: 'draft' },
      accent: { type: 'string', description: 'Brand accent hex', default: '#7c5cfc' },
      certs: { type: 'string', description: 'Cert badges csv', default: 'soc2,gdpr,ccpa' },
    },
    required: ['product', 'domain'],
  },
  async handler(args: InvestToolArgs): Promise<{ content: Array<{ type: string; text: string }> }> {
    if (!args.product) throw new Error('product required');
    if (!args.domain) throw new Error('domain required');
    return new Promise((resolve, reject) => {
      const flags = [
        'invest',
        '--product', args.product,
        '--domain', args.domain,
        '--mode', args.mode ?? 'draft',
        '--accent', args.accent ?? '#7c5cfc',
        '--certs', args.certs ?? 'soc2,gdpr,ccpa',
      ];
      const proc = spawn('luna', flags, { stdio: ['ignore', 'pipe', 'pipe'] });
      let out = '', err = '';
      proc.stdout.on('data', (d) => { out += d.toString(); });
      proc.stderr.on('data', (d) => { err += d.toString(); });
      proc.on('close', (code) => {
        if (code === 0) resolve({ content: [{ type: 'text', text: out }] });
        else reject(new Error(err || `luna invest exit ${code}`));
      });
    });
  },
};
```

- [ ] **Step 5: Run, verify pass**

```bash
cd mcp-servers/luna-nexa-rag && npx vitest run test/invest-tool.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 6: Register in MCP server**

Edit `mcp-servers/luna-nexa-rag/src/index.ts`. Add import:

```typescript
import { investTool } from './tools/invest.js';
```

Find the tool list registration (look for existing `ListToolsRequestSchema` handler) and add `investTool` to the returned `tools` array. Also add a case for `luna_invest` in the `CallToolRequestSchema` handler that calls `investTool.handler(args)`.

- [ ] **Step 7: Build and verify**

```bash
cd mcp-servers/luna-nexa-rag && npm run build
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add mcp-servers/luna-nexa-rag/src/tools/invest.ts mcp-servers/luna-nexa-rag/src/index.ts mcp-servers/luna-nexa-rag/test/invest-tool.test.ts
git commit -m "feat(mcp): add luna_invest tool"
```

---

## Task 14: Plugin Manifest Updates

**Files:**
- Modify: `.claude-plugin/claude-plugin.json` (bump version, list commands)
- Modify: `.claude-plugin/marketplace.json` (add growth-category entry)
- Modify: `.claude-plugin/index.js` (commands array, if present)

- [ ] **Step 1: Inspect current manifest**

```bash
cat .claude-plugin/claude-plugin.json | head -30
```

- [ ] **Step 2: Bump version and add commands**

In `.claude-plugin/claude-plugin.json`:
- Bump `version` (semver minor, e.g. `2.0.11` → `2.1.0`).
- If a `commands` array exists, add `"ll-invest"` and `"invest"` entries.

- [ ] **Step 3: Add marketplace entry**

In `.claude-plugin/marketplace.json`, locate the `growth` category list and append:

```json
{
  "name": "ll-invest",
  "displayName": "Luna Investor Subdomain",
  "description": "Create invest.<domain> with investor-grade landing page",
  "category": "growth",
  "tags": ["investor", "landing-page", "cloudflare", "astro"]
}
```

- [ ] **Step 4: Update `.claude-plugin/index.js` if it lists commands**

If the file references a hard-coded commands list (grep for `commands` array), append `'ll-invest'` and `'invest'`.

- [ ] **Step 5: Run plugin tests**

```bash
npm run test:plugin
```

Expected: all existing plugin tests still pass.

- [ ] **Step 6: Commit**

```bash
git add .claude-plugin/claude-plugin.json .claude-plugin/marketplace.json .claude-plugin/index.js
git commit -m "chore(plugin): register ll-invest + invest commands, bump to 2.1.0"
```

---

## Task 15: README + CHANGELOG Sync

**Files:**
- Modify: `README.md` (auto-synced by script)
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Run README sync**

```bash
npm run readme:sync
```

Expected: counter bumps from 285 → 287 commands. `README.md` updated.

- [ ] **Step 2: Verify counters**

```bash
npm run readme:check
```

Expected: exits zero with no diff.

- [ ] **Step 3: Add CHANGELOG entry**

Prepend a new section to `CHANGELOG.md`:

```markdown
## 2.1.0 — 2026-06-02

### Added

- **`/ll-invest` skill** — create `invest.<product-domain>` subdomains backed by Astro + Tailwind investor landing pages. Three-phase pipeline (research → scaffold → deploy) gated by default (`--mode draft`).
- **`/invest` shortcut** — alias for `/ll-invest`.
- **`luna invest` CLI command** — same skill on the npm CLI surface.
- **`luna-invest` agent** — agent definition for orchestration.
- **`luna_invest` MCP tool** — callable from any MCP client.
- Cloudflare API client at `cli/src/lib/invest/cloudflare.ts` (Pages + DNS + custom domain).
```

- [ ] **Step 4: Commit**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: sync README, add CHANGELOG entry for 2.1.0"
```

---

## Task 16: Integration Test

**Files:**
- Create: `tests/integration/invest.integration.test.ts` (top-level `tests/` package)

- [ ] **Step 1: Inspect top-level tests config**

```bash
ls tests/ && cat tests/package.json 2>/dev/null | head -20
```

If `tests/integration/` does not exist, create it.

- [ ] **Step 2: Write integration test**

Create `tests/integration/invest.integration.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

let tmp: string;
beforeEach(() => { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'invest-int-')); });
afterEach(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

describe('luna invest --mode draft (integration)', () => {
  it('produces site/invest/ that builds with astro', () => {
    const cli = path.resolve(__dirname, '../../cli/dist/index.cjs');
    execSync(`node ${cli} invest -p testproduct -d test-product.dev --mode draft --research-depth quick`, {
      cwd: tmp, env: { ...process.env, HOME: tmp }, stdio: 'inherit',
    });
    const siteDir = path.join(tmp, 'site/invest');
    expect(fs.existsSync(path.join(siteDir, 'package.json'))).toBe(true);

    execSync('npm install --silent && npm run build', { cwd: siteDir, stdio: 'inherit' });
    expect(fs.existsSync(path.join(siteDir, 'dist/index.html'))).toBe(true);
  }, 180000);
});
```

- [ ] **Step 3: Run integration test**

```bash
cd cli && npm run build
cd /Users/shaharsolomon/dev/projects/portfolio/luna-os/luna-agents
npx vitest run tests/integration/invest.integration.test.ts
```

Expected: passes (slow — installs Astro deps once).

- [ ] **Step 4: Commit**

```bash
git add tests/integration/invest.integration.test.ts
git commit -m "test(invest): add end-to-end draft mode integration test"
```

---

## Task 17: Release Checklist Verification

**Files:** none modified

- [ ] **Step 1: Line-count gate**

```bash
find cli/src/lib/invest cli/src/commands/invest.ts commands/ll-invest.md commands/invest.md agents/luna-invest.md mcp-servers/luna-nexa-rag/src/tools/invest.ts -type f | xargs wc -l | sort -rn | head -20
```

Expected: every file ≤ 200 lines. If any over, split.

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: plugin + MCP + CLI + suite tests all pass.

- [ ] **Step 3: Coverage check**

```bash
cd cli && npx vitest run --coverage tests/invest/
```

Expected: ≥ 90% line, ≥ 85% branch on `src/lib/invest/`.

- [ ] **Step 4: npm pack dry run**

```bash
npm pack --dry-run | head -50
```

Expected: tarball includes `commands/ll-invest.md`, `commands/invest.md`, `agents/luna-invest.md`.

- [ ] **Step 5: README counter check**

```bash
npm run readme:check
```

Expected: exits zero.

- [ ] **Step 6: Final commit**

If any fixes were needed in steps 1-5, commit them. Otherwise, this task is informational.

```bash
git status
```

Expected: clean tree, ahead of origin/main by 16 commits.

---

## Self-Review Notes

**Spec coverage check:** Every section of `2026-06-02-ll-invest-design.md` maps to a task:
- §Parameters → Tasks 2, 9
- §Modes → Task 8
- §Architecture / three-phase pipeline → Tasks 4, 6, 8
- §Landing Page Sections → Task 5
- §Research Module → Task 4
- §Cloudflare API Surface → Task 3
- §Error Handling → Tasks 3, 8 (degradation), 9 (CLI errors)
- §Registration Across Surfaces → Tasks 9, 10, 11, 12, 13, 14
- §File Layout Produced → Tasks 5, 6, 8
- §Testing Strategy → Tasks 2-8, 13, 16
- §Security Considerations → Tasks 3 (token redaction), 8 (gated default)
- §Release Checklist → Task 17

**Type consistency check:** `InvestParams` defined in Task 2 is the only param shape used by Tasks 6, 8, 9, 13. `ResearchData` defined in Task 2 is consumed by Tasks 4, 6, 7, 8 — names match (`market.tam_usd`, `certs.soc2.cost_low_usd`).

**Placeholder scan:** No "TBD", "TODO", or "add error handling" placeholders. Every step contains either code or an exact command.

**Scope check:** 17 tasks across 6 surfaces. Single feature, single spec, fits one plan.
