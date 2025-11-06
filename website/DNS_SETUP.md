# DNS Setup for agent.lunaos.ai

## ✅ Custom Domain Configured

Your Luna Agents marketing website will be live at:

**https://agent.lunaos.ai**

---

## 🌐 DNS Configuration

Since `lunaos.ai` is already on Cloudflare, the DNS setup is automatic!

### What Cloudflare Does Automatically

When you add `agent.lunaos.ai` as a custom domain in Cloudflare Pages:

1. ✅ Creates CNAME record automatically
2. ✅ Provisions SSL certificate
3. ✅ Enables CDN caching
4. ✅ Activates DDoS protection

### Expected DNS Record

```
Type: CNAME
Name: agent
Target: luna-agents.pages.dev
Proxy: Yes (orange cloud)
TTL: Auto
```

---

## 🚀 Setup Steps in Cloudflare Pages

1. **Go to Your Project**
   - Dashboard → Pages → luna-agents

2. **Add Custom Domain**
   - Click "Custom domains" tab
   - Click "Set up a custom domain"
   - Enter: `agent.lunaos.ai`
   - Click "Continue"

3. **Automatic Configuration**
   - Cloudflare detects `lunaos.ai` is on your account
   - DNS record created automatically
   - SSL certificate provisioned
   - Done! ✅

4. **Verify**
   - Wait 1-2 minutes for DNS propagation
   - Visit: https://agent.lunaos.ai
   - Your site should be live!

---

## 🔍 Verify DNS Setup

### Check DNS Record

```bash
# Check CNAME record
dig agent.lunaos.ai CNAME

# Should show:
# agent.lunaos.ai. 300 IN CNAME luna-agents.pages.dev.
```

### Check SSL Certificate

```bash
# Check SSL
curl -I https://agent.lunaos.ai

# Should show:
# HTTP/2 200
# server: cloudflare
```

### Browser Test

1. Open: https://agent.lunaos.ai
2. Check for 🔒 (SSL active)
3. Verify site loads correctly

---

## 📊 DNS Propagation

- **Cloudflare Network**: Instant (< 1 minute)
- **Global DNS**: 5-15 minutes
- **Full Propagation**: Up to 24 hours (rare)

Check propagation status:
- https://www.whatsmydns.net/#CNAME/agent.lunaos.ai

---

## 🎯 Final URLs

### Production Site
- **Primary**: https://agent.lunaos.ai
- **Cloudflare**: https://luna-agents.pages.dev

Both URLs will work, but `agent.lunaos.ai` is your branded domain!

### API Endpoints (Existing)
- **RAG API**: https://rag.lunaos.ai
- **MCP Server**: https://luna-vision-rag-mcp.broad-dew-49ad.workers.dev/mcp

---

## 🔧 Troubleshooting

### Domain Not Working

1. **Check DNS Record**
   ```bash
   dig agent.lunaos.ai
   ```
   Should return Cloudflare IPs

2. **Check Cloudflare Pages**
   - Verify custom domain is added
   - Check deployment status
   - Ensure site is deployed

3. **Clear Cache**
   - Browser cache: Cmd+Shift+R
   - Cloudflare cache: Purge in dashboard

### SSL Certificate Issues

- Wait 5 minutes for provisioning
- Check "SSL/TLS" → "Edge Certificates" in Cloudflare
- Ensure "Always Use HTTPS" is enabled

### 404 Errors

- Verify deployment completed successfully
- Check `website` directory has `index.html`
- Ensure build output directory is set to `website`

---

## ✅ Checklist

- [x] Custom domain configured in Cloudflare Pages
- [x] DNS record created (automatic)
- [x] SSL certificate provisioned (automatic)
- [ ] Verify site loads at https://agent.lunaos.ai
- [ ] Test all navigation links
- [ ] Check mobile responsiveness
- [ ] Enable Web Analytics (optional)

---

## 🎉 You're All Set!

Your Luna Agents marketing website will be live at:

**https://agent.lunaos.ai**

Perfect branding with the `lunaos.ai` domain! 🚀

---

## 📝 Notes

- **Automatic Deployments**: Every push to `main` auto-deploys
- **Preview URLs**: PRs get preview deployments
- **Global CDN**: 200+ locations worldwide
- **Zero Downtime**: Atomic deployments
- **Free SSL**: Auto-renewed certificates
- **Unlimited Bandwidth**: No limits!

**Your marketing site is production-ready!** 🌟
