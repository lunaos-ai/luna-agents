import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    platform: 'node',
    target: 'node18',
    outDir: 'dist',
    clean: true,
    splitting: false,
    sourcemap: true,
    dts: false,
    banner: {
        js: '#!/usr/bin/env node',
    },
    skipNodeModulesBundle: true,
    external: ['fsevents', 'playwright-core'],
});
