# luna-rag - Intelligent Context Management

## Command Overview

The `luna-rag` command provides comprehensive Retrieval-Augmented Generation (RAG) capabilities for intelligent context management and AI enhancement.

## Usage

```bash
luna-rag [command] [options]
```

## Commands

### `init`
Initialize RAG system for the current project.

```bash
luna-rag init [options]
```

**Options:**
- `--project <path>` - Project path (default: current directory)
- `--vector-store <provider>` - Vector database provider (pinecone, weaviate, qdrant, chroma)
- `--embedding-model <model>` - Embedding model to use
- `--target-tokens <number>` - Target token count (default: 4000)
- `--strategy <type>` - Optimization strategy (balanced, maximum, quality)

**Example:**
```bash
luna-rag init --vector-store pinecone --embedding-model text-embedding-3-small
```

### `index`
Index project files for intelligent context retrieval.

```bash
luna-rag index [options]
```

**Options:**
- `--force` - Force re-indexing all files
- `--include <patterns>` - File patterns to include
- `--exclude <patterns>` - File patterns to exclude
- `--max-file-size <size>` - Maximum file size to process

**Example:**
```bash
luna-rag index --include "**/*.{js,ts,py}" --exclude "node_modules/**"
```

### `query`
Query project context with intelligent retrieval.

```bash
luna-rag query <query> [options]
```

**Options:**
- `--top-k <number>` - Number of contexts to retrieve (default: 10)
- `--optimize-tokens` - Enable token optimization (default: true)
- `--additional-context <text>` - Additional context for optimization
- `--filter <json>` - Filter contexts by metadata

**Example:**
```bash
luna-rag query "How does authentication work?" --top-k 5 --optimize-tokens
```

### `chat`
Interactive chat with project context.

```bash
luna-rag chat [options]
```

**Options:**
- `--model <model>` - AI model to use
- `--temperature <number>` - Response creativity (0-1)
- `--max-tokens <number>` - Maximum response tokens
- `--save-history <file>` - Save conversation history

**Example:**
```bash
luna-rag chat --model gpt-4 --temperature 0.7
```

### `update`
Update RAG index for specific files.

```bash
luna-rag update <files...> [options]
```

**Options:**
- `--incremental` - Incremental update (default: true)
- `--rebuild` - Rebuild contexts for updated files

**Example:**
```bash
luna-rag update src/auth/login.ts README.md
```

### `stats`
Display RAG system statistics and analytics.

```bash
luna-rag stats [options]
```

**Options:**
- `--detailed` - Show detailed statistics
- `--export <format>` - Export stats (json, csv)
- `--time-range <range>` - Time range for analytics (7d, 30d, 90d)

**Example:**
```bash
luna-rag stats --detailed --export json
```

### `config`
Manage RAG configuration.

```bash
luna-rag config [action] [options]
```

**Actions:**
- `show` - Show current configuration
- `set <key> <value>` - Set configuration value
- `reset` - Reset to default configuration

**Example:**
```bash
luna-rag config show
luna-rag config set targetTokens 6000
```

## Configuration

Create a `luna-rag.config.js` file in your project root:

```javascript
export default {
  projectPath: './',
  vectorStore: {
    provider: 'pinecone', // pinecone, weaviate, qdrant, chroma
    apiKey: process.env.PINECONE_API_KEY,
    environment: 'us-west1-gcp-free',
    indexName: 'my-project-rag',
    dimension: 1536
  },
  tokenOptimization: {
    targetTokens: 4000,
    strategy: 'balanced', // balanced, maximum, quality
    maxCompression: 0.7
  },
  aiProviders: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4'
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY
    }
  },
  extraction: {
    includePatterns: ['**/*.{js,ts,jsx,tsx,py,md}'],
    excludePatterns: ['node_modules/**', 'dist/**'],
    maxFileSize: 1024 * 1024
  }
};
```

## Environment Variables

```bash
# Vector Database
PINECONE_API_KEY=your_pinecone_api_key
WEAVIATE_API_KEY=your_weaviate_api_key
QDRANT_API_KEY=your_qdrant_api_key

# AI Providers
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
GOOGLE_API_KEY=your_google_api_key
```

## Output Files

RAG creates the following directory structure:

```
.luna/rag/
├── contexts/
│   ├── index.json          # Context index
│   ├── embeddings.json     # Generated embeddings
│   └── metadata.json       # Context metadata
├── reports/
│   ├── indexing-report.json    # Indexing statistics
│   ├── optimization-report.json # Token optimization stats
│   └── usage-analytics.json     # Usage analytics
├── cache/
│   ├── query-cache.json     # Query result cache
│   └── embedding-cache.json # Embedding cache
└── luna-rag.config.js      # Configuration file
```

## Examples

### Basic Project Setup
```bash
# Initialize RAG for your project
luna-rag init --vector-store pinecone

# Index your codebase
luna-rag index

# Query for information
luna-rag query "How does user authentication work?"
```

### Advanced Usage
```bash
# Chat with context about a specific feature
luna-rag chat --model gpt-4

# Update index after making changes
luna-rag update src/components/Button.tsx

# Get detailed analytics
luna-rag stats --detailed --export json
```

### Custom Configuration
```bash
# Use custom configuration
luna-rag --config ./custom-rag.config.js init

# Set specific optimization strategy
luna-rag query "Database schema" --strategy maximum
```

## Integration with Other Commands

The RAG system enhances other Luna commands:

- **`luna-openai-app`** - Creates context-aware AI applications
- **`luna-task-executor`** - Executes tasks with enhanced context
- **`luna-code-review`** - Reviews code with full project understanding
- **`luna-design`** - Creates designs with existing codebase context

## Troubleshooting

### Common Issues

**Vector Database Connection Failed**
```bash
# Check API key and connection
luna-rag config show
luna-rag stats --detailed
```

**Indexing Too Slow**
```bash
# Limit file size and patterns
luna-rag index --max-file-size 500000 --exclude "**/*.test.js"
```

**High Token Usage**
```bash
# Adjust optimization strategy
luna-rag config set targetTokens 2000
luna-rag config set strategy maximum
```

### Debug Mode

Enable debug logging:
```bash
DEBUG=luna-rag:* luna-rag query "Your question here"
```

## Best Practices

1. **Index Regularly**: Update index after significant code changes
2. **Optimize Tokens**: Use token optimization to reduce costs
3. **Choose Right Vector Store**: Select based on your scale and budget
4. **Monitor Usage**: Regularly check analytics for cost optimization
5. **Secure API Keys**: Use environment variables for all API keys

## Support

For help and support:
- Check the [documentation](../README.md)
- Review [troubleshooting](#troubleshooting)
- Open an issue on GitHub

---

*Transform your AI agents with intelligent context management* 🧠✨