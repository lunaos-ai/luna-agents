import path from 'node:path';
import type { PlanTask, RequirementSource } from './types.js';

export interface ParsedRequirement {
    explicitId?: string;
    title: string;
    description: string;
    source: RequirementSource;
}

export interface ParsedCycle {
    id: string;
    title: string;
    source: { path: string; line: number };
    checked?: boolean;
    requirementIds?: string[];
}

export interface ParsedArtifacts {
    requirements: ParsedRequirement[];
    tasks: PlanTask[];
    cycles: ParsedCycle[];
}

const explicitIdPattern = /\b([A-Z][A-Z0-9]{1,11}-\d{1,5})\b/;

export function parseRequirementsMarkdown(content: string, relativePath: string): ParsedRequirement[] {
    const lines = content.split(/\r?\n/);
    const starts: Array<{
        lineIndex: number;
        checked: boolean;
        explicitId?: string;
        title: string;
        lead: string;
    }> = [];

    for (let index = 0; index < lines.length; index++) {
        const parsed = parseRequirementLine(lines[index]);
        if (!parsed) continue;
        starts.push({ lineIndex: index, ...parsed });
    }

    return starts.map((item, ordinal) => {
        const nextLine = starts[ordinal + 1]?.lineIndex ?? lines.length;
        const block = [item.lead, ...lines.slice(item.lineIndex + 1, nextLine)]
            .join('\n').trim();
        return {
            ...(item.explicitId ? { explicitId: item.explicitId } : {}),
            title: item.title,
            description: cleanDescription(block, item.title),
            source: {
                path: normalizePath(relativePath),
                line: item.lineIndex + 1,
                ordinal: ordinal + 1,
                checked: item.checked,
            },
        };
    });
}

export function parsePlanMarkdown(content: string, relativePath: string): {
    tasks: PlanTask[];
    cycles: ParsedCycle[];
} {
    const lines = content.split(/\r?\n/);
    const cycles: ParsedCycle[] = [];
    const taskStarts: Array<{
        lineIndex: number;
        checked: boolean;
        id: string;
        title: string;
        cycleId: string;
    }> = [];
    let currentCycle: ParsedCycle | undefined;

    for (let index = 0; index < lines.length; index++) {
        const heading = parseCycleHeading(lines[index], relativePath, index + 1);
        if (heading) {
            currentCycle = heading;
            if (!cycles.some(cycle => cycle.id === heading.id)) cycles.push(heading);
            continue;
        }
        const task = parseTaskLine(lines[index]);
        if (!task) continue;
        const fallbackCycle = currentCycle || {
            id: 'UNMAPPED',
            title: 'Unmapped work',
            source: { path: normalizePath(relativePath), line: index + 1 },
        };
        if (!cycles.some(cycle => cycle.id === fallbackCycle.id)) cycles.push(fallbackCycle);
        taskStarts.push({ lineIndex: index, cycleId: fallbackCycle.id, ...task });
    }

    const tasks = taskStarts.map((item, ordinal): PlanTask => {
        const nextLine = taskStarts[ordinal + 1]?.lineIndex ?? lines.length;
        const body = lines.slice(item.lineIndex, nextLine).join('\n');
        return {
            id: item.id,
            title: item.title,
            checked: item.checked,
            cycleId: item.cycleId,
            requirementIds: unique((body.match(new RegExp(explicitIdPattern.source, 'g')) || [])
                .filter(id => id !== item.id)
                .map(id => id.toUpperCase())),
            source: { path: normalizePath(relativePath), line: item.lineIndex + 1 },
        };
    });

    return { tasks, cycles };
}

export function parseRoadmapMarkdown(content: string, relativePath: string): ParsedCycle[] {
    const lines = content.split(/\r?\n/);
    const cycles = new Map<string, ParsedCycle>();

    for (let index = 0; index < lines.length; index++) {
        const summary = lines[index].match(/^\s*[-*]\s+\[([ xX])\]\s+\*\*(Phase\s+([0-9]+(?:\.[0-9]+)?)|Epic\s+([^:*]+))\s*[:—–-]\s*([^*]+)\*\*/i);
        if (summary) {
            const id = summary[3]
                ? `PHASE-${summary[3].replace('.', '-')}`
                : `EPIC-${slug(summary[4])}`;
            cycles.set(id, {
                id,
                title: summary[5].trim(),
                checked: summary[1].toLowerCase() === 'x',
                requirementIds: cycles.get(id)?.requirementIds || [],
                source: { path: normalizePath(relativePath), line: index + 1 },
            });
        }
    }

    const headings: Array<{ lineIndex: number; cycle: ParsedCycle }> = [];
    for (let index = 0; index < lines.length; index++) {
        const cycle = parseCycleHeading(lines[index], relativePath, index + 1);
        if (cycle && (cycle.id.startsWith('PHASE-') || cycle.id.startsWith('EPIC-'))) {
            headings.push({ lineIndex: index, cycle });
        }
    }
    for (let index = 0; index < headings.length; index++) {
        const current = headings[index];
        const end = headings[index + 1]?.lineIndex ?? lines.length;
        const requirementIds = unique((lines.slice(current.lineIndex, end).join('\n')
            .match(new RegExp(explicitIdPattern.source, 'g')) || []).map(id => id.toUpperCase()));
        const summary = cycles.get(current.cycle.id);
        cycles.set(current.cycle.id, {
            ...current.cycle,
            title: summary?.title || current.cycle.title,
            checked: summary?.checked || false,
            requirementIds,
            source: summary?.source || current.cycle.source,
        });
    }
    return [...cycles.values()];
}

function parseRequirementLine(line: string): {
    checked: boolean;
    explicitId?: string;
    title: string;
    lead: string;
} | null {
    const list = line.match(/^(\s*)[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (list && list[1].length <= 2) {
        const lead = list[3].trim();
        const explicit = lead.match(explicitIdPattern)?.[1]?.toUpperCase();
        if (!explicit && list[1].length > 0) return null;
        return {
            checked: list[2].toLowerCase() === 'x',
            ...(explicit ? { explicitId: explicit } : {}),
            title: requirementTitle(lead, explicit),
            lead,
        };
    }

    const heading = line.match(/^#{2,6}\s+(.+)$/);
    const explicit = heading?.[1].match(explicitIdPattern)?.[1]?.toUpperCase();
    if (heading && explicit) {
        return {
            checked: false,
            explicitId: explicit,
            title: requirementTitle(heading[1], explicit),
            lead: heading[1],
        };
    }

    const bullet = line.match(/^(\s*)[-*]\s+(.+)$/);
    const bulletId = bullet?.[2].match(explicitIdPattern)?.[1]?.toUpperCase();
    if (bullet && bullet[1].length <= 2 && bulletId) {
        return {
            checked: false,
            explicitId: bulletId,
            title: requirementTitle(bullet[2], bulletId),
            lead: bullet[2],
        };
    }
    return null;
}

function parseCycleHeading(line: string, relativePath: string, lineNumber: number): ParsedCycle | null {
    const match = line.match(/^#{2,4}\s+(.+)$/);
    if (!match) return null;
    const raw = stripMarkdown(match[1]);
    const coded = raw.match(/^(P\d{1,3}|EPIC[- ]?[A-Z0-9]+)\b\s*(?:—|–|-|:)?\s*(.*)$/i);
    const phase = raw.match(/^Phase\s+(\d+[A-Za-z]?)\b\s*(?:—|–|-|:)?\s*(.*)$/i);
    if (!coded && !phase) return null;
    const id = coded
        ? coded[1].replace(/\s+/g, '-').toUpperCase()
        : `PHASE-${phase![1].toUpperCase()}`;
    const title = (coded?.[2] || phase?.[2] || raw).trim() || raw;
    return {
        id,
        title,
        source: { path: normalizePath(relativePath), line: lineNumber },
    };
}

function parseTaskLine(line: string): {
    checked: boolean;
    id: string;
    title: string;
} | null {
    const match = line.match(/^(\s*)[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (!match || match[1].length > 2) return null;
    const clean = stripMarkdown(match[3]);
    const idMatch = clean.match(/^([A-Z]+\d+(?:\.\d+)+|\d+(?:\.\d+)+)\b\s*(?:—|–|-|:)?\s*(.*)$/i);
    if (!idMatch) return null;
    return {
        checked: match[2].toLowerCase() === 'x',
        id: idMatch[1].toUpperCase(),
        title: idMatch[2].trim() || idMatch[1].toUpperCase(),
    };
}

function requirementTitle(value: string, explicitId?: string): string {
    let clean = stripMarkdown(value);
    if (explicitId) clean = clean.replace(explicitIdPattern, '').trim();
    clean = clean.replace(/^(?:—|–|-|:)\s*/, '');
    const boundary = clean.search(/:(?:\s|$)/);
    if (boundary > 0) clean = clean.slice(0, boundary);
    return clean.replace(/[.:]+$/, '').trim() || explicitId || 'Untitled requirement';
}

function cleanDescription(block: string, title: string): string {
    const clean = stripMarkdown(block).replace(/\s+/g, ' ').trim();
    const titleIndex = clean.indexOf(title);
    if (titleIndex === -1) return clean.slice(0, 500);
    return clean.slice(titleIndex + title.length).replace(/^\s*[:.-]?\s*/, '').slice(0, 500);
}

function stripMarkdown(value: string): string {
    return value
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/[*_]/g, '')
        .trim();
}

function normalizePath(value: string): string {
    return value.split(path.sep).join('/');
}

function slug(value: string): string {
    return value.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toUpperCase();
}

function unique<T>(values: T[]): T[] {
    return [...new Set(values)];
}
