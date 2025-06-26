#!/bin/bash

# 🚀 Production Edge Functions Deployment Script
echo "🚀 Deploying CORS-Fixed Edge Functions to Production..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing via npm..."
    npm install -g supabase
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Supabase CLI. Please install manually:"
        echo "npm install -g supabase"
        echo ""
        echo "OR manually update functions in Supabase Dashboard:"
        echo "https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/functions"
        exit 1
    fi
fi

# Check if we're logged in and linked to the production project
echo "🔗 Linking to production project..."
supabase link --project-ref voaxyetbqhmgbvcxsttf

if [ $? -ne 0 ]; then
    echo "❌ Failed to link to production project. Please run:"
    echo "supabase login"
    echo "supabase link --project-ref voaxyetbqhmgbvcxsttf"
    exit 1
fi

echo "✅ Successfully linked to production project"

# Deploy Edge Functions with CORS fixes
echo ""
echo "📦 Deploying Edge Functions with CORS fixes..."

echo "📦 Deploying process-square-payment..."
supabase functions deploy process-square-payment --project-ref voaxyetbqhmgbvcxsttf

if [ $? -eq 0 ]; then
    echo "✅ process-square-payment deployed successfully"
else
    echo "❌ Failed to deploy process-square-payment"
fi

echo ""
echo "📦 Deploying process-paypal-payment..."
supabase functions deploy process-paypal-payment --project-ref voaxyetbqhmgbvcxsttf

if [ $? -eq 0 ]; then
    echo "✅ process-paypal-payment deployed successfully"
else
    echo "❌ Failed to deploy process-paypal-payment"
fi

echo ""
echo "📦 Deploying send-receipt-email..."
supabase functions deploy send-receipt-email --project-ref voaxyetbqhmgbvcxsttf

if [ $? -eq 0 ]; then
    echo "✅ send-receipt-email deployed successfully"
else
    echo "❌ Failed to deploy send-receipt-email"
fi

echo ""
echo "🎉 Edge Functions deployment complete!"
echo ""
echo "🧪 Next Steps:"
echo "1. Test payment flow at: https://stepperslife.com/payment"
echo "2. Check Edge Function logs in Supabase Dashboard"
echo "3. Verify CORS errors are resolved"
echo ""
echo "📊 Monitor deployment:"
echo "- Supabase Dashboard: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/functions"
echo "- Edge Function Logs: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/logs"

# Test connectivity to the production functions
echo ""
echo "🔍 Testing Edge Function connectivity..."

# Test CORS preflight
echo "Testing CORS preflight for process-square-payment..."
curl -X OPTIONS \
  -H "Origin: https://stepperslife.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -s -o /dev/null -w "%{http_code}" \
  https://voaxyetbqhmgbvcxsttf.supabase.co/functions/v1/process-square-payment

echo ""
echo "✅ CORS deployment verification complete!"
echo "If you see '200' above, CORS is working correctly."