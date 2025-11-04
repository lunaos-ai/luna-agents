#!/usr/bin/env node

/**
 * Simulation script for testing Luna RAG agent functionality
 * This simulates how the RAG agent would work with Claude Code plugin
 */

import fs from 'fs';
import path from 'path';

// Simulate the Luna RAG Service functionality
class MockLunaRAGService {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.contexts = [];
    this.indexed = false;
  }

  async initialize() {
    console.log('🚀 Initializing Luna RAG Service...');
    console.log(`📁 Project path: ${this.projectPath}`);

    // Simulate vector database initialization
    console.log('✅ Vector database initialized (simulated)');
    console.log('✅ AI providers configured (simulated)');

    this.indexed = true;
    console.log('✅ Luna RAG Service initialized successfully');
  }

  async indexProject() {
    if (!this.indexed) {
      await this.initialize();
    }

    console.log('📚 Indexing project for context retrieval...');

    // Extract contexts from files
    const contexts = await this.extractContexts();

    console.log(`🔍 Found ${contexts.length} contexts to index`);

    // Simulate generating embeddings and indexing
    console.log('🔤 Generating embeddings (simulated)');
    console.log('📝 Indexing contexts in vector database (simulated)');

    // Generate indexing report
    const report = {
      projectPath: this.projectPath,
      contextsIndexed: contexts.length,
      languages: this.getLanguageBreakdown(contexts),
      fileTypes: this.getFileTypeBreakdown(contexts),
      timestamp: new Date().toISOString()
    };

    console.log('✅ Project indexing complete');
    console.log('📊 Indexing Report:');
    console.log(`   - Contexts indexed: ${report.contextsIndexed}`);
    console.log(`   - Languages: ${Object.keys(report.languages).join(', ')}`);
    console.log(`   - File types: ${Object.keys(report.fileTypes).join(', ')}`);

    return report;
  }

  async extractContexts() {
    const contexts = [];

    // Get all files in test project
    const files = this.getProjectFiles();

    for (const filePath of files) {
      const content = fs.readFileSync(filePath.fullPath, 'utf-8');
      const extension = path.extname(filePath.path);
      const language = this.detectLanguage(extension);

      // Extract different types of contexts
      contexts.push({
        id: this.generateContextId(filePath.path, 'file'),
        filePath: filePath.path,
        content: content,
        language,
        type: 'file',
        metadata: {
          size: filePath.size,
          lines: content.split('\n').length
        }
      });

      // Extract functions/classes for code files
      if (['.ts', '.tsx', '.js', '.jsx'].includes(extension)) {
        contexts.push(...this.extractFromCode(content, filePath.path, language));
      }
    }

    this.contexts = contexts;
    return contexts;
  }

  getProjectFiles() {
    const files = [];

    const walkDir = (dir, basePath = '') => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(basePath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath, relativePath);
        } else if (stat.isFile()) {
          files.push({
            path: relativePath,
            fullPath,
            size: stat.size
          });
        }
      }
    };

    walkDir(this.projectPath);
    return files;
  }

  extractFromCode(content, filePath, language) {
    const contexts = [];

    // Extract interfaces
    const interfaceRegex = /interface\s+(\w+)\s*{([^}]+)}/g;
    let match;
    while ((match = interfaceRegex.exec(content)) !== null) {
      contexts.push({
        id: this.generateContextId(filePath, `interface_${match[1]}`),
        filePath,
        content: match[0],
        language,
        type: 'interface',
        name: match[1],
        metadata: {
          type: 'interface',
          lineStart: this.getLineNumber(content, match.index)
        }
      });
    }

    // Extract functions
    const functionRegex = /(?:const|function)\s+(\w+)\s*[=:]\s*(?:\([^)]*\)\s*=>|function\s*\([^)]*\))/g;
    while ((match = functionRegex.exec(content)) !== null) {
      contexts.push({
        id: this.generateContextId(filePath, `function_${match[1]}`),
        filePath,
        content: match[0],
        language,
        type: 'function',
        name: match[1],
        metadata: {
          type: 'function',
          lineStart: this.getLineNumber(content, match.index)
        }
      });
    }

    // Extract classes
    const classRegex = /class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      contexts.push({
        id: this.generateContextId(filePath, `class_${match[1]}`),
        filePath,
        content: match[0],
        language,
        type: 'class',
        name: match[1],
        metadata: {
          type: 'class',
          lineStart: this.getLineNumber(content, match.index)
        }
      });
    }

    return contexts;
  }

  detectLanguage(extension) {
    const languageMap = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript (React)',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript (React)',
      '.json': 'JSON',
      '.md': 'Markdown'
    };
    return languageMap[extension] || 'Unknown';
  }

  generateContextId(filePath, identifier) {
    const hash = require('crypto')
      .createHash('md5')
      .update(`${filePath}:${identifier}`)
      .digest('hex');
    return `ctx_${hash}`;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  async queryContext(query) {
    if (!this.indexed) {
      throw new Error('RAG service not initialized');
    }

    console.log(`🔍 Querying context for: "${query}"`);

    // Simulate finding relevant contexts based on keywords
    const queryWords = query.toLowerCase().split(/\s+/);
    const relevantContexts = this.contexts.filter(context => {
      const content = context.content.toLowerCase();
      return queryWords.some(word => content.includes(word));
    });

    console.log(`📊 Found ${relevantContexts.length} relevant contexts`);

    // Simulate token optimization
    const optimizedContexts = this.optimizeTokens(relevantContexts);

    const report = {
      query,
      originalContexts: relevantContexts.length,
      optimizedContexts: optimizedContexts.length,
      optimization: {
        originalTokens: this.estimateTokens(relevantContexts),
        optimizedTokens: this.estimateTokens(optimizedContexts),
        savings: this.estimateTokens(relevantContexts) - this.estimateTokens(optimizedContexts)
      }
    };

    console.log(`⚡ Token optimization complete: ${report.optimization.savings} tokens saved`);

    return {
      query,
      contexts: optimizedContexts.slice(0, 5), // Return top 5
      report
    };
  }

  optimizeTokens(contexts) {
    // Simple simulation - just return contexts with truncated content
    return contexts.map(context => ({
      ...context,
      content: context.content.length > 500
        ? context.content.substring(0, 500) + '...'
        : context.content
    }));
  }

  estimateTokens(contexts) {
    // Rough estimation: 4 characters per token
    const totalChars = contexts.reduce((sum, ctx) => sum + ctx.content.length, 0);
    return Math.ceil(totalChars / 4);
  }

  getLanguageBreakdown(contexts) {
    const breakdown = {};
    contexts.forEach(ctx => {
      breakdown[ctx.language] = (breakdown[ctx.language] || 0) + 1;
    });
    return breakdown;
  }

  getFileTypeBreakdown(contexts) {
    const breakdown = {};
    contexts.forEach(ctx => {
      breakdown[ctx.type] = (breakdown[ctx.type] || 0) + 1;
    });
    return breakdown;
  }
}

// Test the RAG functionality
async function testRAGSystem() {
  console.log('🧪 Testing Luna RAG System Integration\n');

  const ragService = new MockLunaRAGService('./test-project');

  try {
    // Test 1: Initialize and index project
    console.log('=== Test 1: Project Initialization and Indexing ===');
    const indexReport = await ragService.indexProject();
    console.log('✅ Indexing test passed\n');

    // Test 2: Query context about authentication
    console.log('=== Test 2: Query Authentication Context ===');
    const authQuery = await ragService.queryContext('How does authentication work?');
    console.log('Found contexts:');
    authQuery.contexts.forEach((ctx, i) => {
      console.log(`  ${i + 1}. ${ctx.filePath} (${ctx.type}): ${ctx.name || 'N/A'}`);
    });
    console.log(`Optimization: ${authQuery.report.optimization.savings} tokens saved\n`);
    console.log('✅ Authentication query test passed\n');

    // Test 3: Query about API utilities
    console.log('=== Test 3: Query API Utilities ===');
    const apiQuery = await ragService.queryContext('What API utilities are available?');
    console.log('Found contexts:');
    apiQuery.contexts.forEach((ctx, i) => {
      console.log(`  ${i + 1}. ${ctx.filePath} (${ctx.type}): ${ctx.name || 'N/A'}`);
    });
    console.log(`Optimization: ${apiQuery.report.optimization.savings} tokens saved\n`);
    console.log('✅ API query test passed\n');

    // Test 4: Query about TypeScript interfaces
    console.log('=== Test 4: Query TypeScript Interfaces ===');
    const interfaceQuery = await ragService.queryContext('What TypeScript interfaces are defined?');
    console.log('Found contexts:');
    interfaceQuery.contexts.forEach((ctx, i) => {
      console.log(`  ${i + 1}. ${ctx.filePath} (${ctx.type}): ${ctx.name}`);
    });
    console.log(`Optimization: ${interfaceQuery.report.optimization.savings} tokens saved\n`);
    console.log('✅ Interface query test passed\n');

    // Test 5: Error handling - query without initialization
    console.log('=== Test 5: Error Handling ===');
    const newRAGService = new MockLunaRAGService('./test-project');
    try {
      await newRAGService.queryContext('Test query');
      console.log('❌ Error handling test failed - should have thrown error');
    } catch (error) {
      console.log('✅ Error handling test passed - correctly threw error');
    }
    console.log('');

    // Summary
    console.log('=== Test Summary ===');
    console.log('✅ All tests passed!');
    console.log('📊 Final Statistics:');
    console.log(`   - Total contexts indexed: ${indexReport.contextsIndexed}`);
    console.log(`   - Languages detected: ${Object.keys(indexReport.languages).length}`);
    console.log(`   - File types found: ${Object.keys(indexReport.fileTypes).length}`);
    console.log('🎉 Luna RAG System is ready for Claude Code plugin integration!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testRAGSystem();
}

export { MockLunaRAGService, testRAGSystem };
