/**
 * Email Service
 * Handles sending emails via SendGrid or other providers
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email via SendGrid
 */
export async function sendEmailViaSendGrid(options: EmailOptions): Promise<boolean> {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.warn('[Email] SendGrid API key not configured');
      return false;
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: options.to }],
            subject: options.subject,
          },
        ],
        from: {
          email: options.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@wfxtrading.com',
        },
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Email] SendGrid error:', error);
      return false;
    }

    console.log('[Email] Email sent successfully to:', options.to);
    return true;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
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
