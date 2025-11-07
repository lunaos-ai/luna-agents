# 🧠 Luna RAG - Automatic Setup for Users

## ✅ Already Configured for You!

When you installed Luna Agents, RAG was **automatically** configured in your Claude Desktop setup. No additional setup required!

## 🚀 How to Use RAG in Claude Code

### It's as simple as having a conversation!

**Just ask Claude questions about your code:**

```
How does user authentication work in this project?
```

```
Find me similar implementations to the payment processing feature
```

```
What are the coding patterns used for error handling?
```

```
Search for database connection examples in the codebase
```

```
Can you show me how API endpoints are structured?
```

### No Commands Needed!

Unlike traditional tools, you **don't need to run any commands**. Luna RAG integrates directly with Claude Code through MCP (Model Context Protocol).

## 🎯 What Makes Luna RAG Special

### **Semantic Understanding**
- Understands the **meaning** of your code, not just keywords
- Finds related code even if it uses different variable names
- Understands context and relationships between files

### **Context-Aware**
- Remembers the conversation context
- Builds upon previous questions
- Provides increasingly accurate answers

### **Smart Code Discovery**
- Finds implementations you didn't know existed
- Identifies patterns and best practices in your codebase
- Helps understand complex architectures

## 🆚 Free vs Premium Features

### **Free Tier (Included)**
- ✅ Local semantic search
- ✅ Code pattern recognition
- ✅ Implementation discovery
- ✅ Context-aware conversations
- ✅ Works offline (after initial indexing)

### **Premium Features ($29/month)**
- 🚀 **Luna Vision RAG™** - Screenshot analysis + code context
- 🚀 **GLM Vision** - Advanced visual AI testing
- 🚀 **Unlimited indexing** - No limits on codebase size
- 🚀 **Cloud processing** - Faster and more powerful
- 🚀 **Priority support** - Fast assistance

## 💡 Pro Tips

### **Getting Started**
1. **Open your project** in VS Code with Claude Code
2. **Ask a question** about your codebase
3. **Watch the magic happen!**

### **Best Questions to Ask**
- "How does [feature] work?"
- "Find similar implementations to [X]"
- "What are the patterns for [concern]?"
- "Show me examples of [technology]"

### **Advanced Usage**
- **Compare implementations**: "How do these two authentication methods differ?"
- **Learn patterns**: "What's the standard way to handle errors here?"
- **Discover features**: "Are there any utility functions for [task]?"

## 🛠️ Troubleshooting

### **"RAG isn't working"**
1. Restart Claude Desktop
2. Check you're in a project folder
3. Try a simple question first

### **"ChromaDB connection failed"**
```bash
# Start ChromaDB manually
docker run -d --name luna-chroma -p 8000:8000 chromadb/chroma
```

### **Check Your Setup**
Look for these in your Claude Desktop config:
- `luna-nexa-rag` (local RAG)
- `luna-vision-rag` (cloud premium)

## 🎉 You're Ready!

That's it! You now have intelligent code search built into your development workflow. Just start asking questions and let Luna RAG help you understand your codebase better.

---

**🌙 Happy coding with Luna RAG!**

Need help? Visit https://agent.lunaos.ai or email support@lunaos.ai