/**
 * Email Service
 * Handles sending emails via Resend (works in Nigeria!)
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email via Resend
 * Resend works in Nigeria and has a free tier!
 * Sign up at: https://resend.com
 */
export async function sendEmailViaResend(options: EmailOptions): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[Email] Resend API key not configured in environment variables');
      console.error('[Email] Please set RESEND_API_KEY environment variable');
      return false;
    }

    const fromEmail = options.from || process.env.EMAIL_FROM || 'noreply@wfxtrading.com';

    console.log('[Email] Sending email via Resend:', { to: options.to, from: fromEmail, subject: options.subject });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Email] Resend API error - Status:', response.status);
      console.error('[Email] Resend API response:', errorText);

      // Try to parse as JSON for better error details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('[Email] Resend error details:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        // Response is not JSON, log as-is
      }
      return false;
    }

    const data = await response.json();
    console.log('[Email] Email sent successfully via Resend to:', options.to, 'ID:', data.id);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Email] Error sending email via Resend:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error('[Email] Stack trace:', error.stack);
    }
    return false;
  }
}

/**
 * Legacy SendGrid function - redirects to Resend
 * Kept for backwards compatibility
 */
export async function sendEmailViaSendGrid(options: EmailOptions): Promise<boolean> {
  return sendEmailViaResend(options);
}

/**
 * Send confirmation email
 */
export async function sendConfirmationEmailToUser(
  email: string,
  fullName: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to WFX Trading Competition!</h1>
          </div>
          
          <div class="content">
            <p>Hi ${fullName},</p>
            
            <p>Thank you for registering and completing your payment! Your registration is now confirmed.</p>
            
            <h2>Your Account Details:</h2>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Demo Capital:</strong> $1,000.00 USD</li>
              <li><strong>Competition Status:</strong> Active</li>
              <li><strong>Entry Fee:</strong> $15.00 USD (Paid)</li>
            </ul>
            
            <h2>Next Steps:</h2>
            <ol>
              <li>Log in to your trading account</li>
              <li>Download MT4/MT5 Trading Platform</li>
              <li>Connect your account and start trading</li>
              <li>Monitor your progress on the leaderboard</li>
            </ol>
            
            <p><a href="https://wfxtrading.com/login" class="btn">Login to Your Account</a></p>
            
            <p>If you have any questions, feel free to contact our support team at support@wfxtrading.com</p>
            
            <p>Best of luck in the competition!</p>
            
            <p><strong>WFX Trading Team</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 WFX Trading Competition. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailViaSendGrid({
    to: email,
    subject: '🎉 Your Registration is Confirmed - WFX Trading Competition',
    html,
  });
}

/**
 * Send trading credentials email
 */
export async function sendTradingCredentialsEmail(
  email: string,
  fullName: string,
  accountUsername: string,
  accountPassword: string,
  accountNumber: string,
  broker: string = 'JustMarkets'
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .credentials { padding: 20px; border: 2px solid #667eea; border-radius: 8px; margin-top: 20px; background: #f0f4ff; }
          .credential-row { margin: 15px 0; padding: 12px; background: white; border-radius: 5px; border-left: 4px solid #667eea; }
          .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { font-size: 14px; font-weight: bold; color: #333; font-family: 'Courier New', monospace; word-break: break-all; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; border-radius: 5px; margin: 20px 0; font-size: 12px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Your Trading Credentials</h1>
          </div>

          <div class="credentials">
            <p>Hi ${fullName},</p>

            <p>Your trading account has been assigned! Below are your credentials to access your demo trading account on ${broker}.</p>

            <div class="credential-row">
              <div class="label">Account Number</div>
              <div class="value">${accountNumber}</div>
            </div>

            <div class="credential-row">
              <div class="label">Username</div>
              <div class="value">${accountUsername}</div>
            </div>

            <div class="credential-row">
              <div class="label">Password</div>
              <div class="value">${accountPassword}</div>
            </div>

            <div class="credential-row">
              <div class="label">Broker</div>
              <div class="value">${broker}</div>
            </div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Keep your credentials safe and confidential. Never share your password with anyone. If you suspect unauthorized access, change your password immediately.
            </div>

            <h3>How to Get Started:</h3>
            <ol>
              <li>Download MT4 or MT5 from your broker's website</li>
              <li>Launch the platform and select your broker (${broker})</li>
              <li>Click "Login" and enter your credentials above</li>
              <li>Start trading and monitor your progress on the leaderboard</li>
            </ol>

            <p><a href="https://wfxtrading.com/leaderboard" class="btn">View Leaderboard</a></p>

            <h3>Support</h3>
            <p>If you need help setting up your account, please contact our support team at support@wfxtrading.com</p>

            <p>Good luck with your trading!</p>
            <p><strong>WFX Trading Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; 2025 WFX Trading Competition. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailViaSendGrid({
    to: email,
    subject: '🎯 Your Trading Credentials - WFX Trading Competition',
    html,
  });
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(
  email: string,
  fullName: string,
  amount: number,
  paymentMethod: string,
  transactionId: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .receipt { padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-top: 20px; background: #f9f9f9; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #ddd; }
          .label { font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Receipt</h1>
          </div>
          
          <div class="receipt">
            <p>Hi ${fullName},</p>
            
            <p>Thank you for your payment! Here's your receipt:</p>
            
            <div class="row">
              <span class="label">Amount:</span>
              <span>$${amount.toFixed(2)} USD</span>
            </div>
            
            <div class="row">
              <span class="label">Payment Method:</span>
              <span>${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</span>
            </div>
            
            <div class="row">
              <span class="label">Transaction ID:</span>
              <span>${transactionId}</span>
            </div>
            
            <div class="row">
              <span class="label">Date:</span>
              <span>${new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 WFX Trading Competition. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailViaSendGrid({
    to: email,
    subject: '💳 Your Payment Receipt - WFX Trading Competition',
    html,
  });
}

/**
 * Send admin notification about new payment
 */
interface AdminNotificationPayload {
  traderId: string;
  email: string;
  fullName: string;
  amount: number;
  currency: string;
  country: string;
  paymentMethod: string;
  dashboardUrl: string;
}

export async function sendAdminNotification(payload: AdminNotificationPayload): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('[Email] Admin email not configured');
    return false;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-top: 20px; }
          .info-box { background: #f0f4ff; padding: 15px; border-left: 4px solid #667eea; margin: 10px 0; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Payment Submitted</h1>
          </div>

          <div class="content">
            <p><strong>A new trader has submitted a payment:</strong></p>

            <div class="info-box">
              <p><strong>Trader Name:</strong> ${payload.fullName}</p>
              <p><strong>Email:</strong> ${payload.email}</p>
              <p><strong>Country:</strong> ${payload.country}</p>
              <p><strong>Amount:</strong> $${payload.amount} ${payload.currency}</p>
              <p><strong>Payment Method:</strong> ${payload.paymentMethod}</p>
              <p><strong>Trader ID:</strong> ${payload.traderId}</p>
            </div>

            <p>Please review and approve/reject this payment in your admin dashboard:</p>
            <p><a href="${payload.dashboardUrl}" class="btn">Review Payment →</a></p>

            <p>The trader is waiting for approval before they can start trading.</p>
          </div>

          <div class="footer">
            <p>&copy; 2025 WFX TRADING SHOWDOWN. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailViaResend({
    to: adminEmail,
    subject: `🔔 New Payment from ${payload.fullName} - Requires Approval`,
    html,
  });
}

/**
 * Send approval email to trader
 */
export async function sendApprovalEmail(
  email: string,
  fullName: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-top: 20px; }
          .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .success-box h3 { color: #155724; margin-top: 0; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Approved!</h1>
          </div>

          <div class="content">
            <p>Hi ${fullName},</p>

            <div class="success-box">
              <h3>Great News!</h3>
              <p>Your payment has been <strong>approved</strong> and your registration is now confirmed for the WFX TRADING SHOWDOWN.</p>
            </div>

            <h3>What's Next?</h3>
            <ol>
              <li>Your trading credentials will be available on your dashboard shortly</li>
              <li>Log in to access your demo account with $1,000 trading capital</li>
              <li>Start trading and compete on the leaderboard</li>
            </ol>

            <p><a href="https://wfxtrading.com/dashboard" class="btn">Go to Your Dashboard →</a></p>

            <h3>Good Luck! 🚀</h3>
            <p>We're excited to see you compete in the WFX TRADING SHOWDOWN. Remember to trade smart and manage your risk wisely.</p>

            <p>If you have any questions or need support, please contact us at support@wfxtrading.com</p>

            <p><strong>WFX Trading Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; 2025 WFX TRADING SHOWDOWN. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailViaResend({
    to: email,
    subject: '✅ Your Payment is Approved - Ready to Trade!',
    html,
  });
}
