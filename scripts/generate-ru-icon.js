/**
 * Generate RU icon using Ideogram API
 * This script generates a clean, minimal "RU" badge icon for the Russian group
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const IDEOGRAM_API_KEY = 'fGDoK4f_gOWFjcDaS4vLxaavoVaWtzD8EgQXJiqWP72Fz3PBSg-bRzdtup_ajnP_vBBUZXZhBnPF3Y-CLxv4MA';

async function generateRUIcon() {
  const prompt = `A clean, minimal icon badge with the letters "RU" in white text on a solid blue background.
  Simple, flat design. No gradients. Professional look.
  The badge should be circular or rounded square shape.
  Modern, minimalist style. High contrast white letters on blue (#0088cc) background.`;

  const payload = JSON.stringify({
    prompt: prompt,
    aspect_ratio: '1x1',
    rendering_speed: 'TURBO',
    style_type: 'DESIGN',
    magic_prompt: 'OFF',
    num_images: 1
  });

  const options = {
    hostname: 'api.ideogram.ai',
    port: 443,
    path: '/v1/ideogram-v3/generate',
    method: 'POST',
    headers: {
      'Api-Key': IDEOGRAM_API_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.data && response.data[0] && response.data[0].url) {
            resolve(response.data[0].url);
          } else {
            reject(new Error('No image URL in response: ' + data));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const writeStream = fs.createWriteStream(filepath);
        res.pipe(writeStream);

        writeStream.on('finish', () => {
          writeStream.close();
          resolve();
        });

        writeStream.on('error', reject);
      } else {
        reject(new Error(`Failed to download image: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('Generating RU icon with Ideogram API...');
    const imageUrl = await generateRUIcon();
    console.log('Image generated:', imageUrl);

    const outputPath = path.join(__dirname, '..', 'public', 'images', 'ru-icon.png');
    const outputDir = path.dirname(outputPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Downloading image...');
    await downloadImage(imageUrl, outputPath);
    console.log('✅ RU icon saved to:', outputPath);
    console.log('\nNote: Ideogram image links expire. The image has been downloaded and saved locally.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
