#!/bin/bash

# PWA Icon Generator Script
# Generates all required icon sizes from icon-base.svg
# Usage: bash generate-icons.sh

set -e

echo "🎨 Generating PWA icons from icon-base.svg..."
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

if [ ! -f "icon-base.svg" ]; then
    echo "❌ Error: icon-base.svg not found in $SCRIPT_DIR"
    exit 1
fi

# Check if ImageMagick is available
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick not found. Please install it first:"
    echo "   brew install imagemagick"
    exit 1
fi

# Use 'magick' if available, otherwise 'convert'
CONVERT_CMD="convert"
if command -v magick &> /dev/null; then
    CONVERT_CMD="magick"
fi

echo "Using: $CONVERT_CMD"
echo ""

# Generate all icon sizes
sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
    echo "⏳ Generating icon-${size}x${size}.png..."
    $CONVERT_CMD icon-base.svg -resize ${size}x${size} icon-${size}x${size}.png
done

# Generate Apple Touch Icon (180x180)
echo "⏳ Generating apple-touch-icon.png..."
$CONVERT_CMD icon-base.svg -resize 180x180 apple-touch-icon.png

# Generate favicon.ico (32x32 and 16x16 multi-resolution)
echo "⏳ Generating favicon.ico..."
$CONVERT_CMD icon-base.svg -resize 32x32 -define icon:auto-resize=32,16 ../favicon.ico

echo ""
echo "✅ All icons generated successfully!"
echo ""
echo "Generated files:"
ls -lh icon-*.png apple-touch-icon.png | awk '{print "  " $9 " (" $5 ")"}'

echo ""
echo "📋 Next steps:"
echo "  1. Clear browser cache (Cmd+Shift+R)"
echo "  2. Uninstall PWA from home screen"
echo "  3. Reinstall PWA to see new icon"
echo ""
echo "🎉 Done!"
