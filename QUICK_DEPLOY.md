# 🚀 Quick Deploy - Luna Agents Website

## Step-by-Step Cloudflare Pages Deployment

### 1. Open Cloudflare Dashboard
```
https://dash.cloudflare.com/
```

### 2. Navigate to Pages
- Click **"Workers & Pages"** (left sidebar)
- Click **"Pages"** tab
- Click **"Create application"**
- Click **"Connect to Git"**

### 3. Connect GitHub
- Click **"Connect GitHub"**
- Authorize Cloudflare (if needed)
- Select repository: **`shacharsol/luna-agent`**
- Click **"Begin setup"**

### 4. Configure Build Settings

**Copy these exact settings:**

```
Project name: luna-agents
Production branch: main
Framework preset: None
Build command: (leave empty)
Build output directory: website
Root directory: (leave as /)
```

### 5. Deploy
- Click **"Save and Deploy"**
- Wait ~1-2 minutes
- ✅ Site will be live at: `https://luna-agents.pages.dev`

### 6. Add Custom Domain
- In your project, click **"Custom domains"** tab
- Click **"Set up a custom domain"**
- Enter: **`agent.lunaos.ai`**
- Click **"Continue"**
- DNS auto-configured ✅
- SSL auto-provisioned ✅
- Wait ~2 minutes

### 7. Verify Deployment

Open these URLs:
```
https://agent.lunaos.ai
https://agent.lunaos.ai/pricing.html
https://agent.lunaos.ai/dashboard.html
```

All should load successfully! ✅

---

## 🎯 What You'll Have

After deployment:
- ✅ Marketing website live
- ✅ Pricing page with LemonSqueezy integration
- ✅ User dashboard
- ✅ Custom domain with SSL
- ✅ Global CDN
- ✅ Auto-deploy on git push

---

## ⏱️ Timeline

- Steps 1-3: 2 minutes
- Steps 4-5: 3 minutes (includes build time)
- Step 6: 2 minutes (DNS propagation)
- Step 7: 1 minute (verification)

**Total: ~8 minutes**

---

## 🆘 Troubleshooting

**Build fails?**
- Check that `website/` directory exists in repo
- Verify build output directory is set to `website`

**Custom domain not working?**
- Wait 2-5 minutes for DNS propagation
- Check that lunaos.ai is on Cloudflare
- Verify DNS records in Cloudflare DNS tab

**Pages not found?**
- Ensure files are in `website/` directory
- Check deployment logs in Cloudflare

---

## ✅ Success Checklist

- [ ] Cloudflare Pages project created
- [ ] GitHub repository connected
- [ ] Build settings configured
- [ ] First deployment successful
- [ ] Custom domain added
- [ ] SSL certificate active
- [ ] All pages loading
- [ ] Ready for LemonSqueezy setup!

---

**🎉 Once deployed, come back for LemonSqueezy setup!**
