#!/bin/bash

# MyStore AI Merchant - Start Script
# This script connects to production backend automatically

echo "🚀 MyStore AI Merchant Startup"
echo "================================"
echo ""

# Kill any existing processes on port 8081
echo "🧹 Cleaning up old processes..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
sleep 2

# Clear cache for fresh start
echo "🗑️  Clearing cache..."
rm -rf node_modules/.cache .expo 2>/dev/null || true

echo ""
echo "✅ Now connected to Production Backend"
echo "📡 API URL: http://164.90.226.98:8000/api/v1"
echo ""
echo "Starting Expo..."
echo "================================"
echo ""

# Start Expo
npx expo start --clear
