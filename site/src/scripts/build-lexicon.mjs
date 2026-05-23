#!/usr/bin/env node
// Reads ../../../commands/*.md, extracts frontmatter + first prose paragraph,
// emits ../data/skills.json, the real corpus that backs /lexicon.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const commandsDir = resolve(here, "../../../commands");
const outFile = resolve(here, "../data/skills.json");

const files = readdirSync(commandsDir).filter((f) => f.endsWith(".md"));

function parseFrontmatter(src) {
  if (!src.startsWith("---")) return { fm: {}, body: src };
  const end = src.indexOf("\n---", 3);
  if (end === -1) return { fm: {}, body: src };
  const raw = src.slice(3, end).trim();
  const body = src.slice(end + 4).trim();
  const fm = {};
  let key = null;
  let val = "";
  for (const line of raw.split("\n")) {
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (m) {
      if (key !== null) fm[key] = val.trim();
      key = m[1];
      val = m[2];
    } else if (key !== null) {
      val += " " + line.trim();
    }
  }
  if (key !== null) fm[key] = val.trim();
  return { fm, body };
}

function firstParagraph(body) {
  const trimmed = body.replace(/^#.*\n+/, "").trim();
  const para = trimmed.split(/\n\s*\n/)[0] ?? "";
  return para.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
}

// Brand rule: no em or en dashes in user-facing copy. Replace with comma+space.
function denormalizeDashes(s) {
  return s
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\s+--\s+/g, ", ")
    .replace(/, ,/g, ",")
    .replace(/,\s+,/g, ",");
}

function deriveCategory(fm, body) {
  const c = fm.category?.replace(/['"]/g, "").trim();
  if (c && c !== "shortcut") return c;
  if (fm.shortcut_for) return "shortcut";
  if (/security|owasp|threat/i.test(body)) return "security";
  if (/deploy|cloudflare|wrangler/i.test(body)) return "deployment";
  if (/test|playwright|jest/i.test(body)) return "testing";
  if (/landing|marketing|seo|brand|persona/i.test(body)) return "marketing";
  if (/design|ui|figma|hig/i.test(body)) return "design";
  if (/audit|review|critique/i.test(body)) return "review";
  if (/3d|video|image|imagine|voice|sing/i.test(body)) return "media";
  return "general";
}

const entries = [];
for (const file of files) {
  const path = join(commandsDir, file);
  const src = readFileSync(path, "utf8");
  const { fm, body } = parseFrontmatter(src);
  const name = (fm.name || file.replace(/\.md$/, "")).replace(/['"]/g, "").trim();
  const display = (fm.displayName || name).replace(/['"]/g, "").trim();
  const description = denormalizeDashes(
    (fm.description || firstParagraph(body) || "").replace(/['"]/g, "").trim()
  );
  const category = deriveCategory(fm, body);
  const shortcutFor = fm.shortcut_for?.replace(/['"]/g, "").trim() || null;
  entries.push({
    word: name,
    display,
    gloss: description.slice(0, 200),
    category,
    shortcutFor,
    call: shortcutFor ? `/${name}` : `/${name}`,
  });
}

entries.sort((a, b) => a.word.localeCompare(b.word));

const byCategory = {};
for (const e of entries) {
  if (!byCategory[e.category]) byCategory[e.category] = [];
  byCategory[e.category].push(e);
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(
  outFile,
  JSON.stringify({ count: entries.length, byCategory, entries }, null, 2)
);
console.log(`lexicon built: ${entries.length} entries across ${Object.keys(byCategory).length} categories`);
