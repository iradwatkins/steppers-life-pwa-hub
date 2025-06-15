#!/bin/bash

# SteppersLife PWA Server Startup Script
echo "🚀 Starting SteppersLife PWA Server..."

# Build the latest version
echo "📦 Building PWA..."
npm run build

# Stop any existing servers on the ports
echo "🧹 Cleaning up existing servers..."
lsof -ti:8086 | xargs kill -9 2>/dev/null || true

# Start the PWA server
echo "🌐 Starting PWA server..."
echo ""
echo "📱 PWA URLs:"
echo "   Main PWA: http://192.168.86.40:8086/"
echo "   Staff Install: http://192.168.86.40:8086/staff-install"
echo "   PWA Login: http://192.168.86.40:8086/pwa/login"
echo ""
echo "💡 Share http://192.168.86.40:8086/staff-install with staff"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

npx serve dist -p 8086 -s 