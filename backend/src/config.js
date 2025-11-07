export const config = {
  // LemonSqueezy Configuration
  lemonSqueezy: {
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
    storeId: process.env.LEMONSQUEEZY_STORE_ID || '214097',
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
    apiBase: 'https://api.lemonsqueezy.com/v1'
  },

  // Products Configuration
  products: {
    proMonthly: {
      id: null, // Will be fetched from LemonSqueezy
      name: 'Luna RAG Pro',
      price: 29.00,
      trialDays: 14,
      variantId: null // Will be fetched
    },
    proYearly: {
      id: null,
      name: 'Luna RAG Pro (Yearly)',
      price: 290.00, // 2 months free
      trialDays: 14,
      variantId: null
    }
  },

  // Free Tier Limits
  freeTier: {
    searchesPerDay: 100,
    filesIndexed: 1000,
    features: ['basic_search', 'limited_indexing']
  },

  // Pro Tier Features
  proTier: {
    searchesPerDay: -1, // Unlimited
    filesIndexed: -1, // Unlimited
    features: ['basic_search', 'unlimited_search', 'vision_rag', 'glm_vision', 'priority_support']
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '365d',
    refreshExpiresIn: '30d'
  },

  // Database Configuration
  database: {
    tableName: process.env.DYNAMODB_TABLE || 'luna-rag-users'
  },

  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: 'noreply@agent.lunaos.ai',
    support: 'support@agent.lunaos.ai'
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: 4000,
    temperature: 0.7
  },

  // Rate Limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    freeTierMax: 10, // stricter limit for free tier
    proTierMax: 1000
  }
};

export default config;