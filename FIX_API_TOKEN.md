# Fix Cloudflare API Token Permissions

## 🔴 Current Issue

Your API token is missing these permissions:
- ❌ Cloudflare Pages (Edit)
- ❌ User Details (Read)
- ❌ Memberships (Read)

## ✅ Quick Fix (2 minutes)

### Option A: Edit Existing Token

1. **Open**: https://dash.cloudflare.com/profile/api-tokens
2. **Find** your current token in the list
3. **Click** "Edit" button
4. **Add these permissions**:
   - Account → **Cloudflare Pages** → **Edit**
   - User → **User Details** → **Read**
   - User → **Memberships** → **Read**
5. **Click** "Continue to summary"
6. **Click** "Update Token"

### Option B: Create New Token (Recommended)

1. **Open**: https://dash.cloudflare.com/profile/api-tokens
2. **Click** "Create Token"
3. **Click** "Use template" next to "Edit Cloudflare Workers"
4. **Add additional permissions**:
   - Account → **Cloudflare Pages** → **Edit**
5. **Click** "Continue to summary"
6. **Click** "Create Token"
7. **Copy** the token (you'll only see it once!)

8. **Update your environment**:
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export CLOUDFLARE_API_TOKEN="your_new_token_here"
   
   # Reload
   source ~/.zshrc
   ```

## 🚀 After Fixing

Try deploying again:

```bash
cd /Users/shaharsolomon/dev/projects/02_AI_AGENTS/claude-agent/luna-agents
wrangler pages deploy website --project-name=luna-agents
```

## 📋 Required Permissions Summary

Your token needs:

```
Account Permissions:
✅ Workers Scripts - Edit
✅ Workers KV Storage - Edit
✅ Cloudflare Pages - Edit

User Permissions:
✅ User Details - Read
✅ Memberships - Read
```

## 🎯 Alternative: Use Dashboard (Easier!)

If you don't want to deal with API tokens:

1. **Go to**: https://dash.cloudflare.com/
2. **Navigate**: Workers & Pages → Pages
3. **Click**: "Create application" → "Connect to Git"
4. **Select**: `shacharsol/luna-agent`
5. **Configure**:
   - Project name: `luna-agents`
   - Build output: `website`
6. **Deploy**: Done! ✅

This avoids all API token issues and takes ~5 minutes.

---

**Which do you prefer?**
- Fix token permissions (2 min) + deploy via CLI
- Use dashboard (5 min) - simpler, no token issues
