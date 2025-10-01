#!/usr/bin/env node

/**
 * Generate PWA icons using Canvas
 * Creates placeholder icons with the app logo/text
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple SVG template for the icon
function generateSVG(size) {
  const fontSize = Math.floor(size / 6);
  const padding = size * 0.2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0D98BA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#003153;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle" direction="rtl">ועד</text>
  <text x="50%" y="${size * 0.65}" font-family="Arial, sans-serif" font-size="${fontSize * 0.7}" font-weight="normal" fill="#FFBA00" text-anchor="middle" dominant-baseline="middle">הורים</text>
</svg>`;
}

// Check if sharp is available for PNG conversion
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('⚠️  Sharp not available, generating SVG placeholders only');
}

// Generate icons
async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  for (const size of sizes) {
    const svg = generateSVG(size);
    const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);

    // Always save SVG
    fs.writeFileSync(svgPath, svg);
    console.log(`✅ Generated ${size}x${size} SVG`);

    // Convert to PNG if sharp is available
    if (sharp) {
      try {
        const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
        await sharp(Buffer.from(svg))
          .resize(size, size)
          .png()
          .toFile(pngPath);
        console.log(`✅ Generated ${size}x${size} PNG`);
      } catch (error) {
        console.log(`⚠️  Could not generate ${size}x${size} PNG:`, error.message);
      }
    }
  }

  // Generate shortcut icons
  const shortcutIcons = [
    { name: 'events-shortcut', emoji: '📅', color: '#0D98BA', letter: 'א' },
    { name: 'tasks-shortcut', emoji: '✓', color: '#FFBA00', letter: 'מ' },
    { name: 'calendar-shortcut', emoji: '🗓️', color: '#003153', letter: 'ל' },
    { name: 'feedback-shortcut', emoji: '💬', color: '#FF8200', letter: 'פ' }
  ];

  for (const icon of shortcutIcons) {
    const size = 96;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${icon.color}" rx="${size * 0.15}"/>
  <text x="50%" y="55%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="middle">${icon.emoji}</text>
</svg>`;

    const svgPath = path.join(iconsDir, `${icon.name}.svg`);
    fs.writeFileSync(svgPath, svg);
    console.log(`✅ Generated ${icon.name} SVG`);

    // For PNG, use simple text instead of emoji to avoid Pango font rendering crashes
    if (sharp) {
      try {
        const pngSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${icon.color}" rx="${size * 0.15}"/>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${icon.letter}</text>
</svg>`;
        const pngPath = path.join(iconsDir, `${icon.name}.png`);
        await sharp(Buffer.from(pngSvg))
          .resize(size, size)
          .png()
          .toFile(pngPath);
        console.log(`✅ Generated ${icon.name} PNG`);
      } catch (error) {
        console.log(`⚠️  Could not generate ${icon.name} PNG (${error.message})`);
        // This is okay - SVG works everywhere, PNG is just an optimization
      }
    }
  }

  console.log('\n✨ Icon generation complete!');

  if (!sharp) {
    console.log('\n💡 Tip: Install sharp for PNG generation:');
    console.log('   npm install sharp');
  }
}

generateIcons().catch(console.error);