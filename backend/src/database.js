import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import config from './config.js';

// Initialize DynamoDB clients
const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

export class Database {
  static async getUser(userId) {
    try {
      const command = new GetCommand({
        TableName: config.database.tableName,
        Key: { userId }
      });

      const result = await docClient.send(command);
      return result.Item;
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        return null;
      }
      throw error;
    }
  }

  static async getUserByEmail(email) {
    try {
      const command = new QueryCommand({
        TableName: config.database.tableName,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      });

      const result = await docClient.send(command);
      return result.Items[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async createUser(userData) {
    const user = {
      userId: userData.userId,
      email: userData.email,
      tier: userData.tier || 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usage: {
        searchesToday: 0,
        filesIndexed: 0,
        lastResetDate: new Date().toISOString(),
        monthlyUsage: {
          searches: 0,
          filesIndexed: 0,
          visionAnalyses: 0,
          glmAnalyses: 0
        }
      },
      subscription: {
        status: 'none',
        planId: null,
        variantId: null,
        trialStart: null,
        trialEnd: null,
        renewsAt: null
      },
      features: userData.features || config.freeTier.features,
      apiKey: userData.apiKey,
      apiKeyHash: this.hashApiKey(userData.apiKey)
    };

    const command = new PutCommand({
      TableName: config.database.tableName,
      Item: user
    });

    await docClient.send(command);
    return user;
  }

  static async updateUser(userId, updateData) {
    const updateExpressions = [];
    const attributeNames = {};
    const attributeValues = {};

    Object.keys(updateData).forEach(key => {
      const expressionKey = `#${key}`;
      const expressionValue = `:${key}`;

      updateExpressions.push(`${expressionKey} = ${expressionValue}`);
      attributeNames[expressionKey] = key;
      attributeValues[expressionValue] = updateData[key];
    });

    const command = new UpdateCommand({
      TableName: config.database.tableName,
      Key: { userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}, updatedAt = :updatedAt`,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: {
        ...attributeValues,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(command);
    return result.Attributes;
  }

  static async trackUsage(userId, usageData) {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const today = new Date().toISOString().split('T')[0];
    const lastReset = user.usage.lastResetDate?.split('T')[0];

    // Reset daily usage if it's a new day
    if (today !== lastReset) {
      user.usage.searchesToday = 0;
    }

    // Update usage
    const updatedUsage = {
      ...user.usage,
      searchesToday: user.usage.searchesToday + (usageData.searches || 0),
      filesIndexed: user.usage.filesIndexed + (usageData.filesIndexed || 0),
      lastResetDate: today,
      monthlyUsage: {
        searches: user.usage.monthlyUsage.searches + (usageData.searches || 0),
        filesIndexed: user.usage.monthlyUsage.filesIndexed + (usageData.filesIndexed || 0),
        visionAnalyses: user.usage.monthlyUsage.visionAnalyses + (usageData.visionAnalyses || 0),
        glmAnalyses: user.usage.monthlyUsage.glmAnalyses + (usageData.glmAnalyses || 0)
      }
    };

    return await this.updateUser(userId, { usage: updatedUsage });
  }

  static async checkUsageLimits(userId) {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    if (user.tier === 'pro') {
      return { canProceed: true, reason: null };
    }

    const today = new Date().toISOString().split('T')[0];
    const lastReset = user.usage.lastResetDate?.split('T')[0];

    // Reset daily usage if it's a new day
    if (today !== lastReset) {
      await this.updateUser(userId, {
        'usage.searchesToday': 0
      });
      return { canProceed: true, reason: null };
    }

    // Check daily search limit
    if (user.usage.searchesToday >= config.freeTier.searchesPerDay) {
      return {
        canProceed: false,
        reason: 'daily_search_limit',
        limit: config.freeTier.searchesPerDay,
        current: user.usage.searchesToday,
        resetTime: this.getNextResetTime()
      };
    }

    // Check file indexing limit
    if (user.usage.filesIndexed >= config.freeTier.filesIndexed) {
      return {
        canProceed: false,
        reason: 'file_index_limit',
        limit: config.freeTier.filesIndexed,
        current: user.usage.filesIndexed
      };
    }

    return { canProceed: true, reason: null };
  }

  static async getUsageStats(userId) {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const today = new Date().toISOString().split('T')[0];
    const lastReset = user.usage?.lastResetDate?.split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);

    return {
      tier: user.tier,
      usage: {
        daily: {
          searches: today === lastReset ? user.usage.searchesToday : 0,
          limit: user.tier === 'pro' ? -1 : config.freeTier.searchesPerDay
        },
        filesIndexed: {
          current: user.usage.filesIndexed,
          limit: user.tier === 'pro' ? -1 : config.freeTier.filesIndexed
        },
        monthly: user.usage.monthlyUsage,
        features: user.features
      },
      subscription: user.subscription
    };
  }

  static async updateSubscription(userId, subscriptionData) {
    return await this.updateUser(userId, {
      subscription: subscriptionData,
      tier: subscriptionData.status === 'active' ? 'pro' : 'free',
      features: subscriptionData.status === 'active'
        ? config.proTier.features
        : config.freeTier.features
    });
  }

  static hashApiKey(apiKey) {
    return require('crypto').createHash('sha256').update(apiKey).digest('hex');
  }

  static generateApiKey() {
    const prefix = 'luna_';
    const randomBytes = require('crypto').randomBytes(24).toString('hex');
    return `${prefix}${randomBytes}`;
  }

  static getNextResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }

  static async getAllUsers() {
    try {
      const command = new ScanCommand({
        TableName: config.database.tableName,
        ProjectionExpression: 'userId, email, tier, subscription, usage, createdAt'
      });

      const result = await docClient.send(command);
      return result.Items;
    } catch (error) {
      throw error;
    }
  }

  static async getSubscriptionStatus(subscriptionId) {
    try {
      const response = await fetch(`${config.lemonsqueezy.apiBase}/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${config.lemonsqueezy.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default Database;