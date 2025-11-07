import { RAGController } from './src/rag-controller.js';
import cors from 'cors';

const ragController = new RAGController();

export const handler = async (event) => {
  try {
    // Enable CORS for all requests
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    // Parse request
    const { httpMethod, path, body, headers: requestHeaders } = event;
    const pathParts = path.replace(/^\/+/, '').split('/');

    console.log(`${httpMethod} ${path}`);

    // Route requests
    let result;

    switch (httpMethod) {
      case 'POST':
        if (pathParts[0] === 'query') {
          // Main RAG query endpoint
          const { userId, message, apiKey } = JSON.parse(body || '{}');
          result = await ragController.handleRAGQuery(userId, message, apiKey);
        } else if (pathParts[0] === 'upgrade') {
          // Start upgrade process
          const { email } = JSON.parse(body || '{}');
          result = await ragController.startUpgradeProcess(email);
        } else if (pathParts[0] === 'webhook') {
          // LemonSqueezy webhook
          const signature = requestHeaders['X-Signature'] || requestHeaders['x-signature'];
          result = await ragController.processWebhook(
            requestHeaders['x-event-type'] || JSON.parse(body).meta?.event_name,
            JSON.parse(body)
          );
        } else {
          result = { success: false, error: 'Endpoint not found' };
        }
        break;

      case 'GET':
        if (pathParts[0] === 'health') {
          // Health check
          result = {
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          };
        } else if (pathParts[0] === 'status') {
          // User status endpoint
          const apiKey = requestHeaders.authorization?.replace('Bearer ', '');
          const userId = event.queryStringParameters?.userId;
          result = await ragController.handleRAGQuery(userId, 'status', apiKey);
        } else {
          result = { success: false, error: 'Endpoint not found' };
        }
        break;

      default:
        result = { success: false, error: 'Method not allowed' };
    }

    return {
      statusCode: result.success ? 200 : 400,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};