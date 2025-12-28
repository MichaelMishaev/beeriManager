#!/usr/bin/env node

/**
 * Create OpenGraph image with correct branding text
 * This creates a simple text-based image for social sharing
 */

const sharp = require('sharp');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '../public/og-beeri-netanya.png');

// Create a simple branded image with text
async function createOGImage() {
  try {
    console.log('🎨 Creating OpenGraph image for בארי נתניה...\n');

    // Create SVG with branded text
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <!-- Background gradient -->
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0D98BA;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#003153;stop-opacity:1" />
          </linearGradient>
        </defs>

        <rect width="1200" height="630" fill="url(#grad)"/>

        <!-- Main title -->
        <text
          x="600"
          y="280"
          font-family="Arial, sans-serif"
          font-size="80"
          font-weight="bold"
          fill="white"
          text-anchor="middle"
          direction="rtl">
          בארי נתניה
        </text>

        <!-- Subtitle -->
        <text
          x="600"
          y="370"
          font-family="Arial, sans-serif"
          font-size="48"
          fill="#FFBA00"
          text-anchor="middle"
          direction="rtl">
          הנהגה הוראית
        </text>

        <!-- Description -->
        <text
          x="600"
          y="460"
          font-family="Arial, sans-serif"
          font-size="32"
          fill="rgba(255,255,255,0.9)"
          text-anchor="middle"
          direction="rtl">
          מערכת ניהול אירועים, משימות ופרוטוקולים
        </text>
      </svg>
    `;

    // Convert SVG to PNG
    await sharp(Buffer.from(svg))
      .png()
      .toFile(OUTPUT_PATH);

    console.log('✅ Created OpenGraph image successfully!');
    console.log(`   File: ${OUTPUT_PATH}`);
    console.log('   Size: 1200x630px (optimal for social sharing)\n');
    console.log('📝 Next step: Update layout.tsx to use this image');
    console.log('   Change: logo-square.png → og-beeri-netanya.png\n');

  } catch (error) {
    console.error('❌ Error creating OG image:', error.message);
    process.exit(1);
  }
}

createOGImage();
