# Deploy Luna Agents Website to Cloudflare Pages

## 🚀 Quick Deploy

### Option 1: Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Navigate to: Pages

2. **Create New Project**
   - Click "Create a project"
   - Select "Connect to Git"

3. **Connect GitHub**
   - Authorize Cloudflare to access your GitHub
   - Select repository: `shacharsol/luna-agent`

4. **Configure Build**
   - **Project name**: `luna-agents`
   - **Production branch**: `main`
   - **Build command**: (leave empty)
   - **Build output directory**: `website`
   - **Root directory**: `/`

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for deployment (usually < 1 minute)

6. **Your Site is Live!**
   - URL: `https://luna-agents.pages.dev`
   - Custom domain: Configure in settings

### Option 2: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy from website directory
cd website
wrangler pages deploy . --project-name=luna-agents

# Your site is live!
```

## 🌐 Custom Domain Setup

### Add Custom Domain (e.g., lunaagents.ai)

1. **In Cloudflare Pages Dashboard**
   - Go to your project
   - Click "Custom domains"
   - Click "Set up a custom domain"

2. **Add Domain**
   - Enter: `lunaagents.ai`
   - Click "Continue"

3. **DNS Configuration**
   - Cloudflare will show DNS records to add
   - If domain is on Cloudflare: Records added automatically
   - If domain elsewhere: Add CNAME record manually

4. **Verify**
   - Wait for DNS propagation (usually < 5 minutes)
   - Your site will be live at your custom domain

### Example DNS Records

```
Type: CNAME
Name: @
Target: luna-agents.pages.dev
Proxy: Yes (orange cloud)

Type: CNAME  
Name: www
Target: luna-agents.pages.dev
Proxy: Yes (orange cloud)
```

## ⚙️ Build Configuration

### Cloudflare Pages Settings

```yaml
Build command: (empty)
Build output directory: website
Root directory: /
Node version: 18
```

### Environment Variables

None required - it's a static site!

## 🔄 Automatic Deployments

Every push to `main` branch automatically deploys:

1. Push code to GitHub
2. Cloudflare detects changes
3. Builds and deploys automatically
4. Live in < 1 minute

### Preview Deployments

Every pull request gets a preview URL:
- `https://[commit-hash].luna-agents.pages.dev`

## 📊 Performance

Cloudflare Pages provides:

- ✅ **Global CDN** - 200+ locations
- ✅ **Instant Cache** - Sub-50ms response
- ✅ **Auto SSL** - Free HTTPS
- ✅ **DDoS Protection** - Enterprise-grade
- ✅ **Unlimited Bandwidth** - No limits
- ✅ **Unlimited Requests** - No limits

## 🛠️ Advanced Configuration

### Custom Headers

Create `_headers` file in website directory:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Redirects

Create `_redirects` file in website directory:

```
/docs https://github.com/shacharsol/luna-agent/blob/main/README.md 301
/github https://github.com/shacharsol/luna-agent 301
```

### 404 Page

Create `404.html` in website directory for custom 404 page.

## 📈 Analytics

Enable Web Analytics in Cloudflare Pages:

1. Go to project settings
2. Click "Web Analytics"
3. Enable analytics
4. Add tracking code to `index.html`

## 🔐 Access Control

### Password Protection

1. Go to project settings
2. Click "Access policies"
3. Enable "Require authentication"
4. Set password

### IP Allowlist

Configure in Cloudflare Firewall Rules.

## 🚀 Deployment Commands

### Deploy Production

```bash
cd website
wrangler pages deploy . --project-name=luna-agents --branch=main
```

### Deploy Preview

```bash
cd website
wrangler pages deploy . --project-name=luna-agents --branch=preview
```

### Check Deployment Status

```bash
wrangler pages deployment list --project-name=luna-agents
```

## 🐛 Troubleshooting

### Build Fails

- Check build output directory is `website`
- Ensure all files are committed to Git
- Verify no build command is set

### Custom Domain Not Working

- Check DNS records are correct
- Wait for DNS propagation (up to 24 hours)
- Verify domain is active in Cloudflare

### 404 Errors

- Ensure `index.html` is in root of `website` directory
- Check file paths are correct
- Clear Cloudflare cache

## 📝 Checklist

- [ ] GitHub repository connected
- [ ] Build settings configured
- [ ] First deployment successful
- [ ] Site accessible at `.pages.dev` URL
- [ ] Custom domain added (optional)
- [ ] DNS records configured (if custom domain)
- [ ] SSL certificate active
- [ ] Analytics enabled (optional)

## 🎯 Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ✅ Add custom domain
3. ✅ Enable analytics
4. ✅ Set up monitoring
5. ✅ Share with the world!

## 🔗 Useful Links

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler
- **Custom Domains**: https://developers.cloudflare.com/pages/platform/custom-domains

---

**🎉 Your Luna Agents website is now on Cloudflare's global network!**
