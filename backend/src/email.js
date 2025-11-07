import nodemailer from 'nodemailer';
import config from './config.js';

export class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      }
    });
  }

  async sendWelcomeEmail(email, apiKey) {
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: '🌙 Welcome to Luna RAG Pro! Your Intelligent Code Search is Ready',
      html: this.getWelcomeEmailTemplate(email, apiKey)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendTrialExpirationEmail(email, daysRemaining) {
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: `⏰ Your Luna RAG Pro trial ends in ${daysRemaining} days!`,
      html: this.getTrialExpirationTemplate(email, daysRemaining)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Trial expiration email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending trial expiration email:', error);
      throw error;
    }
  }

  async sendPaymentSuccessEmail(email, subscriptionData) {
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: '🎉 Payment Successful! Luna RAG Pro is Active',
      html: this.getPaymentSuccessTemplate(email, subscriptionData)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Payment success email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending payment success email:', error);
      throw error;
    }
  }

  async sendCancellationEmail(email, cancellationDate) {
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Your Luna RAG subscription has been cancelled',
      html: this.getCancellationTemplate(email, cancellationDate)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Cancellation email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      throw error;
    }
  }

  async sendUsageReportEmail(email, usageStats) {
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: '📊 Your Luna RAG Usage Report',
      html: this.getUsageReportTemplate(email, usageStats)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Usage report email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending usage report email:', error);
      throw error;
    }
  }

  async sendEnterpriseContactEmail(contactData) {
    const mailOptions = {
      from: config.email.from,
      to: config.email.support,
      subject: `Enterprise Inquiry from ${contactData.company}`,
      html: this.getEnterpriseContactTemplate(contactData)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Enterprise contact email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending enterprise contact email:', error);
      throw error;
    }
  }

  getWelcomeEmailTemplate(email, apiKey) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Luna RAG Pro!</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 2.5rem; margin-bottom: 10px; }
          .title { font-size: 1.5rem; color: #333; margin-bottom: 20px; }
          .api-key { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0; font-family: monospace; word-break: break-all; }
          .features { margin: 30px 0; }
          .feature { margin-bottom: 15px; padding-left: 20px; position: relative; }
          .feature::before { content: "✓"; position: absolute; left: 0; color: #28a745; font-weight: bold; }
          .cta { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; text-align: center; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌙</div>
            <h1 class="title">Welcome to Luna RAG Pro!</h1>
            <p>Your intelligent code search journey begins now</p>
          </div>

          <div>
            <h3>🎉 Your API Key</h3>
            <div class="api-key">${apiKey}</div>
          </div>

          <div class="features">
            <h3>🚀 Your Pro Features</h3>
            <div class="feature">Unlimited semantic searches - no daily limits!</div>
            <div class="feature">Unlimited file indexing for entire codebases</div>
            <div class="feature">Luna Vision RAG™ - analyze screenshots with code context</div>
            <div class="feature">GLM Vision - advanced visual AI testing</div>
            <div class="feature">Priority support (24hr response time)</div>
            <div class="feature">Advanced analytics dashboard</div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://agent.lunaos.ai/docs" class="cta">Get Started with Luna RAG</a>
          </div>

          <div class="footer">
            <p>Questions? Just reply to this email or visit our <a href="https://agent.lunaos.ai/support">support page</a></p>
            <p>Happy coding! The Luna Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getTrialExpirationTemplate(email, daysRemaining) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Luna RAG Pro Trial Expiration</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <h2>⏰ Your Luna RAG Pro Trial Ends Soon</h2>
        <p>Hi ${email},</p>
        <p>Your 14-day free trial of Luna RAG Pro will expire in <strong>${daysRemaining} days</strong>.</p>

        <h3>Don't lose access to:</h3>
        <ul>
          <li>🔍 Unlimited semantic searches</li>
          <li>🖼️ Luna Vision RAG™ screenshot analysis</li>
          <li>🧠 GLM Vision advanced testing</li>
          <li>📊 Advanced analytics dashboard</li>
          <li>🚀 Priority support</li>
        </ul>

        <p><strong>Ready to continue your intelligent code search journey?</strong></p>

        <div style="background: #007bff; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <a href="https://agent.lunaos.ai/upgrade" style="color: white; text-decoration: none; font-weight: bold;">
            Upgrade Now & Continue Searching
          </a>
        </div>

        <p>Questions? Just reply to this email!</p>
        <p>Best regards,<br>The Luna Team</p>
      </body>
      </html>
    `;
  }

  getPaymentSuccessTemplate(email, subscriptionData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Successful - Luna RAG Pro</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <h2>🎉 Payment Successful! Welcome to Luna RAG Pro</h2>
        <p>Hi ${email},</p>
        <p>Thank you for your subscription! Your Luna RAG Pro features are now active.</p>

        <h3>📋 Subscription Details</h3>
        <ul>
          <li><strong>Plan:</strong> Luna RAG Pro</li>
          <li><strong>Price:</strong> $29/month</li>
          <li><strong>Status:</strong> Active</li>
          <li><strong>Next Billing:</strong> ${new Date(subscriptionData.renewsAt).toLocaleDateString()}</li>
        </ul>

        <h3>🚀 Your Pro Features Are Ready:</h3>
        <ul>
          <li>✅ Unlimited searches (no limits!)</li>
          <li>✅ Luna Vision RAG™ for screenshot analysis</li>
          <li>✅ GLM Vision for advanced visual AI</li>
          <li>✅ Priority support (24hr response)</li>
          <li>✅ Advanced analytics dashboard</li>
        </ul>

        <div style="background: #28a745; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p>💡 <strong>Tip:</strong> Just ask me "analyze this screenshot" to start using Vision RAG!</p>
        </div>

        <p>Need help getting started? Check out our <a href="https://agent.lunaos.ai/docs">documentation</a> or reply to this email.</p>
        <p>Happy coding with Luna RAG!</p>
        <p>The Luna Team</p>
      </body>
      </html>
    `;
  }

  getCancellationTemplate(email, cancellationDate) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Subscription Cancelled - Luna RAG</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <h2>Subscription Cancelled</h2>
        <p>Hi ${email},</p>
        <p>Your Luna RAG Pro subscription has been cancelled as of ${new Date(cancellationDate).toLocaleDateString()}.</p>

        <h3>What happens next:</h3>
        <ul>
          <li>✅ Your Pro features will remain active until the end of your current billing period</li>
          <li>📉 You'll be downgraded to the Free tier automatically</li>
          <li>🆓 You'll have 100 searches per day and 1,000 files indexed</li>
        </ul>

        <div style="background: #ffc107; color: #333; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>We're sorry to see you go!</strong></p>
          <p>Have feedback or questions about your experience? Just reply to this email - we'd love to hear from you.</p>
        </div>

        <p>Want to reactivate your subscription? You can restart anytime at <a href="https://agent.lunaos.ai/pricing">lunaos.ai/pricing</a>.</p>
        <p>Thank you for trying Luna RAG!</p>
        <p>The Luna Team</p>
      </body>
      </html>
    `;
  }

  getUsageReportTemplate(email, usageStats) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Luna RAG Usage Report</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <h2>📊 Your Luna RAG Usage Report</h2>

        <h3>📈 Monthly Summary</h3>
        <ul>
          <li><strong>Searches:</strong> ${usageStats.monthly.searches}</li>
          <li><strong>Files Indexed:</strong> ${usageStats.monthly.filesIndexed}</li>
          <li><strong>Vision Analyses:</strong> ${usageStats.monthly.visionAnalyses}</li>
          <li><strong>GLM Analyses:</strong> ${usageStats.monthly.glmAnalyses}</li>
        </ul>

        <h3>🎯 Your Features</h3>
        <p>You currently have access to: <strong>${usageStats.features.join(', ')}</strong></p>

        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>💡 Pro Tip:</strong> Try combining searches: "How does authentication work?" followed by "Show me pattern implementations."</p>
        </div>

        <p>Keep exploring your codebase with Luna RAG!</p>
        <p>The Luna Team</p>
      </body>
      </html>
    `;
  }

  getEnterpriseContactTemplate(contactData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Enterprise Inquiry - Luna RAG</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <h2>🏢 New Enterprise Inquiry</h2>

        <h3>Contact Information</h3>
        <ul>
          <li><strong>Company:</strong> ${contactData.company}</li>
          <li><strong>Name:</strong> ${contactData.name}</li>
          <li><strong>Email:</strong> ${contactData.email}</li>
          <li><strong>Team Size:</strong> ${contactData.teamSize}</li>
        </ul>

        <h3>Message:</h3>
        <p>${contactData.message}</p>

        <p>This inquiry requires follow-up. Please contact the customer promptly.</p>

        <p>The Luna Team</p>
      </body>
      </html>
    `;
  }
}

export default EmailService;