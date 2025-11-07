# Luna Agents Deployment Guide

**Complete step-by-step guide to deploy your monetization system**

---

## 🎯 Overview

This guide will help you deploy:
1. ✅ Marketing website (Cloudflare Pages)
2. ✅ API auth service (Cloudflare Workers)
3. ✅ LemonSqueezy payment processing

**Total time: ~1 hour**

---

## 📋 Prerequisites

- [ ] Cloudflare account (free)
- [ ] GitHub account (you have this)
- [ ] LemonSqueezy account (will create)
- [ ] Domain: lunaos.ai (you have this)

---

## Part 1: Deploy Website to Cloudflare Pages

### Step 1: Push Code to GitHub ✅

Your code is already on GitHub at: `shacharsol/luna-agent`

### Step 2: Create Cloudflare Pages Project

1. **Go to Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com/
   ```

2. **Navigate to Pages**
   - Click "Workers & Pages" in left sidebar
   - Click "Pages" tab
   - Click "Create application"
   - Click "Connect to Git"

3. **Connect GitHub**
   - Click "Connect GitHub"
   - Authorize Cloudflare
   - Select repository: `shacharsol/luna-agent`
   - Click "Begin setup"

4. **Configure Build Settings**
   ```
   Project name: luna-agents
   Production branch: main
   Framework preset: None
   Build command: (leave empty)
   Build output directory: website
   Root directory: (leave as /)
   ```

5. **Deploy**
   - Click "Save and Deploy"
   - Wait ~1-2 minutes
   - Your site is live at: `https://luna-agents.pages.dev`

### Step 3: Add Custom Domain

1. **In your Pages project**
   - Click "Custom domains" tab
   - Click "Set up a custom domain"

2. **Add domain**
   ```
   Domain: agent.lunaos.ai
   ```
   - Click "Continue"
   - DNS will be configured automatically (since lunaos.ai is on Cloudflare)
   - SSL certificate provisioned automatically
   - Wait ~2 minutes for activation

3. **Verify**
   ```bash
   curl -I https://agent.lunaos.ai
   ```
   Should return `200 OK`

---

## Part 2: Deploy API Auth Service

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### Step 2: Create KV Namespace

```bash
cd api-auth

# Create KV namespace for production
wrangler kv:namespace create "API_KEYS"
```

**Output will be:**
```
✨ Success!
Add the following to your wrangler.toml:
{ binding = "API_KEYS", id = "abc123def456..." }
```

**Copy the ID** and update `api-auth/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "API_KEYS"
id = "PASTE_YOUR_KV_ID_HERE"  # ← Replace this
```

### Step 3: Set Webhook Secret

```bash
# Generate a secure random secret
openssl rand -hex 32

# Output example: a1b2c3d4e5f6...
# Copy this value!

# Set it as a Cloudflare secret
wrangler secret put WEBHOOK_SECRET
# Paste the secret when prompted
```

**Save this secret** - you'll need it for the webhook handler!

### Step 4: Deploy Auth Service

```bash
# Still in api-auth directory
wrangler deploy
```

**Output:**
```
✨ Success! Deployed to:
https://luna-agents-api-auth.YOUR_SUBDOMAIN.workers.dev
```

**Copy this URL** - this is your auth service endpoint!

### Step 5: Add Custom Domain (Optional)

1. **In Cloudflare Dashboard**
   - Go to Workers & Pages
   - Find `luna-agents-api-auth`
   - Click "Triggers" tab
   - Click "Add Custom Domain"

2. **Add domain**
   ```
   Domain: auth.lunaos.ai
   ```
   - Click "Add Custom Domain"
   - DNS configured automatically
   - Wait ~2 minutes

3. **Update dashboard.js**

Edit `website/dashboard.js`:
```javascript
const AUTH_SERVICE_URL = 'https://auth.lunaos.ai';  // ← Your custom domain
```

Commit and push:
```bash
git add website/dashboard.js
git commit -m "Update auth service URL"
git push origin main
```

Cloudflare Pages will auto-deploy the update!

---

## Part 3: Set Up LemonSqueezy

### Step 1: Create Account

1. **Go to LemonSqueezy**
   ```
   https://lemonsqueezy.com
   ```

2. **Sign up**
   - Click "Start Selling"
   - Sign up with email or GitHub
   - Verify email

### Step 2: Create Store

1. **Store Setup**
   ```
   Store Name: Luna Agents
   Store URL: lunaagents
   Currency: USD
   ```

2. **Tax Settings**
   - Enable "Automatic tax calculation"
   - This handles VAT, sales tax, etc.

### Step 3: Create Products

#### Product 1: Luna Agents Pro (Monthly)

1. **Click "Products" → "New Product"**

2. **Product Details**
   ```
   Name: Luna Agents Pro
   Description: Professional AI-powered development lifecycle with Luna Vision RAG™
   Price: $29.00 USD
   ```

3. **Billing**
   ```
   Type: Subscription
   Interval: Monthly
   Trial: 14 days
   ```

4. **Features** (add to description)
   ```
   - 10 AI Agents for complete development lifecycle
   - Luna Vision RAG™ - Cloud GUI testing
   - 11 Vision Tools - Screenshot analysis, UI testing
   - Unlimited code indexing
   - Unlimited queries
   - Priority support
   - Advanced analytics
   - API access
   ```

5. **Save** and **copy the Product ID**
   - Example: `123456`

#### Product 2: Luna Agents Pro (Annual)

1. **Create another product**
   ```
   Name: Luna Agents Pro (Annual)
   Description: Professional AI-powered development lifecycle - Annual plan (Save 20%)
   Price: $276.00 USD ($23/month)
   Billing: Annual subscription
   Trial: 14 days
   ```

2. **Save** and **copy the Product ID**

### Step 4: Update Website Code

Edit `website/pricing.js`:

```javascript
const LEMONSQUEEZY_CONFIG = {
    pro: {
        monthly: '123456',  // ← Your monthly product ID
        annual: '789012'    // ← Your annual product ID
    }
};
```

Commit and push:
```bash
git add website/pricing.js
git commit -m "Add LemonSqueezy product IDs"
git push origin main
```

### Step 5: Configure Webhook

1. **In LemonSqueezy Dashboard**
   - Go to Settings → Webhooks
   - Click "Add endpoint"

2. **Webhook Configuration**
   ```
   URL: https://YOUR_API_DOMAIN/webhooks/lemonsqueezy
   Secret: Click "Generate" and copy it
   ```

3. **Select Events**
   - ✅ subscription_created
   - ✅ subscription_updated
   - ✅ subscription_cancelled
   - ✅ subscription_resumed
   - ✅ subscription_expired
   - ✅ subscription_payment_success
   - ✅ subscription_payment_failed

4. **Save**

5. **Update webhook handler**

Edit `webhooks/lemonsqueezy.js`:
```javascript
process.env.AUTH_SERVICE_URL = 'https://auth.lunaos.ai';
process.env.WEBHOOK_SECRET = 'YOUR_CLOUDFLARE_WEBHOOK_SECRET';  // From Step 2.3
process.env.LEMONSQUEEZY_WEBHOOK_SECRET = 'YOUR_LEMONSQUEEZY_SECRET';  // From above
```

---

## Part 4: Testing

### Test 1: Website

```bash
# Visit your website
open https://agent.lunaos.ai

# Check pages
open https://agent.lunaos.ai/pricing.html
open https://agent.lunaos.ai/dashboard.html
```

### Test 2: API Auth Service

```bash
# Test validation endpoint
curl -X POST https://auth.lunaos.ai/validate \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "test_key"}'

# Should return: {"valid": false, "error": "Invalid API key"}
```

### Test 3: LemonSqueezy Checkout

1. **Enable Test Mode**
   - In LemonSqueezy Dashboard
   - Toggle "Test Mode" ON

2. **Test Purchase**
   - Go to https://agent.lunaos.ai/pricing.html
   - Click "Start Pro Trial"
   - Should open LemonSqueezy checkout

3. **Use Test Card**
   ```
   Card: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits
   ```

4. **Complete Purchase**
   - Should create subscription
   - Webhook should fire
   - API key should be generated

### Test 4: Dashboard

1. **Get API key from webhook logs**
2. **Go to dashboard**
   ```
   https://agent.lunaos.ai/dashboard.html
   ```
3. **Enter API key**
4. **Should show subscription info**

---

## Part 5: Go Live

### Step 1: Disable Test Mode

1. **In LemonSqueezy**
   - Toggle "Test Mode" OFF
   - You're now accepting real payments!

### Step 2: Update Product IDs

Make sure `pricing.js` has the **production** product IDs (not test mode IDs).

### Step 3: Announce Launch

1. **Update GitHub README**
   - Add pricing info
   - Add dashboard link
   - Add Pro features

2. **Social Media**
   - Twitter/X announcement
   - LinkedIn post
   - Dev.to article

3. **Email Users** (if you have a list)
   - Announce Pro tier
   - Highlight Luna Vision RAG™
   - Offer launch discount?

---

## 🎉 You're Live!

### Your URLs

- **Website**: https://agent.lunaos.ai
- **Pricing**: https://agent.lunaos.ai/pricing.html
- **Dashboard**: https://agent.lunaos.ai/dashboard.html
- **Auth API**: https://auth.lunaos.ai
- **RAG API**: https://rag.lunaos.ai

### Monitor

- **Cloudflare Analytics**: Workers & Pages → Analytics
- **LemonSqueezy Dashboard**: Revenue, subscriptions, customers
- **Webhook Logs**: Check for errors

---

## 🆘 Troubleshooting

### Website not deploying
- Check Cloudflare Pages build logs
- Verify `website/` directory exists
- Check GitHub connection

### API auth not working
- Verify KV namespace ID in wrangler.toml
- Check webhook secret is set
- View Worker logs: `wrangler tail`

### LemonSqueezy webhook failing
- Check webhook URL is correct
- Verify webhook secret matches
- Check webhook logs in LemonSqueezy

### Dashboard not loading data
- Verify AUTH_SERVICE_URL is correct
- Check browser console for errors
- Test API endpoint directly with curl

---

## 📞 Support

- **Cloudflare**: https://dash.cloudflare.com/support
- **LemonSqueezy**: help@lemonsqueezy.com
- **Your Issues**: https://github.com/shacharsol/luna-agent/issues

---

## ✅ Deployment Checklist

- [ ] Website deployed to Cloudflare Pages
- [ ] Custom domain agent.lunaos.ai configured
- [ ] API auth service deployed
- [ ] KV namespace created
- [ ] Webhook secret set
- [ ] Custom domain auth.lunaos.ai configured
- [ ] LemonSqueezy account created
- [ ] Store configured
- [ ] Products created (Monthly & Annual)
- [ ] Product IDs added to pricing.js
- [ ] Webhook configured
- [ ] Test mode tested
- [ ] Production mode enabled
- [ ] All URLs working
- [ ] Dashboard tested
- [ ] Ready to make money! 💰

---

**🚀 Your complete SaaS is now live and ready to generate revenue!**
