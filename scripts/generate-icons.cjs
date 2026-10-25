#!/usr/bin/env node
/**
 * Generate all PWA/app icons from app-icon.svg
 * Run: node scripts/generate-icons.cjs
 * Requires: sharp (dev dependency)
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_SVG = path.resolve(__dirname, '../design/logo/app-icon.svg');
const OUTPUT_DIR = path.resolve(__dirname, '../public');

async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(INPUT_SVG);
    console.log('Reading app-icon.svg...');

    // Define all icon outputs
    const icons = [
      // Favicon sizes
      { name: 'favicon-16x16.png', size: 16, format: 'png' },
      { name: 'favicon-32x32.png', size: 32, format: 'png' },
      { name: 'favicon-48x48.png', size: 48, format: 'png' },

      // PWA any purpose
      { name: 'pwa-192x192.png', size: 192, format: 'png' },
      { name: 'pwa-512x512.png', size: 512, format: 'png' },

      // PWA maskable (with safe zone respected - background fills to edges)
      { name: 'pwa-maskable-192x192.png', size: 192, format: 'png' },
      { name: 'pwa-maskable-512x512.png', size: 512, format: 'png' },

      // Apple touch icon (180x180, opaque)
      { name: 'apple-touch-icon.png', size: 180, format: 'png' },
    ];

    for (const icon of icons) {
      await sharp(svgBuffer, { density: 300 })
        .resize(icon.size, icon.size)
        .png()
        .toFile(path.join(OUTPUT_DIR, icon.name))
        .then(() => console.log(`Generated ${icon.name} (${icon.size}x${icon.size})`));
    }

    // Favicon ICO - use 48x48
    await sharp(svgBuffer, { density: 300 })
      .resize(48, 48)
      .toFile(path.join(OUTPUT_DIR, 'favicon.ico'))
      .then(() => console.log(`Generated favicon.ico`));

    // Generate favicon.svg from logo-mark.svg (transparent background, currentColor-ready)
    const logoMark = fs.readFileSync(path.resolve(__dirname, '../design/logo/logo-mark.svg'), 'utf8');
    // Replace gradient with currentColor for theme-adaptive favicon
    const adaptiveFavicon = logoMark
      .replace(/url\(#logoGradient\)/g, 'currentColor')
      .replace(/#f2545b/g, 'currentColor')
      .replace(/#c93a45/g, 'currentColor');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.svg'), adaptiveFavicon);
    console.log('Generated favicon.svg (theme-adaptive)');

    console.log('\n✅ All icons generated successfully!');
    console.log('Output directory:', OUTPUT_DIR);

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();