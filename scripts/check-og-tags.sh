#!/bin/bash

# Script to check Open Graph tags for beeri.online
# This helps debug WhatsApp/Facebook link preview issues

echo "🔍 Checking Open Graph tags for beeri.online..."
echo ""

URL="https://beeri.online"

echo "Fetching meta tags from $URL..."
echo ""

curl -s "$URL" | grep -E '(og:|twitter:|canonical)' | head -20

echo ""
echo "✅ To refresh WhatsApp's cache:"
echo "1. Go to: https://developers.facebook.com/tools/debug/"
echo "2. Enter: https://beeri.online"
echo "3. Click 'Debug'"
echo "4. Click 'Scrape Again' to force refresh"
echo ""
echo "📱 To test in WhatsApp:"
echo "1. Send the link to yourself in WhatsApp"
echo "2. Delete the message"
echo "3. Wait 1-2 minutes"
echo "4. Send the link again - should show the beeri.online logo now!"
