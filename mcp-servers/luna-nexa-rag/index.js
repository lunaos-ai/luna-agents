#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ChromaClient } from 'chromadb';
import { readdir, readFile } from 'fs/promises';
import { join, extname, relative } from 'path';
import { loadConfig } from './config-manager.js';

class LunaNexaRAGServer {
  constructor() {
    this.server = new Server(
      { name: 'luna-nexa-rag', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.chromaClient = null;
    this.collection = null;
    this.config = null;
    this.setupHandlers();
  }

  async initialize() {
    // Load config from ~/.luna-nexa-rag-config.json
    this.config = await loadConfig();
    
    console.error('\n🌙 Luna Nexa RAG Configuration:');
    console.error(`📁 Project: ${this.config.projectPath}`);
    console.error(`🗄️  Collection: ${this.config.collectionName}`);
    console.error(`⚡ Nexa Embeddings: ${this.config.useNexaEmbeddings ? 'Enabled' : 'Disabled'}`);
    console.error('');

    try {
      this.chromaClient = new ChromaClient({
        path: `http://${this.config.chromaHost}:${this.config.chromaPort}`
      });
      
      // Create collection with Nexa embeddings if enabled
      if (this.config.useNexaEmbeddings) {
        this.collection = await this.chromaClient.getOrCreateCollection({
          name: this.config.collectionName,
          metadata: { 
            'hnsw:space': 'cosine',
            'embedding_function': 'nexa'
          },
          embeddingFunction: {
            generate: async (texts) => {
              return await this.getNexaEmbeddings(texts);
            }
          }
        });
        console.error(`✓ Using Nexa embeddings from ${this.config.nexaEndpoint}`);
      } else {
        this.collection = await this.chromaClient.getOrCreateCollection({
          name: this.config.collectionName,
          metadata: { 'hnsw:space': 'cosine' }
        });
        console.error(`✓ Using ChromaDB default embeddings`);
      }
      
      console.error(`✓ Connected to ChromaDB at ${this.config.chromaHost}:${this.config.chromaPort}`);
      console.error(`✓ Using collection: ${this.config.collectionName}`);
    } catch (error) {
      console.error('❌ Failed to initialize ChromaDB:', error.message);
      console.error('\n💡 Make sure ChromaDB is running:');
      console.error('   docker run -d -p 8000:8000 chromadb/chroma');
      if (this.config.useNexaEmbeddings) {
        console.error('\n💡 And Nexa server is running:');
        console.error('   nexa serve --host 127.0.0.1:8080');
      }
      console.error('');
    }
  }

  async getNexaEmbeddings(texts) {
    try {
      const response = await fetch(`${this.config.nexaEndpoint}/v1/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: texts,
          model: 'text-embedding'
        })
      });

      if (!response.ok) {
        throw new Error(`Nexa API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.map(item => item.embedding);
    } catch (error) {
      console.error('Failed to get Nexa embeddings:', error.message);
      throw error;
    }
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'index_codebase',
          description: 'Index project codebase for semantic search. Scans and embeds all code files.',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: {
                type: 'string',
                description: 'Path to project directory (default: from config)'
              },
              fileTypes: {
                type: 'array',
                items: { type: 'string' },
                description: 'File extensions to index',
                default: ['.js', '.ts', '.py', '.md', '.tsx', '.jsx', '.json']
              }
            }
          }
        },
        {
          name: 'search_context',
          description: 'Search codebase semantically for relevant context, code snippets, or implementations',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Natural language search query'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results',
                default: 5
              }
            },
            required: ['query']
          }
        },
        {
          name: 'get_similar_implementations',
          description: 'Find similar feature implementations or code patterns in the codebase',
          inputSchema: {
            type: 'object',
            properties: {
              feature: {
                type: 'string',
                description: 'Feature or pattern description'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results',
                default: 3
              }
            },
            required: ['feature']
          }
        },
        {
          name: 'get_coding_patterns',
          description: 'Extract coding patterns and standards from existing codebase',
          inputSchema: {
            type: 'object',
            properties: {
              patternType: {
                type: 'string',
                description: 'Type of pattern (e.g., "error-handling", "api-design", "testing")'
              }
            },
            required: ['patternType']
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'index_codebase':
            return await this.indexCodebase(
              args.projectPath || this.config.projectPath,
              args.fileTypes || this.config.fileTypes
            );

          case 'search_context':
            return await this.searchContext(args.query, args.limit || 5);

          case 'get_similar_implementations':
            return await this.getSimilarImplementations(args.feature, args.limit || 3);

          case 'get_coding_patterns':
            return await this.getCodingPatterns(args.patternType);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async walkDirectory(dir, fileTypes, files = []) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip common directories
          if (!['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '__pycache__'].includes(entry.name)) {
            await this.walkDirectory(fullPath, fileTypes, files);
          }
        } else if (entry.isFile() && fileTypes.includes(extname(entry.name))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading ${dir}:`, error.message);
    }

    return files;
  }

  async indexCodebase(projectPath, fileTypes) {
    if (!this.collection) {
      await this.initialize();
    }

    console.error(`\n📂 Indexing ${projectPath}...`);
    const files = await this.walkDirectory(projectPath, fileTypes);
    
    // Process files in batches for better performance
    const BATCH_SIZE = 50;
    let totalIndexed = 0;
    
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const documents = [];
      const metadatas = [];
      const ids = [];

      for (const file of batch) {
        try {
          const content = await readFile(file, 'utf-8');
          const relativePath = relative(projectPath, file);
          
          // Skip very large files (>100KB)
          if (content.length > 100000) {
            console.error(`⚠️  Skipping large file: ${relativePath}`);
            continue;
          }
          
          // Skip binary-looking content
          if (content.includes('\u0000')) {
            console.error(`⚠️  Skipping binary file: ${relativePath}`);
            continue;
          }
          
          documents.push(content);
          metadatas.push({
            file: relativePath,
            type: extname(file),
            size: content.length,
            timestamp: new Date().toISOString()
          });
          ids.push(relativePath);
        } catch (error) {
          console.error(`Failed to read ${file}:`, error.message);
        }
      }

      if (documents.length > 0) {
        console.error(`💾 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Adding ${documents.length} documents...`);
        await this.collection.add({
          documents,
          metadatas,
          ids
        });
        totalIndexed += documents.length;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully indexed ${totalIndexed} files from ${projectPath}\n\n📁 File types: ${fileTypes.join(', ')}\n🗄️  Collection: ${this.config.collectionName}\n${this.config.useNexaEmbeddings ? '⚡ Using Nexa embeddings for better quality' : '📊 Using ChromaDB default embeddings'}`
        }
      ]
    };
  }

  async searchContext(query, limit) {
    if (!this.collection) {
      await this.initialize();
    }

    console.error(`🔍 Searching for: "${query}"`);
    
    const results = await this.collection.query({
      queryTexts: [query],
      nResults: limit
    });

    if (!results.documents[0] || results.documents[0].length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No results found. Make sure the codebase is indexed first.'
          }
        ]
      };
    }

    const formattedResults = results.documents[0].map((doc, idx) => ({
      file: results.metadatas[0][idx].file,
      relevance: (1 - results.distances[0][idx]).toFixed(3),
      snippet: doc.substring(0, 300) + (doc.length > 300 ? '...' : ''),
      type: results.metadatas[0][idx].type
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${formattedResults.length} relevant contexts:\n\n${JSON.stringify(formattedResults, null, 2)}`
        }
      ]
    };
  }

  async getSimilarImplementations(feature, limit) {
    if (!this.collection) {
      await this.initialize();
    }

    console.error(`🔎 Finding similar implementations for: "${feature}"`);

    // Try multiple query strategies
    const queries = [
      `${feature} implementation`,
      `${feature} example code`,
      `how to implement ${feature}`
    ];

    const allResults = [];
    
    for (const query of queries) {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: limit
      });

      if (results.documents[0]) {
        results.documents[0].forEach((doc, idx) => {
          allResults.push({
            file: results.metadatas[0][idx].file,
            relevance: (1 - results.distances[0][idx]).toFixed(3),
            code: doc,
            type: results.metadatas[0][idx].type
          });
        });
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.file, item])).values()
    )
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${uniqueResults.length} similar implementations for "${feature}":\n\n${JSON.stringify(uniqueResults, null, 2)}`
        }
      ]
    };
  }

  async getCodingPatterns(patternType) {
    if (!this.collection) {
      await this.initialize();
    }

    console.error(`📋 Extracting coding patterns for: "${patternType}"`);

    const results = await this.collection.query({
      queryTexts: [`${patternType} pattern best practices coding standard`],
      nResults: 10
    });

    if (!results.documents[0] || results.documents[0].length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No coding patterns found for "${patternType}". Make sure the codebase is indexed.`
          }
        ]
      };
    }

    const patterns = results.documents[0].map((doc, idx) => ({
      file: results.metadatas[0][idx].file,
      pattern: this.extractPattern(doc, patternType),
      relevance: (1 - results.distances[0][idx]).toFixed(3)
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Coding patterns for "${patternType}":\n\n${JSON.stringify(patterns, null, 2)}`
        }
      ]
    };
  }

  extractPattern(code, patternType) {
    // Extract relevant code patterns
    const lines = code.split('\n');
    const relevantLines = lines.filter(line => 
      line.includes('function') || 
      line.includes('class') || 
      line.includes('const') ||
      line.includes('async') ||
      line.includes('try') ||
      line.includes('catch') ||
      line.includes('import') ||
      line.includes('export')
    ).slice(0, 15);

    return relevantLines.join('\n');
  }

  async run() {
    await this.initialize();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('\n🌙 Luna Nexa RAG MCP Server Running');
    console.error('================================');
    console.error(`📁 Project Path: ${this.config.projectPath}`);
    console.error(`🗄️  Collection: ${this.config.collectionName}`);
    console.error(`🔗 ChromaDB: ${this.config.chromaHost}:${this.config.chromaPort}`);
    if (this.config.useNexaEmbeddings) {
      console.error(`⚡ Nexa Backend: ${this.config.nexaEndpoint}`);
      console.error(`🚀 Using Nexa for high-quality embeddings`);
    }
    console.error('================================\n');
  }
}

// Start the server
const server = new LunaNexaRAGServer();
server.run().catch(console.error);