# SteppersLife Backend Setup Guide

This guide provides detailed instructions for setting up the SteppersLife backend environment.

## Environment Variables Setup

Create a `.env` file in the backend directory with the following settings:

```dotenv
# Application
DEBUG=True
ENVIRONMENT=development  # development, testing, production

# Database
DATABASE_URL=sqlite:///./steppers_life.db  # SQLite for development

# JWT Security
SECRET_KEY=your-secret-key-here  # Must be at least 32 characters
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email - SendGrid (Preferred)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@stepperslife.com
SENDGRID_FROM_NAME=SteppersLife

# Email - SMTP (Fallback)
SMTP_SERVER=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=noreply@stepperslife.com
SMTP_FROM_NAME=SteppersLife

# Payment Processing
STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Frontend URL
FRONTEND_URL=http://localhost:8088  # Adjust to match your frontend
```

## SendGrid Email Integration

### Getting a SendGrid API Key

1. Create a SendGrid account at [sendgrid.com](https://sendgrid.com)
2. Navigate to **Settings** > **API Keys**
3. Click **Create API Key**
4. Name your key (e.g., "SteppersLife Integration")
5. Select "Restricted Access" and ensure the "Mail Send" permission is enabled
6. Click **Create & View**
7. Copy the API key - this is the only time it will be displayed
8. Add it to your `.env` file as `SENDGRID_API_KEY`

### Sender Authentication

Before sending emails with SendGrid, you need to authenticate your sender:

1. Go to **Settings** > **Sender Authentication**
2. Choose either **Single Sender Verification** or **Domain Authentication**
   - Single Sender: Verify a specific email address
   - Domain Authentication: Verify your entire domain (recommended for production)
3. Follow the verification steps
4. Use the verified email address as your `SENDGRID_FROM_EMAIL`

### Testing Your Integration

Run the provided test script to ensure your SendGrid integration is working:

```bash
# Activate your virtual environment first
source venv/bin/activate

# Run the test script
python scripts/test_sendgrid.py recipient@example.com
```

Replace `recipient@example.com` with your email address to receive the test email.

If you haven't added the API key to your .env file, you can pass it directly:

```bash
python scripts/test_sendgrid.py recipient@example.com --api-key=your-sendgrid-api-key
```

## Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Ensure the API key has "Mail Send" permissions
   - Check that the key is correctly copied without extra spaces
   - Try generating a new API key

2. **Emails Not Sending**:
   - Verify your sender email is authenticated
   - Check that you're not exceeding your SendGrid plan limits
   - Look for error messages in the console output

3. **Emails Going to Spam**:
   - Complete domain authentication in SendGrid
   - Set up DKIM and SPF records
   - Ensure your email content follows best practices

### Logs

If you're having issues, check the logs:

```bash
# Show last 50 lines of logs
tail -n 50 logs/app.log
```

## Moving to Production

For production environments:

1. Use a domain-authenticated email sender
2. Set up event webhooks to track email delivery and engagement
3. Configure IP access management for your API keys
4. Consider using SendGrid's dynamic templates for more advanced emails 