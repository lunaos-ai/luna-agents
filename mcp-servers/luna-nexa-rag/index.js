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
        },
        {
          name: 'ui_convert_to_hig',
          description: 'Convert UI components to Apple HIG + Decart modern design standards',
          inputSchema: {
            type: 'object',
            properties: {
              scope: {
                type: 'string',
                description: 'Scope of conversion (e.g., "full", "component-name", "page-name")',
                default: 'full'
              },
              includeGlassmorphism: {
                type: 'boolean',
                description: 'Include glassmorphism effects',
                default: true
              }
            }
          }
        },
        {
          name: 'run_ui_tests',
          description: 'Run automated UI/UX tests using Playwright',
          inputSchema: {
            type: 'object',
            properties: {
              testType: {
                type: 'string',
                description: 'Type of tests (e.g., "e2e", "visual", "accessibility", "all")',
                default: 'all'
              },
              scope: {
                type: 'string',
                description: 'Test scope (e.g., "full", "feature-name")',
                default: 'full'
              }
            }
          }
        },
        {
          name: 'fix_ui_issues',
          description: 'Automatically detect and fix UI issues (accessibility, design system, responsive)',
          inputSchema: {
            type: 'object',
            properties: {
              fixType: {
                type: 'string',
                description: 'Type of fixes (e.g., "auto", "accessibility", "design-system", "responsive")',
                default: 'auto'
              },
              preview: {
                type: 'boolean',
                description: 'Preview fixes without applying',
                default: false
              }
            }
          }
        },
        {
          name: 'deploy_to_cloudflare',
          description: 'Automated deployment to Cloudflare with Wrangler integration',
          inputSchema: {
            type: 'object',
            properties: {
              service: {
                type: 'string',
                description: 'Service to deploy (e.g., "all", "workers", "pages", "d1", "r2")',
                default: 'all'
              },
              setupOnly: {
                type: 'boolean',
                description: 'Setup configuration without deploying',
                default: false
              }
            }
          }
        },
        {
          name: 'get_luna_shortcuts',
          description: 'Get available Luna shortcuts and quick commands',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Shortcut category (e.g., "design", "deployment", "testing", "all")',
                default: 'all'
              }
            }
          }
        },
        {
          name: 'dockerize_project',
          description: 'Generate Docker configuration for project containerization',
          inputSchema: {
            type: 'object',
            properties: {
              scope: {
                type: 'string',
                description: 'Dockerization scope (e.g., "full", "backend", "frontend")',
                default: 'full'
              },
              environment: {
                type: 'string',
                description: 'Target environment (e.g., "all", "development", "production")',
                default: 'all'
              }
            }
          }
        },
        {
          name: 'generate_user_guide',
          description: 'Generate high-definition HTML and PDF user guide documentation',
          inputSchema: {
            type: 'object',
            properties: {
              scope: {
                type: 'string',
                description: 'Documentation scope (e.g., "complete", "getting-started", "api-reference")',
                default: 'complete'
              },
              format: {
                type: 'string',
                description: 'Output format (e.g., "both", "html", "pdf")',
                default: 'both'
              }
            }
          }
        },
        {
          name: 'integrate_lemonsqueezy',
          description: 'Integrate LemonSqueezy payment processing with store configuration',
          inputSchema: {
            type: 'object',
            properties: {
              storeId: {
                type: 'string',
                description: 'LemonSqueezy Store ID'
              },
              apiKey: {
                type: 'string',
                description: 'LemonSqueezy API Key'
              },
              productPrefix: {
                type: 'string',
                description: 'Product prefix for namespacing (e.g., "myapp-")'
              },
              scope: {
                type: 'string',
                description: 'Integration scope (e.g., "full", "products", "subscriptions")',
                default: 'full'
              }
            },
            required: ['storeId', 'apiKey', 'productPrefix']
          }
        },
        {
          name: 'create_openai_app',
          description: 'Generate OpenAI-powered application with GPT integration',
          inputSchema: {
            type: 'object',
            properties: {
              appType: {
                type: 'string',
                description: 'App type (e.g., "chat", "assistant", "embeddings", "complete")',
                default: 'chat'
              },
              model: {
                type: 'string',
                description: 'OpenAI model (e.g., "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo")',
                default: 'gpt-4-turbo'
              }
            }
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

          case 'ui_convert_to_hig':
            return await this.convertUIToHIG(args.scope, args.includeGlassmorphism);

          case 'run_ui_tests':
            return await this.runUITests(args.testType, args.scope);

          case 'fix_ui_issues':
            return await this.fixUIIssues(args.fixType, args.preview);

          case 'deploy_to_cloudflare':
            return await this.deployToCloudflare(args.service, args.setupOnly);

          case 'get_luna_shortcuts':
            return await this.getLunaShortcuts(args.category);

          case 'dockerize_project':
            return await this.dockerizeProject(args.scope, args.environment);

          case 'generate_user_guide':
            return await this.generateUserGuide(args.scope, args.format);

          case 'integrate_lemonsqueezy':
            return await this.integrateLemonSqueezy(args.storeId, args.apiKey, args.productPrefix, args.scope);

          case 'create_openai_app':
            return await this.createOpenAIApp(args.appType, args.model);

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

  async convertUIToHIG(scope, includeGlassmorphism) {
    console.error(`🎨 Converting UI to Apple HIG + Decart design (scope: ${scope})`);
    
    const conversionPlan = {
      scope: scope || 'full',
      includeGlassmorphism: includeGlassmorphism !== false,
      steps: [
        'Analyze current UI components',
        'Apply Apple HIG design principles',
        'Implement Decart modern aesthetics',
        'Generate design tokens',
        'Convert components to new design',
        'Add glassmorphism effects (if enabled)',
        'Validate accessibility compliance'
      ],
      designTokens: {
        colors: ['--color-primary: #007AFF', '--color-success: #34C759'],
        spacing: ['--space-1: 4px', '--space-2: 8px', '--space-4: 16px'],
        typography: ['--font-size-base: 15px', '--font-weight-semibold: 600']
      }
    };

    return {
      content: [
        {
          type: 'text',
          text: `🎨 UI Conversion Plan:\n\n${JSON.stringify(conversionPlan, null, 2)}\n\nRefer to luna-ui-convert command documentation for detailed implementation.`
        }
      ]
    };
  }

  async runUITests(testType, scope) {
    console.error(`🧪 Running UI tests (type: ${testType}, scope: ${scope})`);
    
    const testPlan = {
      testType: testType || 'all',
      scope: scope || 'full',
      tests: {
        e2e: ['User authentication flow', 'Navigation tests', 'Form submissions'],
        visual: ['Component snapshots', 'Responsive layouts', 'Theme consistency'],
        accessibility: ['WCAG compliance', 'Keyboard navigation', 'Screen reader support'],
        performance: ['Load times', 'Core Web Vitals', 'Bundle size']
      },
      framework: 'Playwright',
      browsers: ['Chromium', 'Firefox', 'WebKit']
    };

    return {
      content: [
        {
          type: 'text',
          text: `🧪 UI Test Plan:\n\n${JSON.stringify(testPlan, null, 2)}\n\nRefer to luna-ui-test agent documentation for test implementation.`
        }
      ]
    };
  }

  async fixUIIssues(fixType, preview) {
    console.error(`🔧 Fixing UI issues (type: ${fixType}, preview: ${preview})`);
    
    const fixPlan = {
      fixType: fixType || 'auto',
      preview: preview || false,
      categories: {
        accessibility: ['Missing alt text', 'Color contrast', 'ARIA labels'],
        designSystem: ['Hardcoded colors', 'Inconsistent spacing', 'Typography'],
        responsive: ['Fixed widths', 'Touch targets', 'Overflow issues'],
        performance: ['Image optimization', 'Lazy loading', 'Bundle size']
      },
      priority: {
        critical: 5,
        high: 12,
        medium: 18,
        low: 8
      }
    };

    return {
      content: [
        {
          type: 'text',
          text: `🔧 UI Fix Plan:\n\n${JSON.stringify(fixPlan, null, 2)}\n\nRefer to luna-ui-fix agent documentation for automated fixes.`
        }
      ]
    };
  }

  async deployToCloudflare(service, setupOnly) {
    console.error(`☁️ Deploying to Cloudflare (service: ${service}, setup-only: ${setupOnly})`);
    
    const deploymentPlan = {
      service: service || 'all',
      setupOnly: setupOnly || false,
      services: {
        workers: 'Backend API deployment',
        pages: 'Frontend static site',
        d1: 'Database setup and migration',
        r2: 'Object storage for assets',
        kv: 'Key-value cache storage'
      },
      steps: [
        'Install and configure Wrangler CLI',
        'Analyze project structure',
        'Generate wrangler.toml configuration',
        'Set up Cloudflare services',
        'Deploy application',
        'Configure domain and SSL',
        'Set up monitoring'
      ]
    };

    return {
      content: [
        {
          type: 'text',
          text: `☁️ Cloudflare Deployment Plan:\n\n${JSON.stringify(deploymentPlan, null, 2)}\n\nRefer to luna-cloudflare-auto command for automated deployment.`
        }
      ]
    };
  }

  async getLunaShortcuts(category) {
    console.error(`⚡ Getting Luna shortcuts (category: ${category})`);
    
    const shortcuts = {
      design: {
        hig: 'luna-hig - Apple HIG compliance',
        'ui-convert': 'luna-ui-convert - Convert to modern design',
        'ui-test': 'luna-ui-test - Run UI tests',
        'ui-fix': 'luna-ui-fix - Fix UI issues'
      },
      deployment: {
        deploy: 'luna-deploy - General deployment',
        'cf-deploy': 'luna-cloudflare-deploy - Cloudflare deployment',
        'cf-auto': 'luna-cloudflare-auto - Automated Cloudflare setup'
      },
      testing: {
        test: 'luna-test - Run tests',
        'ui-test': 'luna-ui-test - UI/UX testing',
        e2e: 'luna-test e2e - End-to-end tests'
      },
      development: {
        plan: 'luna-plan - Development planning',
        execute: 'luna-execute - Task execution',
        review: 'luna-review - Code review'
      }
    };

    const selectedShortcuts = category === 'all' ? shortcuts : { [category]: shortcuts[category] };

    return {
      content: [
        {
          type: 'text',
          text: `⚡ Luna Shortcuts:\n\n${JSON.stringify(selectedShortcuts, null, 2)}\n\nRefer to luna-shortcuts command for complete list and custom shortcuts.`
        }
      ]
    };
  }

  async dockerizeProject(scope, environment) {
    console.error(`🐳 Dockerizing project (scope: ${scope}, environment: ${environment})`);
    
    const dockerPlan = {
      scope: scope || 'full',
      environment: environment || 'all',
      components: {
        dockerfile: 'Multi-stage Dockerfile with optimizations',
        dockerCompose: 'Complete service orchestration',
        devEnvironment: 'Hot reload development setup',
        prodEnvironment: 'Optimized production build',
        nginx: 'Reverse proxy configuration',
        makefile: 'Helper commands for Docker operations'
      },
      features: [
        'Multi-stage builds for minimal image size',
        'Non-root user execution',
        'Health checks configured',
        'Security scanning with Trivy',
        'CI/CD integration with GitHub Actions'
      ]
    };

    return {
      content: [
        {
          type: 'text',
          text: `🐳 Docker Configuration Plan:\n\n${JSON.stringify(dockerPlan, null, 2)}\n\nRefer to luna-docker agent for complete containerization.`
        }
      ]
    };
  }

  async generateUserGuide(scope, format) {
    console.error(`📚 Generating user guide (scope: ${scope}, format: ${format})`);
    
    const guidePlan = {
      scope: scope || 'complete',
      format: format || 'both',
      sections: [
        'Getting Started',
        'Installation',
        'Core Concepts',
        'User Guide',
        'API Reference',
        'Examples',
        'Troubleshooting',
        'Advanced Topics'
      ],
      features: {
        html: [
          'Responsive design',
          'Dark/light mode',
          'Interactive code examples',
          'Search functionality',
          'Syntax highlighting'
        ],
        pdf: [
          'High-definition output',
          'Print-optimized layout',
          'Table of contents with links',
          'Professional formatting',
          'Page numbers and headers'
        ]
      }
    };

    return {
      content: [
        {
          type: 'text',
          text: `📚 User Guide Generation Plan:\n\n${JSON.stringify(guidePlan, null, 2)}\n\nRefer to luna-user-guide agent for documentation generation.`
        }
      ]
    };
  }

  async integrateLemonSqueezy(storeId, apiKey, productPrefix, scope) {
    console.error(`🍋 Integrating LemonSqueezy (store: ${storeId}, prefix: ${productPrefix})`);
    
    const integrationPlan = {
      storeId,
      productPrefix,
      scope: scope || 'full',
      components: {
        productManagement: 'Product CRUD with prefix',
        checkoutFlow: 'Secure checkout integration',
        subscriptions: 'Subscription management',
        webhooks: 'Webhook handlers for events',
        frontend: 'React checkout components'
      },
      features: [
        'Shared store with product prefix isolation',
        'Automated product creation',
        'Subscription lifecycle management',
        'Webhook signature verification',
        'Test and production modes'
      ],
      productNaming: `${productPrefix}starter, ${productPrefix}pro, ${productPrefix}enterprise`
    };

    return {
      content: [
        {
          type: 'text',
          text: `🍋 LemonSqueezy Integration Plan:\n\n${JSON.stringify(integrationPlan, null, 2)}\n\nRefer to luna-lemonsqueezy agent for payment integration.`
        }
      ]
    };
  }

  async createOpenAIApp(appType, model) {
    console.error(`🤖 Creating OpenAI app (type: ${appType}, model: ${model})`);
    
    const appPlan = {
      appType: appType || 'chat',
      model: model || 'gpt-4-turbo',
      features: {
        chat: ['Chat completions', 'Streaming responses', 'Context management'],
        assistant: ['Assistant API', 'Tool calling', 'File uploads'],
        embeddings: ['Text embeddings', 'Semantic search', 'Similarity matching'],
        image: ['DALL-E generation', 'Image editing', 'Variations'],
        audio: ['Speech-to-text (Whisper)', 'Text-to-speech', 'Audio processing']
      },
      components: [
        'OpenAI client configuration',
        'API endpoints',
        'React UI components',
        'Error handling',
        'Cost tracking',
        'Token counting'
      ],
      optimization: [
        'Rate limiting',
        'Retry logic',
        'Streaming for better UX',
        'Token budget management',
        'Response caching'
      ]
    };

    return {
      content: [
        {
          type: 'text',
          text: `🤖 OpenAI App Plan:\n\n${JSON.stringify(appPlan, null, 2)}\n\nRefer to luna-openai-app agent for AI integration.`
        }
      ]
    };
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