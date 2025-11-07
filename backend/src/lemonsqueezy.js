import config from './config.js';

export class LemonSqueezyService {
  constructor() {
    this.apiKey = config.lemonsqueezy.apiKey;
    this.storeId = config.lemonsqueezy.storeId;
    this.apiBase = config.lemonsqueezy.apiBase;
  }

  async createStoreCheckout(variantId, customerEmail) {
    try {
      const response = await fetch(`${this.apiBase}/checkouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          data: {
            type: 'checkout',
            attributes: {
              store_id: this.storeId,
              variant_id: variantId,
              customer_email: customerEmail,
              product_options: {
                redirect_url: `${process.env.FRONTEND_URL}/success`,
                receipt_button_text: 'View Receipt',
                receipt_thank_you_page_url: `${process.env.FRONTEND_URL}/thank-you`
              }
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Checkout creation failed: ${response.statusText}`);
      }

      const checkoutData = await response.json();
      return {
        checkoutUrl: checkoutData.data.attributes.url,
        checkoutId: checkoutData.data.id
      };
    } catch (error) {
      console.error('LemonSqueezy checkout error:', error);
      throw error;
    }
  }

  async getSubscription(subscriptionId) {
    try {
      const response = await fetch(`${this.apiBase}/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LemonSqueezy subscription fetch error:', error);
      throw error;
    }
  }

  async getCustomer(customerId) {
    try {
      const response = await fetch(`${this.apiBase}/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch customer: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LemonSqueezy customer fetch error:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(`${this.apiBase}/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel subscription: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LemonSqueezy subscription cancellation error:', error);
      throw error;
    }
  }

  async pauseSubscription(subscriptionId) {
    try {
      const response = await fetch(`${this.apiBase}/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            type: 'subscriptions',
            id: subscriptionId,
            attributes: {
              pause: {
                mode: 'void'
              }
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to pause subscription: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LemonSqueezy subscription pause error:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId, variantId) {
    try {
      const response = await fetch(`${this.apiBase}/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            type: 'subscriptions',
            id: subscriptionId,
            attributes: {
              variant_id: variantId
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update subscription: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LemonSqueezy subscription update error:', error);
      throw error;
    }
  }

  async getOrders(customerId, limit = 20) {
    try {
      const response = await fetch(`${this.apiBase}/orders?filter[customer_id]=${customerId}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LemonSqueezy orders fetch error:', error);
      throw error;
    }
  }

  async getDiscountCodes() {
    try {
      const response = await fetch(`${this.apiBase}/discount-codes?store_id=${this.storeId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch discount codes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LemonSqueezy discount codes fetch error:', error);
      throw error;
    }
  }

  validateWebhook(payload, signature) {
    if (!config.lemonsqueezy.webhookSecret) {
      console.warn('Webhook secret not configured');
      return false;
    }

    try {
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha256', config.lemonsquezy.webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('Webhook validation error:', error);
      return false;
    }
  }

  parseWebhookEvent(body) {
    const eventName = body.meta.event_name;
    const data = body.data;

    return {
      eventName,
      subscriptionId: data.id,
      customerId: data.attributes?.customer_id,
      variantId: data.attributes?.variant_id,
      status: data.attributes?.status,
      renewsAt: data.attributes?.renews_at,
      trialEndsAt: data.attributes?.trial_ends_at,
      endsAt: data.attributes?.ends_at,
      email: data.attributes?.user_email,
      productName: data.attributes?.product_name,
      storeId: data.attributes?.store_id,
      orderId: data.attributes?.order_id,
      totalPrice: data.attributes?.total,
      currency: data.attributes?.currency
    };
  }
}

export default LemonSqueezyService;