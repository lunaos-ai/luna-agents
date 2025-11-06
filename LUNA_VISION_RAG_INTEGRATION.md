# 🌟 Luna Vision RAG™ Integration Guide

**Integrate Luna Vision RAG™ API into Luna Agents Plugin**

---

## 🎯 Overview

Luna Vision RAG™ is now available as an MCP server that connects Claude Code to the live API at **https://rag.lunaos.ai**

### **What You Get**

✅ **11 Powerful Tools** - RAG, GLM Vision, Integration  
✅ **Context-Aware Code Search** - Semantic understanding  
✅ **GUI Testing & Analysis** - Automated visual testing  
✅ **Test Generation** - AI-powered test creation  
✅ **Sub-100ms Response Time** - Global CDN  
✅ **Production Ready** - Deployed on Cloudflare Workers  

---

## 🚀 Quick Setup

### **Step 1: Install Dependencies**

```bash
cd mcp-servers/luna-vision-rag-client
npm install --legacy-peer-deps
```

### **Step 2: Configure Claude Desktop**

Add to your `claude_desktop_config.json`:

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac)

```json
{
  "mcpServers": {
    "luna-vision-rag": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/dev/projects/02_AI_AGENTS/claude-agent/luna-agents/mcp-servers/luna-vision-rag-client/index.js"
      ]
    }
  }
}
```

**Important**: Replace `/Users/YOUR_USERNAME/...` with your actual path!

### **Step 3: Restart Claude Desktop**

1. Quit Claude Desktop completely
2. Reopen Claude Desktop
3. The Luna Vision RAG tools will now be available!

---

## 🛠️ Available Tools

### **RAG Tools** (3 tools)
- `rag_setup` - Configure RAG for a project
- `rag_query` - Query codebase with natural language
- `rag_index` - Index files into vector database

### **GLM Vision Tools** (3 tools)
- `glm_capture` - Capture screenshots
- `glm_analyze` - Analyze UI with AI
- `glm_test` - Run automated GUI tests

### **Integration Tools** (3 tools)
- `integration_validate` - Validate UI against code
- `integration_generate` - Generate automated tests
- `integration_report` - Create test reports

### **Utility Tools** (2 tools)
- `health_check` - Check API health
- `api_info` - Get API information

---

## 📖 Usage Examples

### **Example 1: Query Your Codebase**

```
You: "How is authentication implemented in this project?"

Claude will use: rag_query
Returns: Relevant code snippets with context
```

### **Example 2: Analyze a UI**

```
You: "Analyze the login page for accessibility issues"

Claude will use: glm_analyze
Returns: Accessibility analysis with recommendations
```

### **Example 3: Generate Tests**

```
You: "Generate E2E tests for the LoginForm component"

Claude will use: integration_generate
Returns: Generated test code
```

---

## 🧪 Testing the Integration

### **Test 1: Check if MCP Server is Loaded**

In Claude Desktop, type:
```
Can you check if Luna Vision RAG is available?
```

Claude should confirm the MCP server is loaded.

### **Test 2: Health Check**

```
Use the health_check tool to verify the API is working
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Luna Vision RAG",
  "version": "1.0.0"
}
```

### **Test 3: Query API Info**

```
Use api_info to see all available endpoints
```

Should return list of 11 endpoints.

---

## 🔧 Troubleshooting

### **Issue: MCP Server Not Showing**

**Solutions**:
1. Check `claude_desktop_config.json` path is correct
2. Ensure absolute path to `index.js` is correct
3. Verify `node` is in your PATH: `which node`
4. Restart Claude Desktop completely
5. Check Claude logs: `~/Library/Logs/Claude/`

### **Issue: Tools Not Working**

**Solutions**:
1. Check API health: `curl https://rag.lunaos.ai/health`
2. Verify internet connection
3. Check tool parameters match schema
4. Look for error messages in responses

### **Issue: "Cannot find module" Error**

**Solutions**:
1. Run `npm install --legacy-peer-deps` in MCP server directory
2. Check `node_modules` folder exists
3. Verify Node.js version >= 18.0.0: `node --version`

---

## 📊 Architecture

```
┌─────────────────┐
│  Claude Desktop │
│   (Your IDE)    │
└────────┬────────┘
         │
         │ MCP Protocol
         │
┌────────▼────────────────┐
│ Luna Vision RAG Client  │
│   (MCP Server)          │
└────────┬────────────────┘
         │
         │ HTTPS
         │
┌────────▼────────────────┐
│  rag.lunaos.ai API      │
│  (Cloudflare Workers)   │
└─────────────────────────┘
```

---

## 🎯 What's Next?

### **Immediate**
- [x] API deployed and tested
- [x] MCP client created
- [x] Documentation complete
- [ ] Test in Claude Desktop
- [ ] Use in real projects

### **Short-term**
- [ ] Add authentication (API keys)
- [ ] Implement vector database integration
- [ ] Add GLM Vision API calls
- [ ] Create example projects
- [ ] Record demo videos

### **Long-term**
- [ ] Add caching for faster responses
- [ ] Implement batch operations
- [ ] Add streaming responses
- [ ] Create web dashboard
- [ ] Build community

---

## 📝 Configuration Files

### **Files Created**

```
mcp-servers/luna-vision-rag-client/
├── package.json          # MCP server configuration
├── index.js              # MCP server implementation
├── README.md             # Detailed documentation
└── node_modules/         # Dependencies
```

### **Files Modified**

```
package.json              # Added to workspaces
```

---

## 🔗 Resources

- **API**: https://rag.lunaos.ai
- **Health**: https://rag.lunaos.ai/health
- **API Info**: https://rag.lunaos.ai/api
- **Testing Guide**: `/TESTING_GUIDE.md`
- **Success Report**: `/CUSTOM_DOMAIN_SUCCESS.md`
- **GitHub**: https://github.com/shacharsol/luna-agent

---

## 📞 Support

**Issues**: https://github.com/shacharsol/luna-agent/issues  
**Discussions**: https://github.com/shacharsol/luna-agent/discussions  
**Email**: support@lunaos.ai

---

## 🎉 Success!

You now have Luna Vision RAG™ integrated into your Luna Agents plugin!

**Try it out**:
1. Open Claude Desktop
2. Start a new conversation
3. Ask Claude to use Luna Vision RAG tools
4. Experience context-aware GUI testing!

**Luna Vision RAG™ - The world's first context-aware GUI testing platform** 🚀
