import jwt from 'jsonwebtoken';
import config from './config.js';
import Database from './database.js';

export class AuthService {
  static generateToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'luna-rag'
    });
  }

  static generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'luna-rag'
    });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret, {
        issuer: 'luna-rag'
      });
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async authenticateUser(apiKey) {
    try {
      // Try to find user by API key
      const response = await fetch(`${process.env.LUNA_RAG_API_URL}/api/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('API key validation failed');
      }

      const userData = await response.json();

      // Return user data with token
      const token = this.generateToken({
        userId: userData.userId,
        email: userData.email,
        tier: userData.tier,
        apiKey: apiKey
      });

      return {
        token,
        user: userData
      };
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  static async getUserFromToken(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await Database.getUser(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Check if API key still matches
      if (user.apiKey !== decoded.apiKey) {
        throw new Error('API key mismatch');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async createUser(userData) {
    try {
      const userId = require('uuid').v4();
      const apiKey = Database.generateApiKey();

      const newUser = await Database.createUser({
        userId,
        ...userData,
        apiKey,
        tier: 'free'
      });

      const token = this.generateToken({
        userId: newUser.userId,
        email: newUser.email,
        tier: newUser.tier,
        apiKey: newUser.apiKey
      });

      const refreshToken = this.generateRefreshToken({
        userId: newUser.userId
      });

      return {
        user: newUser,
        token,
        refreshToken
      };
    } catch (error) {
      throw new Error('User creation failed');
    }
  }

  static async refreshTokens(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken);
      const user = await Database.getUser(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const newToken = this.generateToken({
        userId: user.userId,
        email: user.email,
        tier: user.tier,
        apiKey: user.apiKey
      });

      const newRefreshToken = this.generateRefreshToken({
        userId: user.userId
      });

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  static async updateUserSubscription(userId, subscriptionData) {
    return await Database.updateSubscription(userId, subscriptionData);
  }

  static async getSubscriptionFromWebhook(subscriptionId) {
    try {
      const subscription = await Database.getSubscriptionStatus(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Failed to get subscription from webhook:', error);
      return null;
    }
  }
}

export default AuthService;