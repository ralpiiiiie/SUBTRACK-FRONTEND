#!/usr/bin/env node
/**
 * Generate all PWA/app icons from design/logo/app-icon-master.svg
 * Run: node scripts/generate-icons.cjs
 * Requires: sharp (dev dependency)
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_SVG = path.resolve(__dirname, '../design/logo/app-icon-master.svg');
const OUTPUT_DIR = path.resolve(__dirname, '../public');

async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(INPUT_SVG);
    console.log('Reading app-icon-master.svg...');

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 1. PWA any-purpose icons (red background with rounded corners)
    await sharp(svgBuffer, { density: 300 })
      .resize(192, 192)
      .png()
      .toFile(path.join(OUTPUT_DIR, 'pwa-192x192.png'))
      .then(() => console.log('Generated pwa-192x192.png (192x192)'));

    await sharp(svgBuffer, { density: 300 })
      .resize(512, 512)
      .png()
      .toFile(path.join(OUTPUT_DIR, 'pwa-512x512.png'))
      .then(() => console.log('Generated pwa-512x512.png (512x512)'));

    // 2. PWA maskable icons - background fills ALL edges, no transparency, symbol in center 80%
    const maskableSvg = svgBuffer.toString()
      .replace('<rect width="512" height="512" rx="128" fill="#f2545b"/>',
        '<rect width="512" height="512" fill="#f2545b"/>'); // remove border-radius for maskable

    const maskableBuffer = Buffer.from(maskableSvg);

    await sharp(maskableBuffer, { density: 300 })
      .resize(192, 192)
      .png()
      .toFile(path.join(OUTPUT_DIR, 'pwa-maskable-192x192.png'))
      .then(() => console.log('Generated pwa-maskable-192x192.png (192x192)'));

    await sharp(maskableBuffer, { density: 300 })
      .resize(512, 512)
      .png()
      .toFile(path.join(OUTPUT_DIR, 'pwa-maskable-512x512.png'))
      .then(() => console.log('Generated pwa-maskable-512x512.png (512x512)'));

    // 3. Apple touch icon (180x180, opaque, no transparency, filled square)
    await sharp(maskableBuffer, { density: 300 })
      .resize(180, 180)
      .png()
      .toFile(path.join(OUTPUT_DIR, 'apple-touch-icon.png'))
      .then(() => console.log('Generated apple-touch-icon.png (180x180)'));

    // 4. Favicon ICO (multi-size: 16, 32, 48)
    const icoSizes = [16, 32, 48];
    for (const size of icoSizes) {
      await sharp(svgBuffer, { density: 300 })
        .resize(size, size)
        .png()
        .toFile(path.join(OUTPUT_DIR, `favicon-${size}.png`))
        .then(() => console.log(`Generated favicon-${size}.png (${size}x${size})`));
    }

    // Create ICO file from 48x48 (sharp doesn't do multi-size ICO directly)
    await sharp(svgBuffer, { density: 300 })
      .resize(48, 48)
      .toFile(path.join(OUTPUT_DIR, 'favicon.ico'))
      .then(() => console.log('Generated favicon.ico'));

    // 5. Favicon SVG (EXPLICIT COLORS: red background #f2545b, white glyph - NOT currentColor)
    const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="128" fill="#f2545b"/>
  <g transform="translate(64, 64) scale(9.333)">
    <path d="M8 10h32a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z"
          stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="16" cy="10" r="2.5" fill="white"/>
    <circle cx="32" cy="10" r="2.5" fill="white"/>
    <path d="M24 18c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8c0-2.2-.9-4.2-2.4-5.7"
          stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M24 30c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8c0 2.2.9 4.2 2.4-5.7"
          stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M16 25.5l-2.5 2.5 2.5 2.5"
          stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M32 22.5l2.5-2.5-2.5-2.5"
          stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
</svg>`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.svg'), faviconSvg);
    console.log('Generated favicon.svg (explicit red #f2545b + white)');

    console.log('\n✅ All icons generated successfully!');
    console.log('Output directory:', OUTPUT_DIR);

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();