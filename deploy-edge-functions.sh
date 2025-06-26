#!/bin/bash

# Deploy Edge Functions to Production Supabase
# This script deploys all Edge Functions to the production environment

echo "🚀 Deploying Edge Functions to Production..."

# Set the project ID
PROJECT_ID="voaxyetbqhmgbvcxsttf"

# Deploy each Edge Function
echo "📦 Deploying send-receipt-email function..."
supabase functions deploy send-receipt-email --project-ref $PROJECT_ID

echo "📦 Deploying process-paypal-payment function..."
supabase functions deploy process-paypal-payment --project-ref $PROJECT_ID

echo "📦 Deploying process-square-payment function..."
supabase functions deploy process-square-payment --project-ref $PROJECT_ID

echo "✅ All Edge Functions deployed successfully!"
echo ""
echo "🔗 Function URLs:"
echo "  • send-receipt-email: https://$PROJECT_ID.supabase.co/functions/v1/send-receipt-email"
echo "  • process-paypal-payment: https://$PROJECT_ID.supabase.co/functions/v1/process-paypal-payment"
echo "  • process-square-payment: https://$PROJECT_ID.supabase.co/functions/v1/process-square-payment"
echo ""
echo "🌐 CORS is configured for:"
echo "  • https://stepperslife.com"
echo "  • https://www.stepperslife.com"
echo "  • http://localhost:3000"
echo "  • http://localhost:5173"
echo "  • http://localhost:8080" 