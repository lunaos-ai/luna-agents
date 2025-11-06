# LemonSqueezy Setup Guide for Luna Agents

## 🍋 Why LemonSqueezy?

LemonSqueezy is perfect for Luna Agents because:
- ✅ **Simpler than Stripe** - Less complexity, faster setup
- ✅ **Handles taxes automatically** - VAT, sales tax, all covered
- ✅ **Built for SaaS** - Subscriptions, trials, upgrades
- ✅ **No merchant account needed** - Start selling immediately
- ✅ **Lower fees** - 5% + payment processing
- ✅ **Better for digital products** - Made for software

---

## 📋 Setup Steps

### Step 1: Create LemonSqueezy Account

1. Go to https://lemonsqueezy.com
2. Click **"Start Selling"**
3. Sign up with email or GitHub
4. Complete your store setup

### Step 2: Create Your Store

1. **Store Name**: Luna Agents
2. **Store URL**: `lunaagents` (becomes lunaagents.lemonsqueezy.com)
3. **Currency**: USD
4. **Tax Settings**: Enable automatic tax calculation

### Step 3: Create Products

#### Product 1: Luna Agents Pro (Monthly)

```
Product Name: Luna Agents Pro
Description: Professional AI-powered development lifecycle
Price: $29.00 USD
Billing: Monthly subscription
Trial: 14 days free
```

**Features to list:**
- 10 AI Agents for complete development lifecycle
- Luna Vision RAG™ - Cloud GUI testing
- 11 Vision Tools - Screenshot analysis, UI testing
- Unlimited code indexing
- Unlimited queries
- Priority support
- Advanced analytics
- API access

#### Product 2: Luna Agents Pro (Annual)

```
Product Name: Luna Agents Pro (Annual)
Description: Professional AI-powered development lifecycle - Annual plan
Price: $276.00 USD ($23/month - Save 20%)
Billing: Annual subscription
Trial: 14 days free
```

Same features as monthly plan.

### Step 4: Configure Checkout

1. **Checkout Settings**:
   - Enable email collection
   - Enable name collection
   - Custom success URL: `https://agent.lunaos.ai/welcome`
   - Custom cancel URL: `https://agent.lunaos.ai/pricing`

2. **Email Settings**:
   - Enable purchase confirmation emails
   - Enable trial reminder emails
   - Enable renewal reminder emails

### Step 5: Get Product IDs

After creating products:

1. Go to **Products** in dashboard
2. Click on **Luna Agents Pro (Monthly)**
3. Copy the **Product ID** (looks like: `123456`)
4. Click on **Luna Agents Pro (Annual)**
5. Copy the **Product ID**

### Step 6: Update Website Code

Edit `website/pricing.js`:

```javascript
const LEMONSQUEEZY_CONFIG = {
    pro: {
        monthly: 'YOUR_PRO_MONTHLY_PRODUCT_ID', // Replace with actual ID
        annual: 'YOUR_PRO_ANNUAL_PRODUCT_ID'    // Replace with actual ID
    }
};
```

Replace with your actual product IDs from Step 5.

### Step 7: Test Checkout

1. Go to your pricing page: `https://agent.lunaos.ai/pricing`
2. Click **"Start Pro Trial"**
3. Should open LemonSqueezy checkout
4. Use test mode to verify flow

---

## 🔐 API Integration (Optional - For Dashboard)

### Get API Key

1. Go to **Settings** → **API**
2. Click **"Create API Key"**
3. Name: `Luna Agents Dashboard`
4. Copy the API key (save it securely!)

### API Endpoints

```javascript
// Verify subscription status
GET https://api.lemonsqueezy.com/v1/subscriptions/{subscription_id}
Headers: {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Accept': 'application/vnd.api+json'
}

// Get customer subscriptions
GET https://api.lemonsqueezy.com/v1/subscriptions?filter[customer_id]={customer_id}

// Cancel subscription
DELETE https://api.lemonsqueezy.com/v1/subscriptions/{subscription_id}
```

---

## 💳 Payment Methods

LemonSqueezy accepts:
- ✅ Credit/Debit Cards (Visa, Mastercard, Amex)
- ✅ PayPal
- ✅ Apple Pay
- ✅ Google Pay
- ✅ Bank transfers (for annual plans)

---

## 📊 Webhooks Setup

### Configure Webhooks

1. Go to **Settings** → **Webhooks**
2. Click **"Add endpoint"**
3. **URL**: `https://api.lunaos.ai/webhooks/lemonsqueezy`
4. **Events to subscribe**:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_resumed`
   - `subscription_expired`
   - `subscription_payment_success`
   - `subscription_payment_failed`

### Webhook Handler Example

```javascript
// webhook-handler.js
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return digest === signature;
}

app.post('/webhooks/lemonsqueezy', async (req, res) => {
    const signature = req.headers['x-signature'];
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    
    if (!verifyWebhook(JSON.stringify(req.body), signature, secret)) {
        return res.status(401).send('Invalid signature');
    }
    
    const event = req.body;
    
    switch (event.meta.event_name) {
        case 'subscription_created':
            // Grant access to Luna Vision RAG™
            await grantProAccess(event.data.attributes.customer_id);
            break;
            
        case 'subscription_cancelled':
            // Revoke access
            await revokeProAccess(event.data.attributes.customer_id);
            break;
            
        case 'subscription_payment_failed':
            // Send notification
            await notifyPaymentFailed(event.data.attributes.customer_id);
            break;
    }
    
    res.status(200).send('OK');
});
```

---

## 🎯 Customer Portal

LemonSqueezy provides a built-in customer portal where users can:
- ✅ View subscription details
- ✅ Update payment method
- ✅ Download invoices
- ✅ Cancel subscription
- ✅ Update billing info

**Portal URL**: Automatically sent in confirmation emails

---

## 📈 Analytics & Reporting

LemonSqueezy dashboard provides:
- 📊 Revenue tracking
- 👥 Customer analytics
- 💰 MRR (Monthly Recurring Revenue)
- 📉 Churn rate
- 🔄 Subscription metrics
- 💳 Payment success rate

---

## 🌍 Tax Compliance

LemonSqueezy handles:
- ✅ **EU VAT** - Automatic calculation and remittance
- ✅ **US Sales Tax** - State-by-state compliance
- ✅ **GST** (Australia, India, etc.)
- ✅ **Tax exemptions** - For businesses with valid tax IDs
- ✅ **Invoicing** - Automatic generation with tax details

---

## 🔧 Testing

### Test Mode

1. Enable **Test Mode** in dashboard
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any CVC

### Test Scenarios

```
✅ Successful payment
✅ Trial period
✅ Subscription renewal
✅ Failed payment
✅ Cancellation
✅ Upgrade/downgrade
```

---

## 💰 Pricing Structure

### Your Fees

- **Transaction Fee**: 5% of sale
- **Payment Processing**: 
  - Cards: 2.9% + $0.30
  - PayPal: 3.5% + $0.30

### Example Calculation

For a $29 Pro subscription:
- Gross: $29.00
- LemonSqueezy fee (5%): $1.45
- Payment processing: $1.14
- **Your net**: ~$26.41 (91%)

---

## 🚀 Go Live Checklist

- [ ] LemonSqueezy account created
- [ ] Store configured
- [ ] Products created (Monthly & Annual)
- [ ] Product IDs added to website code
- [ ] Checkout tested in test mode
- [ ] Webhooks configured
- [ ] API key generated (if using dashboard)
- [ ] Tax settings verified
- [ ] Email templates customized
- [ ] Customer portal tested
- [ ] Switch to live mode
- [ ] Test real purchase (refund after)

---

## 📞 Support

**LemonSqueezy Support**:
- Email: help@lemonsqueezy.com
- Docs: https://docs.lemonsqueezy.com
- Discord: https://discord.gg/lemonsqueezy

**Luna Agents**:
- Email: support@lunaos.ai
- GitHub: https://github.com/shacharsol/luna-agent

---

## 🎉 Next Steps

After LemonSqueezy setup:

1. **Create API Key System** - For Luna Vision RAG™ access
2. **Build User Dashboard** - Subscription management
3. **Set up Email Automation** - Welcome, onboarding, tips
4. **Create Documentation** - How to use Pro features
5. **Launch Marketing** - Announce Pro tier

---

## 💡 Pro Tips

1. **Offer Annual Discount** - 20% off encourages commitment
2. **14-Day Trial** - No credit card = more signups
3. **Clear Cancellation** - Easy to cancel = more trust
4. **Transparent Pricing** - No hidden fees
5. **Great Support** - Fast responses = happy customers

---

**🍋 LemonSqueezy makes monetization simple. Focus on building great features!**
