# 🔧 Fix Cloudflare API Token - Step by Step

## Current Issue
Your token is missing these permissions:
- ❌ Cloudflare Pages - Edit
- ❌ User Details - Read
- ❌ Memberships - Read

## 🎯 Fix in 2 Minutes

### Step 1: Open Token Settings
```
https://dash.cloudflare.com/profile/api-tokens
```

### Step 2: Find Your Token
Look for the token that starts with: `6MLsG6s4m1UmfObiD87n...`

### Step 3: Click "Edit" Button
On the right side of your token row

### Step 4: Add Missing Permissions

**Scroll down to "Permissions" section**

Click **"+ Add more"** three times and add:

#### Permission 1:
- **Account** → **Cloudflare Pages** → **Edit**

#### Permission 2:
- **User** → **User Details** → **Read**

#### Permission 3:
- **User** → **Memberships** → **Read**

### Step 5: Save Changes
1. Click **"Continue to summary"**
2. Click **"Update Token"**

### Step 6: Test Deployment
```bash
cd /Users/shaharsolomon/dev/projects/02_AI_AGENTS/claude-agent/luna-agents
./deploy-website.sh
```

---

## ✅ Expected Permissions After Fix

Your token should have:

**Account Permissions:**
- ✅ Workers Scripts - Edit
- ✅ Workers KV Storage - Edit
- ✅ **Cloudflare Pages - Edit** ← NEW

**User Permissions:**
- ✅ **User Details - Read** ← NEW
- ✅ **Memberships - Read** ← NEW

---

## 🆘 If This Doesn't Work

**Option: Create New Token**

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Click **"Use template"** next to **"Edit Cloudflare Workers"**
4. **Add these extra permissions**:
   - Account → Cloudflare Pages → Edit
   - User → User Details → Read
   - User → Memberships → Read
5. Click **"Continue to summary"**
6. Click **"Create Token"**
7. **Copy the token** (you'll only see it once!)
8. Update your `~/.zshrc`:
   ```bash
   export CLOUDFLARE_API_TOKEN="your_new_token_here"
   ```
9. Reload:
   ```bash
   source ~/.zshrc
   ```
10. Deploy:
   ```bash
   ./deploy-website.sh
   ```

---

## 🚀 After Token is Fixed

Run this command to deploy:

```bash
cd /Users/shaharsolomon/dev/projects/02_AI_AGENTS/claude-agent/luna-agents
./deploy-website.sh
```

Expected output:
```
✅ Deployment successful!
🌐 Your website is live at:
   https://luna-agents.pages.dev
```

Then add custom domain `agent.lunaos.ai` in the Cloudflare Dashboard!

---

**Need help? The token settings page is here:**
https://dash.cloudflare.com/profile/api-tokens
