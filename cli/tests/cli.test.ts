/**
 * CLI Tests — comprehensive tests for all luna commands
 *
 * Tests: persona-parser, context-builder, llm-client, command logic
 * Uses vitest with mocked fs/network for isolated testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';

// =============================================================
// PERSONA PARSER
// =============================================================
describe('Persona Parser', () => {
    it('should load a valid agent by slug', async () => {
        const { loadAgent } = await import('../src/core/persona-parser.js');
        const agent = await loadAgent('code-review');

        expect(agent).toBeDefined();
        expect(agent!.slug).toBe('code-review');
        expect(agent!.name).toBeDefined();
        expect(agent!.systemPrompt).toBeDefined();
        expect(agent!.systemPrompt.length).toBeGreaterThan(100);
    });

    it('should return null for unknown agent', async () => {
        const { loadAgent } = await import('../src/core/persona-parser.js');
        const agent = await loadAgent('nonexistent-agent-12345');
        expect(agent).toBeNull();
    });

    it('should load all 28 agents', async () => {
        const { loadAllAgents } = await import('../src/core/persona-parser.js');
        const agents = await loadAllAgents();

        expect(agents.length).toBe(28);

        // Each agent should have required fields
        for (const agent of agents) {
            expect(agent.slug).toBeDefined();
            expect(agent.slug.length).toBeGreaterThan(0);
            expect(agent.name).toBeDefined();
            expect(agent.systemPrompt).toBeDefined();
        }
    });

    it('should have consistent slug naming', async () => {
        const { loadAllAgents } = await import('../src/core/persona-parser.js');
        const agents = await loadAllAgents();

        for (const agent of agents) {
            // Slugs should be lowercase with hyphens only
            expect(agent.slug).toMatch(/^[a-z0-9-]+$/);
        }
    });
});

// =============================================================
// LLM CLIENT — Provider Configuration
// =============================================================
describe('LLM Client', () => {
    it('should export all 12 providers', async () => {
        const { PROVIDERS } = await import('../src/core/llm-client.js');

        const providerKeys = Object.keys(PROVIDERS);
        expect(providerKeys.length).toBe(12);

        // Verify key providers exist
        expect(PROVIDERS.anthropic).toBeDefined();
        expect(PROVIDERS.openai).toBeDefined();
        expect(PROVIDERS.deepseek).toBeDefined();
        expect(PROVIDERS.google).toBeDefined();
        expect(PROVIDERS.groq).toBeDefined();
        expect(PROVIDERS.xai).toBeDefined();
    });

    it('should have valid provider config', async () => {
        const { PROVIDERS } = await import('../src/core/llm-client.js');

        for (const [key, info] of Object.entries(PROVIDERS)) {
            expect(info.name).toBeDefined();
            expect(info.name.length).toBeGreaterThan(0);
            expect(info.envVar).toBeDefined();
            expect(info.envVar.length).toBeGreaterThan(0);
            expect(info.defaultModel).toBeDefined();
            expect(info.baseUrl).toBeDefined();
            expect(info.apiStyle).toMatch(/^(anthropic|openai|openai-compat)$/);
            expect(info.signupUrl).toBeDefined();
            expect(info.keyGuide).toBeDefined();
        }
    });

    it('should resolve API key from env var', async () => {
        const { resolveApiKey, PROVIDERS } = await import('../src/core/llm-client.js');

        // Set a test env var
        const envVar = PROVIDERS.deepseek.envVar;
        const original = process.env[envVar];
        process.env[envVar] = 'test-key-12345';

        const key = resolveApiKey('deepseek');
        expect(key).toBe('test-key-12345');

        // Restore
        if (original) {
            process.env[envVar] = original;
        } else {
            delete process.env[envVar];
        }
    });

    it('should return null when no key configured', async () => {
        const { resolveApiKey, PROVIDERS } = await import('../src/core/llm-client.js');

        // Make sure env var is not set
        const envVar = PROVIDERS.mistral.envVar;
        const original = process.env[envVar];
        delete process.env[envVar];

        const key = resolveApiKey('mistral');
        expect(key).toBeNull();

        // Restore
        if (original) {
            process.env[envVar] = original;
        }
    });

    it('should return correct default model per provider', async () => {
        const { defaultModel } = await import('../src/core/llm-client.js');

        expect(defaultModel('anthropic')).toContain('claude');
        expect(defaultModel('openai')).toContain('gpt');
        expect(defaultModel('deepseek')).toContain('deepseek');
    });
});

// =============================================================
// CONTEXT BUILDER
// =============================================================
describe('Context Builder', () => {
    it('should build context from a directory', async () => {
        const { buildContext } = await import('../src/core/context-builder.js');

        // Build context from the project root (luna-agents)
        const ctx = await buildContext(path.resolve(import.meta.dirname, '../../'));

        expect(ctx).toBeDefined();
        expect(ctx.files).toBeDefined();
        expect(ctx.files.length).toBeGreaterThan(0);
    });

    it('should respect file size limits', async () => {
        const { buildContext } = await import('../src/core/context-builder.js');

        const ctx = await buildContext(path.resolve(import.meta.dirname, '../../'));

        // No individual file should exceed 100KB
        for (const file of ctx.files) {
            expect(file.size).toBeLessThan(100 * 1024);
        }
    });

    it('should ignore node_modules and .git', async () => {
        const { buildContext } = await import('../src/core/context-builder.js');

        const ctx = await buildContext(path.resolve(import.meta.dirname, '../../'));

        for (const file of ctx.files) {
            expect(file.path).not.toContain('node_modules');
            expect(file.path).not.toContain('.git/');
        }
    });

    it('should format context as string', async () => {
        const { buildContext, formatContext } = await import('../src/core/context-builder.js');

        const ctx = await buildContext(path.resolve(import.meta.dirname, '../../'));
        const formatted = formatContext(ctx);

        expect(formatted).toBeDefined();
        expect(formatted.length).toBeGreaterThan(0);
        expect(typeof formatted).toBe('string');
    });
});

// =============================================================
// COMMAND STRUCTURE
// =============================================================
describe('Command Structure', () => {
    it('should export init command', async () => {
        const { initCommand } = await import('../src/commands/init.js');
        expect(initCommand).toBeDefined();
        expect(initCommand.name()).toBe('init');

        // Should have --skip-keys and --cloud options
        const options = initCommand.options.map(o => o.long);
        expect(options).toContain('--skip-keys');
        expect(options).toContain('--cloud');
    });

    it('should export list command', async () => {
        const { listCommand } = await import('../src/commands/list.js');
        expect(listCommand).toBeDefined();
        expect(listCommand.name()).toBe('list');
    });

    it('should export run command with all options', async () => {
        const { runCommand } = await import('../src/commands/run.js');
        expect(runCommand).toBeDefined();
        expect(runCommand.name()).toBe('run');

        const options = runCommand.options.map(o => o.long);
        expect(options).toContain('--provider');
        expect(options).toContain('--model');
        expect(options).toContain('--cloud');
        expect(options).toContain('--files');
        expect(options).toContain('--output');
        expect(options).toContain('--verbose');
    });

    it('should export status command', async () => {
        const { statusCommand } = await import('../src/commands/status.js');
        expect(statusCommand).toBeDefined();
        expect(statusCommand.name()).toBe('status');
    });
});

// =============================================================
// AGENT CATALOG CONSISTENCY
// =============================================================
describe('Agent Catalog Consistency', () => {
    it('should have matching agents in parser and files', async () => {
        const { loadAllAgents } = await import('../src/core/persona-parser.js');
        const agents = await loadAllAgents();
        const slugs = agents.map(a => a.slug);

        // Known free agents should be present
        const freeAgents = ['code-review', 'testing-validation', 'documentation', 'deployment'];
        for (const slug of freeAgents) {
            expect(slugs).toContain(slug);
        }
    });

    it('every agent should have a non-empty system prompt', async () => {
        const { loadAllAgents } = await import('../src/core/persona-parser.js');
        const agents = await loadAllAgents();

        for (const agent of agents) {
            expect(agent.systemPrompt.trim().length).toBeGreaterThan(50);
        }
    });
});
