#!/usr/bin/env node

/**
 * Logo Processing Script
 * This script processes the source logo and generates all necessary icon sizes for the PWA
 *
 * Usage:
 *   1. Save your logo as: public/logo-source.png (high resolution, at least 1024x1024)
 *   2. Run: node scripts/process-logo.js
 *
 * This will generate:
 *   - PWA icons (72x72 to 512x512)
 *   - Apple touch icon (180x180)
 *   - Favicon (32x32, 16x16)
 *   - Navigation logo (various sizes)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_LOGO = path.join(__dirname, '../public/logo-source.png');
const PUBLIC_DIR = path.join(__dirname, '../public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');

// Icon sizes to generate for PWA
const PWA_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Logo sizes for navigation/UI
const LOGO_SIZES = [
  { name: 'logo-full.png', width: 200, height: 80 },  // Full navigation logo
  { name: 'logo-small.png', width: 100, height: 40 }, // Small/mobile logo
  { name: 'logo-square.png', width: 120, height: 120 }, // Square logo
];

async function processLogo() {
  try {
    console.log('🎨 Processing logo...\n');

    // Check if source logo exists
    if (!fs.existsSync(SOURCE_LOGO)) {
      console.error('❌ Error: Source logo not found!');
      console.error(`   Please save your logo as: ${SOURCE_LOGO}`);
      console.error('   The logo should be at least 1024x1024 pixels');
      process.exit(1);
    }

    // Ensure icons directory exists
    if (!fs.existsSync(ICONS_DIR)) {
      fs.mkdirSync(ICONS_DIR, { recursive: true });
    }

    // Get source image metadata
    const metadata = await sharp(SOURCE_LOGO).metadata();
    console.log(`📐 Source logo: ${metadata.width}x${metadata.height}`);

    if (metadata.width < 512 || metadata.height < 512) {
      console.warn('⚠️  Warning: Source logo is smaller than 512x512. Quality may be reduced.');
    }

    console.log('\n🔨 Generating icons...\n');

    // Generate PWA icons
    for (const size of PWA_SIZES) {
      const filename = `icon-${size}x${size}.png`;
      const outputPath = path.join(ICONS_DIR, filename);

      await sharp(SOURCE_LOGO)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Created ${filename}`);
    }

    // Generate apple-touch-icon (180x180)
    await sharp(SOURCE_LOGO)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));
    console.log('✅ Created apple-touch-icon.png');

    // Generate favicon.ico (32x32)
    await sharp(SOURCE_LOGO)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(PUBLIC_DIR, 'favicon.png'));
    console.log('✅ Created favicon.png');

    // Generate favicon-16x16
    await sharp(SOURCE_LOGO)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(PUBLIC_DIR, 'favicon-16x16.png'));
    console.log('✅ Created favicon-16x16.png');

    // Copy main icons
    await sharp(SOURCE_LOGO)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(PUBLIC_DIR, 'icon.png'));
    console.log('✅ Created icon.png');

    await sharp(SOURCE_LOGO)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(PUBLIC_DIR, 'apple-icon.png'));
    console.log('✅ Created apple-icon.png');

    // Generate navigation logos
    console.log('\n🎨 Generating navigation logos...\n');

    for (const logoConfig of LOGO_SIZES) {
      const outputPath = path.join(PUBLIC_DIR, logoConfig.name);

      await sharp(SOURCE_LOGO)
        .resize(logoConfig.width, logoConfig.height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Created ${logoConfig.name}`);
    }

    console.log('\n✨ Logo processing complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. Check the generated files in /public and /public/icons');
    console.log('   2. Run the app to see the new logo: npm run dev');
    console.log('   3. Clear your browser cache to see the new PWA icons\n');

  } catch (error) {
    console.error('❌ Error processing logo:', error.message);
    process.exit(1);
  }
}

processLogo();
