#!/bin/bash

# Deploy Edge Functions to Supabase
echo "🚀 Deploying Edge Functions with CORS fixes..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    echo ""
    echo "OR manually update functions in Supabase Dashboard:"
    echo "https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/functions"
    echo ""
    echo "Use the code from FIXED-EDGE-FUNCTION-CORS.md"
    exit 1
fi

# Check if we're logged in
if ! supabase status &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

echo "✅ Supabase CLI found. Deploying functions..."

# Deploy all functions
echo "📦 Deploying process-square-payment..."
supabase functions deploy process-square-payment

echo "📦 Deploying process-paypal-payment..."
supabase functions deploy process-paypal-payment

echo "📦 Deploying send-receipt-email..."
supabase functions deploy send-receipt-email

echo "🎉 Functions deployed! CORS errors should be resolved."
echo "🧪 Test your payment flow now at: https://stepperslife.com"