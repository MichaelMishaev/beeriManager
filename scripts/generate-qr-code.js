const QRCode = require('qrcode');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const url = 'https://beeri.online/he/groups/explanation';
const outputDir = path.join(__dirname, '../public/qr-codes');
const tempQrPath = path.join(outputDir, 'temp-qr.png');
const outputPath = path.join(outputDir, 'groups-explanation-qr.png');
const logoPath = path.join(__dirname, '../public/logo-square.png');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateQRWithLogo() {
  try {
    // Step 1: Generate QR code
    await QRCode.toFile(
      tempQrPath,
      url,
      {
        errorCorrectionLevel: 'H', // High error correction for logo overlay
        type: 'png',
        quality: 1,
        margin: 2,
        color: {
          dark: '#003153',  // Prussian Blue from your design system
          light: '#FFFFFF'
        },
        width: 512 // High resolution
      }
    );

    console.log('✅ QR code base generated');

    // Step 2: Resize logo to fit in center (about 20% of QR size)
    const logoSize = Math.floor(512 * 0.2); // 20% of QR size
    const resizedLogo = await sharp(logoPath)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();

    console.log('✅ Logo resized');

    // Step 3: Add white background circle behind logo for better visibility
    const circleSize = logoSize + 20;
    const circle = Buffer.from(
      `<svg width="${circleSize}" height="${circleSize}">
        <circle cx="${circleSize/2}" cy="${circleSize/2}" r="${circleSize/2}" fill="white"/>
      </svg>`
    );

    const circleBuffer = await sharp(circle).png().toBuffer();

    // Step 4: Composite QR code with white circle and logo
    const qrCenter = Math.floor(512 / 2);
    const circleOffset = Math.floor(circleSize / 2);
    const logoOffset = Math.floor(logoSize / 2);

    await sharp(tempQrPath)
      .composite([
        {
          input: circleBuffer,
          top: qrCenter - circleOffset,
          left: qrCenter - circleOffset
        },
        {
          input: resizedLogo,
          top: qrCenter - logoOffset,
          left: qrCenter - logoOffset
        }
      ])
      .toFile(outputPath);

    console.log('✅ Logo overlaid on QR code');

    // Clean up temp file
    fs.unlinkSync(tempQrPath);

    console.log('\n🎉 QR code with logo generated successfully!');
    console.log(`📍 Location: ${outputPath}`);
    console.log(`🔗 URL: ${url}`);
    console.log(`🎨 Logo: ${logoPath}`);
    console.log('\nYou can now use this QR code in:');
    console.log('  - Print materials');
    console.log('  - Presentations');
    console.log('  - WhatsApp messages');
    console.log('  - Website');

  } catch (err) {
    console.error('Error generating QR code with logo:', err);
    // Clean up temp file if it exists
    if (fs.existsSync(tempQrPath)) {
      fs.unlinkSync(tempQrPath);
    }
    process.exit(1);
  }
}

generateQRWithLogo();
