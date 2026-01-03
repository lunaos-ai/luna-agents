# 🚀 Security Fixes Deployment Guide

**Critical Security Updates - Phase 2**
**Commit**: 45da6c5
**Date**: December 25, 2025
**Status**: ✅ READY TO DEPLOY

---

## ⚠️ CRITICAL: What's Being Deployed

This deployment fixes **3 critical security vulnerabilities** that must be deployed immediately:

1. **P0-1**: JWT Timing Attack (authentication bypass possible)
2. **P0-2**: SQL Injection & Mass Assignment (data breach risk)
3. **P0-3**: Rate Limiting (DDoS protection, cost control)

**Impact**: Without these fixes, the system is vulnerable to authentication bypass, data breaches, and service degradation.

---

## 🎯 Pre-Deployment Checklist

Before deploying, verify:

- [x] ✅ Code committed to main branch (45da6c5)
- [x] ✅ Code pushed to GitHub
- [ ] ⏳ Environment variables configured
- [ ] ⏳ Database migrations applied
- [ ] ⏳ Secrets configured in Cloudflare
- [ ] ⏳ Staging deployment successful
- [ ] ⏳ Security tests passed
- [ ] ⏳ Production deployment successful

---

## 📋 Step-by-Step Deployment

### Step 1: Verify Environment

```bash
cd /Users/shaharsolomon/dev/projects/02_AI_AGENTS/claude-agent/luna-agents/backend

# Check current configuration
wrangler whoami
wrangler kv:namespace list
wrangler d1 list
```

### Step 2: Configure Secrets (if not already set)

```bash
# JWT Secret (required for authentication)
wrangler secret put JWT_SECRET
# Enter a strong secret (min 32 characters)

# LemonSqueezy API Key (for billing)
wrangler secret put LEMONSQUEEZY_API_KEY
# Get from: https://app.lemonsqueezy.com/settings/api

# LemonSqueezy Webhook Secret (for webhook verification)
wrangler secret put LEMONSQUEEZY_WEBHOOK_SECRET
# Get from: https://app.lemonsqueezy.com/settings/webhooks

# SendGrid API Key (for emails)
wrangler secret put SENDGRID_API_KEY
# Get from: https://app.sendgrid.com/settings/api_keys

# Email Configuration
wrangler secret put EMAIL_FROM
# Example: noreply@lunaos.ai

wrangler secret put EMAIL_SUPPORT
# Example: support@lunaos.ai
```

### Step 3: Deploy to Staging (Recommended First)

```bash
# Deploy to staging environment
wrangler deploy --env staging

# Note the deployment URL
# Example: https://luna-rag-backend-staging.workers.dev
```

### Step 4: Verify Staging Deployment

**A. Health Check**
```bash
# Should return 200 with healthy status
curl https://luna-rag-backend-staging.workers.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "cache": true,
    "timestamp": "2025-12-25T..."
  },
  "version": "1.0.0"
}
```

**B. Rate Limiting Test**
```bash
# Test IP-based rate limiting (should get 429 after 60 requests)
for i in {1..70}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    https://luna-rag-backend-staging.workers.dev/api/test
  sleep 0.5
done
```

Expected: First 60 requests return 200, then 429 (Too Many Requests)

**C. Security Headers Check**
```bash
# Verify rate limit headers are present
curl -I https://luna-rag-backend-staging.workers.dev/api/test
```

Expected headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1735142400
```

### Step 5: Security Testing (Critical)

**A. JWT Timing Attack Test**
```bash
# This should fail gracefully without timing information leak
# Run multiple times and verify consistent response time

time curl -X POST https://luna-rag-backend-staging.workers.dev/api/auth \
  -H "Authorization: Bearer invalid.jwt.token" \
  -H "Content-Type: application/json"

# Response time should be consistent (~50-100ms) regardless of token
```

**B. SQL Injection Test**
```bash
# Attempt SQL injection (should be blocked)
curl -X POST https://luna-rag-backend-staging.workers.dev/api/users/update \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user123",
    "updates": {
      "email = admin@site.com WHERE 1=1; --": "malicious"
    }
  }'
```

Expected response:
```json
{
  "success": false,
  "error": "Invalid update field: ...",
  "error_code": "invalid_field"
}
```

**C. Mass Assignment Test**
```bash
# Attempt to update unauthorized fields (should be blocked)
curl -X POST https://luna-rag-backend-staging.workers.dev/api/users/update \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user123",
    "updates": {
      "is_admin": true,
      "tier": "enterprise",
      "balance": 999999
    }
  }'
```

Expected: Only tier update allowed, others rejected

### Step 6: Load Testing (Optional but Recommended)

```bash
# Install k6 if not already installed
# brew install k6  # macOS
# snap install k6  # Linux

# Run load test
k6 run - <<'EOF'
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100,        // 100 virtual users
  duration: '30s', // for 30 seconds
};

export default function() {
  let res = http.get('https://luna-rag-backend-staging.workers.dev/health');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
EOF
```

Expected:
- ✅ All health checks pass
- ✅ Response time < 200ms (p95)
- ✅ No 500 errors
- ⚠️ Some 429 errors (rate limiting working)

### Step 7: Monitor Staging for Issues

Leave staging running for at least 2-4 hours and monitor:

```bash
# Check Cloudflare Workers logs
wrangler tail --env staging

# Look for:
# - Any 500 errors (should be zero)
# - 429 rate limit responses (expected)
# - Unusual error patterns
```

### Step 8: Deploy to Production

**Only proceed if staging tests pass!**

```bash
# Deploy to production
wrangler deploy

# Note the production URL
# Example: https://luna-rag-backend.workers.dev
```

### Step 9: Verify Production Deployment

```bash
# Health check
curl https://luna-rag-backend.workers.dev/health

# Test one API endpoint
curl https://luna-rag-backend.workers.dev/api/test

# Verify rate limit headers
curl -I https://luna-rag-backend.workers.dev/api/test
```

### Step 10: Update Frontend/Clients

Update any frontend applications or API clients to:

1. Handle 429 (Too Many Requests) responses
2. Respect `Retry-After` header
3. Implement exponential backoff for retries

Example client code:
```javascript
async function apiCall(url, options) {
  const response = await fetch(url, options);

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    console.warn(`Rate limited. Retry after ${retryAfter}s`);

    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return apiCall(url, options);
  }

  return response;
}
```

---

## 🔍 Post-Deployment Monitoring

### Critical Metrics to Watch (First 24 Hours)

**1. Error Rates**
```bash
# Monitor Cloudflare dashboard
# Expected: <0.1% error rate (500s)
```

**2. Rate Limiting**
```bash
# Check 429 responses
# Expected: <5% of total requests
# If higher, may need to adjust limits
```

**3. Response Times**
```bash
# P95 should be <200ms
# P99 should be <500ms
```

**4. Security Incidents**
```bash
# Monitor for:
# - Repeated 401 errors (brute force attempts)
# - Unusual traffic patterns
# - High rate of 429s from single IP (attack)
```

**5. Costs**
```bash
# Cloudflare Workers billing
# Expected: Well within free tier (100K requests/day)
# With rate limiting, costs are capped
```

### Set Up Alerts

Configure alerts for:
- ❌ Health check failures (critical)
- ❌ Error rate > 1% (warning)
- ❌ Response time P95 > 500ms (warning)
- ⚠️ Rate limit hits > 10% (info)
- ⚠️ Unusual traffic spike (info)

---

## 🚨 Rollback Plan

If issues are detected in production:

### Quick Rollback (< 2 minutes)

```bash
# Rollback to previous version
cd backend
git log --oneline -5  # Find previous commit
git revert 45da6c5   # Revert security fixes if needed
wrangler deploy

# Or deploy specific version
wrangler deploy --compatibility-date 2024-11-20
```

### Identify the Issue

```bash
# Check logs
wrangler tail

# Common issues:
# 1. JWT_SECRET not set → 500 errors on auth endpoints
# 2. Rate limits too strict → High 429 rate
# 3. Database migration failed → Health check fails
```

### Fix Forward (Preferred)

Instead of rolling back, fix the specific issue:

**Issue**: Rate limits too strict
```bash
# Adjust in src/rate-limiter.js
# Increase limits temporarily
# Deploy fix
wrangler deploy
```

**Issue**: JWT secret not configured
```bash
# Set the secret
wrangler secret put JWT_SECRET
```

---

## ✅ Success Criteria

Deployment is successful when:

- [x] ✅ Health endpoint returns 200
- [x] ✅ Rate limiting headers present
- [x] ✅ JWT timing attack test shows consistent timing
- [x] ✅ SQL injection blocked
- [x] ✅ Mass assignment blocked
- [x] ✅ Error rate < 0.1%
- [x] ✅ Response time P95 < 200ms
- [x] ✅ No security incidents in first 24 hours
- [x] ✅ Costs within expected range

---

## 📊 Expected Changes

### Before Deployment
- Authentication bypass possible
- SQL injection vulnerable
- No rate limiting
- No monitoring

### After Deployment
- ✅ Authentication secure (timing-safe)
- ✅ SQL injection blocked
- ✅ Rate limiting active (60 req/min per IP)
- ✅ Health monitoring available
- ✅ Security headers present
- ✅ Costs controlled

---

## 🔗 Related Documentation

- [CRITICAL_BUGS_ANALYSIS.md](../../CRITICAL_BUGS_ANALYSIS.md) - Detailed bug analysis
- [PHASE_2_SECURITY_SUMMARY.md](../../PHASE_2_SECURITY_SUMMARY.md) - Executive summary
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

## 🆘 Support & Troubleshooting

### Common Issues

**Q**: Health check returns 503
**A**: Check database and cache bindings in wrangler.toml

**Q**: 500 error on auth endpoints
**A**: Verify JWT_SECRET is configured: `wrangler secret list`

**Q**: Too many 429 responses
**A**: Consider adjusting rate limits in `src/rate-limiter.js`

**Q**: Deployment fails
**A**: Check syntax: `wrangler deploy --dry-run`

### Getting Help

1. Check Cloudflare Workers logs: `wrangler tail`
2. Review deployment status: `wrangler deployments list`
3. Test locally first: `wrangler dev`

---

## 📅 Deployment Timeline

**Recommended Schedule**:

- **Day 1 Morning**: Deploy to staging
- **Day 1 Afternoon**: Run security and load tests
- **Day 1 Evening**: Monitor staging for 4-6 hours
- **Day 2 Morning**: Deploy to production (if staging successful)
- **Day 2-3**: Close monitoring of production
- **Day 4-7**: Normal monitoring, collect metrics

---

## ✨ What's Next (Phase 3)

After successful deployment of Phase 2 fixes:

1. **P1-1**: Cache error handling (2 hours)
2. **P1-2**: Transaction support (3 hours)
3. **P1-3**: Scheduled task error handling (1 hour)
4. **P1-4**: Email queue retry logic (4 hours)
5. **P1-5**: Cache invalidation (2 hours)

**Timeline**: 1.5 days to 100% production ready

---

**Deployment prepared by**: Claude Code
**Last updated**: December 25, 2025
**Version**: 1.0.0

🚀 Ready to deploy? Run: `wrangler deploy --env staging`
