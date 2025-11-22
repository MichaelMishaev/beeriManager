const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public');

// OG Image dimensions (recommended for social media)
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// Colors from the app palette
const PRUSSIAN_BLUE = '#003153';
const BLUE_GREEN = '#0D98BA';
const SKY_BLUE = '#87CEEB';
const SELECTIVE_YELLOW = '#FFBA00';

async function generateOGImage() {
  console.log('🎨 Generating Open Graph image...\n');

  // Create SVG for OG image
  const ogSvg = `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${PRUSSIAN_BLUE};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${BLUE_GREEN};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${PRUSSIAN_BLUE};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>

      <!-- Decorative circles -->
      <circle cx="100" cy="100" r="150" fill="${SKY_BLUE}" opacity="0.1"/>
      <circle cx="1100" cy="530" r="200" fill="${SKY_BLUE}" opacity="0.1"/>
      <circle cx="600" cy="650" r="180" fill="${SELECTIVE_YELLOW}" opacity="0.08"/>

      <!-- Main content area -->
      <rect x="60" y="60" width="1080" height="510" rx="30" fill="rgba(255,255,255,0.1)" filter="url(#shadow)"/>

      <!-- Icon circle background -->
      <circle cx="600" cy="220" r="100" fill="rgba(255,255,255,0.2)"/>
      <circle cx="600" cy="220" r="85" fill="${PRUSSIAN_BLUE}"/>

      <!-- Hebrew text in icon -->
      <text x="600" y="210" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">ועד</text>
      <text x="600" y="260" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="${SELECTIVE_YELLOW}" text-anchor="middle" dominant-baseline="middle">הורים</text>

      <!-- Main title -->
      <text x="600" y="380" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">פורטל בארי</text>

      <!-- Subtitle -->
      <text x="600" y="450" font-family="Arial, sans-serif" font-size="32" fill="${SKY_BLUE}" text-anchor="middle" dominant-baseline="middle">בית הספר בארי - נתניה</text>

      <!-- Tagline -->
      <text x="600" y="510" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">אירועים • משימות • ועדות • פרוטוקולים</text>

      <!-- Bottom accent line -->
      <rect x="400" y="560" width="400" height="4" rx="2" fill="${SELECTIVE_YELLOW}"/>

      <!-- Domain -->
      <text x="600" y="600" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.6)" text-anchor="middle" dominant-baseline="middle">beeri.online</text>
    </svg>
  `;

  const ogOutputPath = path.join(OUTPUT_DIR, 'og-image.png');

  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(ogOutputPath);

  console.log(`✅ Generated OG image: ${ogOutputPath}`);

  // Get file size
  const stats = fs.statSync(ogOutputPath);
  console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`   Dimensions: ${OG_WIDTH}x${OG_HEIGHT}`);

  console.log('\n✨ OG image generation complete!');
}

generateOGImage().catch(console.error);
