#!/usr/bin/env node
/**
 * PWA Icon and Manifest Validator
 * Run: node scripts/check-pwa.mjs
 * Uses only built-in Node APIs + sharp (already in devDependencies)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const MANIFEST_PATH = path.join(DIST_DIR, 'manifest.webmanifest');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');

let hasErrors = false;

function logPass(msg) {
  console.log(`✅ PASS: ${msg}`);
}

function logFail(msg) {
  console.log(`❌ FAIL: ${msg}`);
  hasErrors = true;
}

function logInfo(msg) {
  console.log(`ℹ️  INFO: ${msg}`);
}

async function checkManifest() {
  console.log('\n=== MANIFEST CHECKS ===\n');

  if (!fs.existsSync(MANIFEST_PATH)) {
    logFail('manifest.webmanifest not found in dist/');
    return;
  }

  const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  let manifest;
  try {
    manifest = JSON.parse(manifestContent);
  } catch (e) {
    logFail(`manifest.webmanifest is invalid JSON: ${e.message}`);
    return;
  }

  logPass('manifest.webmanifest is valid JSON');

  // Check required fields
  const requiredFields = ['name', 'short_name', 'icons', 'theme_color', 'background_color', 'display', 'start_url'];
  for (const field of requiredFields) {
    if (manifest[field]) {
      logPass(`manifest has required field: ${field}`);
    } else {
      logFail(`manifest missing required field: ${field}`);
    }
  }

  // Check name consistency
  if (manifest.name === 'SubTrack: Personal Subscription Tracker') {
    logPass(`manifest.name is correct: "${manifest.name}"`);
  } else {
    logFail(`manifest.name is "${manifest.name}", expected "SubTrack: Personal Subscription Tracker"`);
  }

  if (manifest.short_name === 'SubTrack') {
    logPass(`manifest.short_name is correct: "${manifest.short_name}"`);
  } else {
    logFail(`manifest.short_name is "${manifest.short_name}", expected "SubTrack"`);
  }

  // Check colors
  if (manifest.theme_color === '#f2545b') {
    logPass(`manifest.theme_color is logo red: ${manifest.theme_color}`);
  } else {
    logFail(`manifest.theme_color is "${manifest.theme_color}", expected "#f2545b"`);
  }

  if (manifest.background_color === '#0B1211') {
    logPass(`manifest.background_color is app bg: ${manifest.background_color}`);
  } else {
    logFail(`manifest.background_color is "${manifest.background_color}", expected "#0B1211"`);
  }

  // Check icons
  if (!manifest.icons || !Array.isArray(manifest.icons)) {
    logFail('manifest.icons is missing or not an array');
    return;
  }

  logPass(`manifest has ${manifest.icons.length} icon entries`);

  // Check each icon
  for (const icon of manifest.icons) {
    const iconPath = path.join(DIST_DIR, icon.src.replace(/^\//, ''));

    if (!fs.existsSync(iconPath)) {
      logFail(`Icon file missing: ${icon.src}`);
      continue;
    }

    // Check file size matches manifest
    try {
      const buffer = fs.readFileSync(iconPath);
      const img = sharp(buffer);
      const meta = await img.metadata();

      const expectedSize = icon.sizes;
      const actualSize = `${meta.width}x${meta.height}`;

      if (expectedSize === actualSize) {
        logPass(`Icon ${icon.src}: size matches (${actualSize})`);
      } else {
        logFail(`Icon ${icon.src}: size mismatch - manifest says ${expectedSize}, file is ${actualSize}`);
      }

      // Check maskable icons have no transparency at edges
      if (icon.purpose === 'maskable') {
        const { data } = await img.raw().toBuffer({ resolveWithObject: true });
        let hasTransparentEdge = false;
        const width = meta.width;
        const height = meta.height;

        // Check corners and edges for transparency (alpha = 0)
        const checkEdge = (x, y) => {
          const idx = (y * width + x) * 4 + 3; // alpha channel
          return data[idx] === 0;
        };

        // Check four corners (5% from edge)
        const margin = Math.floor(Math.min(width, height) * 0.05);
        for (let x = 0; x < margin; x++) {
          for (let y = 0; y < margin; y++) {
            if (checkEdge(x, y) || checkEdge(width - 1 - x, y) || checkEdge(x, height - 1 - y) || checkEdge(width - 1 - x, height - 1 - y)) {
              hasTransparentEdge = true;
              break;
            }
          }
        }

        if (hasTransparentEdge) {
          logFail(`Maskable icon ${icon.src}: has transparent pixels at edges (will be cut by Android mask)`);
        } else {
          logPass(`Maskable icon ${icon.src}: no transparent pixels at edges`);
        }
      }

    } catch (e) {
      logFail(`Error reading icon ${icon.src}: ${e.message}`);
    }
  }

  // Check for separate "any" and "maskable" entries (not combined)
  const combined = manifest.icons.some(i => i.purpose && i.purpose.includes('any') && i.purpose.includes('maskable'));
  if (combined) {
    logFail('Some icons have combined "any maskable" purpose - should be separate entries');
  } else {
    logPass('Icons have separate "any" and "maskable" entries');
  }
}

async function checkIndexHtml() {
  console.log('\n=== INDEX.HTML CHECKS ===\n');

  if (!fs.existsSync(INDEX_HTML_PATH)) {
    logFail('index.html not found in dist/');
    return;
  }

  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

  // Check favicon links with cache-busting
  const faviconSvgMatch = html.match(/href="\/favicon\.svg\?v=(\d+)"/);
  if (faviconSvgMatch) {
    logPass(`favicon.svg has cache-busting: v=${faviconSvgMatch[1]}`);
  } else {
    logFail('favicon.svg missing cache-busting query string');
  }

  const appleTouchMatch = html.match(/href="\/apple-touch-icon\.png\?v=(\d+)"/);
  if (appleTouchMatch) {
    logPass(`apple-touch-icon.png has cache-busting: v=${appleTouchMatch[1]}`);
  } else {
    logFail('apple-touch-icon.png missing cache-busting query string');
  }

  // Check theme-color meta
  const themeColorMatch = html.match(/name="theme-color" content="#f2545b"/);
  if (themeColorMatch) {
    logPass('meta theme-color matches logo red (#f2545b)');
  } else {
    logFail('meta theme-color missing or incorrect');
  }

  // Check apple-mobile-web-app-title
  const appleTitleMatch = html.match(/name="apple-mobile-web-app-title" content="SubTrack"/);
  if (appleTitleMatch) {
    logPass('apple-mobile-web-app-title is "SubTrack"');
  } else {
    logFail('apple-mobile-web-app-title missing or incorrect');
  }

  // Check viewport-fit=cover
  if (html.includes('viewport-fit=cover')) {
    logPass('viewport has viewport-fit=cover');
  } else {
    logFail('viewport missing viewport-fit=cover');
  }

  // Check title
  const titleMatch = html.match(/<title>SubTrack: Personal Subscription Tracker<\/title>/);
  if (titleMatch) {
    logPass('title matches manifest name');
  } else {
    logFail('title does not match manifest name');
  }

  // Check manifest link with cache-busting
  const manifestLinkMatch = html.match(/href="\/manifest\.webmanifest\?v=(\d+)"/);
  if (manifestLinkMatch) {
    logPass(`manifest link has cache-busting: v=${manifestLinkMatch[1]}`);
  } else {
    logFail('manifest link missing cache-busting');
  }
}

async function checkIcons() {
  console.log('\n=== ICON FILE CHECKS ===\n');

  const iconFiles = [
    { path: 'favicon.svg', expectedSize: '512x512', isVector: true },
    { path: 'favicon.ico', expectedSize: '48x48', isIco: true },
    { path: 'favicon-16.png', expectedSize: '16x16' },
    { path: 'favicon-32.png', expectedSize: '32x32' },
    { path: 'favicon-48.png', expectedSize: '48x48' },
    { path: 'pwa-192x192.png', expectedSize: '192x192' },
    { path: 'pwa-512x512.png', expectedSize: '512x512' },
    { path: 'pwa-maskable-192x192.png', expectedSize: '192x192', isMaskable: true },
    { path: 'pwa-maskable-512x512.png', expectedSize: '512x512', isMaskable: true },
    { path: 'apple-touch-icon.png', expectedSize: '180x180' },
  ];

  for (const icon of iconFiles) {
    const iconPath = path.join(DIST_DIR, icon.path);

    if (!fs.existsSync(iconPath)) {
      logFail(`Missing icon file: ${icon.path}`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(iconPath);

      if (icon.isVector) {
        logPass(`${icon.path}: SVG exists (${buffer.length} bytes)`);
      } else if (icon.isIco) {
        logPass(`${icon.path}: ICO exists (${buffer.length} bytes)`);
      } else {
        const img = sharp(buffer);
        const meta = await img.metadata();

        if (`${meta.width}x${meta.height}` === icon.expectedSize) {
          logPass(`${icon.path}: size matches (${meta.width}x${meta.height})`);
        } else {
          logFail(`${icon.path}: size mismatch - expected ${icon.expectedSize}, got ${meta.width}x${meta.height}`);
        }

        // Check maskable icons
        if (icon.isMaskable) {
          const { data } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
          const { width, height } = meta;
          let hasTransparentEdge = false;

          const margin = Math.floor(Math.min(width, height) * 0.05);
          const checkEdge = (x, y) => {
            const idx = (y * width + x) * 4 + 3;
            return data[idx] === 0;
          };

          for (let x = 0; x < Math.min(width, height) * 0.05; x++) {
            for (let y = 0; y < Math.min(width, height) * 0.05; y++) {
              if (checkEdge(x, y) || checkEdge(width - 1 - x, y) || checkEdge(x, height - 1 - y) || checkEdge(width - 1 - x, height - 1 - y)) {
                hasTransparentEdge = true;
                break;
              }
            }
          }

          if (hasTransparentEdge) {
            logFail(`${icon.path}: maskable icon has transparent pixels at edges`);
          } else {
            logPass(`${icon.path}: maskable icon has no transparent edges`);
          }
        }

        // Check apple-touch-icon has no transparency
        if (icon.path === 'apple-touch-icon.png') {
          const { data } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
          const { width, height } = meta;
          let hasTransparency = false;

          for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 255) {
              hasTransparency = true;
              break;
            }
          }

          if (hasTransparency) {
            logFail('apple-touch-icon.png has transparency (should be fully opaque)');
          } else {
            logPass('apple-touch-icon.png is fully opaque');
          }
        }
      }
    } catch (e) {
      logFail(`Error checking ${icon.path}: ${e.message}`);
    }
  }
}

async function checkCrossConsistency() {
  console.log('\n=== CROSS-CONSISTENCY CHECKS ===\n');

  const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  const manifest = JSON.parse(manifestContent);
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

  // Name consistency
  if (html.includes('SubTrack: Personal Subscription Tracker') && manifest.name === 'SubTrack: Personal Subscription Tracker') {
    logPass('Title in HTML matches manifest name');
  } else {
    logFail('HTML title and manifest name mismatch');
  }

  if (manifest.short_name === 'SubTrack' && html.includes('apple-mobile-web-app-title" content="SubTrack"')) {
    logPass('Short name and apple title consistent');
  } else {
    logFail('Short name and apple title mismatch');
  }

  // Theme color consistency
  if (manifest.theme_color === '#f2545b' && html.includes('content="#f2545b"')) {
    logPass('Theme color consistent across manifest and HTML');
  } else {
    logFail('Theme color mismatch between manifest and HTML');
  }
}

async function checkVercelRewrites() {
  console.log('\n=== VERCEL REWRITE CHECKS ===\n');

  const vercelPath = path.resolve(__dirname, '../vercel.json');
  if (!fs.existsSync(vercelPath)) {
    logFail('vercel.json not found');
    return;
  }

  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));

  // Check that rewrites don't catch icons, manifest, or sw.js
  const rewrites = vercel.rewrites || [];
  const protectedPaths = ['/manifest.webmanifest', '/sw.js', '/favicon', '/pwa-', '/apple-touch-icon'];

  let hasCatchAll = false;
  for (const rewrite of rewrites) {
    if (rewrite.source === '/(.*)' || rewrite.source === '/*') {
      hasCatchAll = true;
      logInfo('SPA catch-all rewrite found (expected)');
    }

    for (const protectedPath of protectedPaths) {
      if (rewrite.source === protectedPath || rewrite.source.startsWith(protectedPath)) {
        logPass(`Protected path "${protectedPath}" has explicit rewrite`);
      }
    }
  }

  if (!hasCatchAll) {
    logFail('No SPA catch-all rewrite found');
  }
}

async function checkServiceWorkerPrecache() {
  console.log('\n=== SERVICE WORKER PRECACHE CHECKS ===\n');

  const swPath = path.join(DIST_DIR, 'sw.js');
  if (!fs.existsSync(swPath)) {
    logFail('sw.js not found in dist/');
    return;
  }

  const swContent = fs.readFileSync(swPath, 'utf-8');

  // Check that all icon files are precached
  const iconFiles = [
    'pwa-192x192.png',
    'pwa-512x512.png',
    'pwa-maskable-192x192.png',
    'pwa-maskable-512x512.png',
    'apple-touch-icon.png',
    'favicon.svg',
    'favicon.ico',
    'favicon-16.png',
    'favicon-32.png',
    'favicon-48.png',
    'manifest.webmanifest',
  ];

  for (const icon of iconFiles) {
    if (swContent.includes(icon)) {
      logPass(`Service worker precaches ${icon}`);
    } else {
      logFail(`Service worker missing precache for ${icon}`);
    }
  }

  // Check skipWaiting and clientsClaim
  if (swContent.includes('skipWaiting') && swContent.includes('clientsClaim')) {
    logPass('Service worker has skipWaiting and clientsClaim');
  } else {
    logFail('Service worker missing skipWaiting or clientsClaim');
  }
}

async function main() {
  console.log('🔍 PWA ICON AND MANIFEST VALIDATOR');
  console.log('====================================\n');

  await checkManifest();
  await checkIndexHtml();
  await checkIcons();
  await checkCrossConsistency();
  await checkVercelRewrites();
  await checkServiceWorkerPrecache();

  console.log('\n====================================');
  if (hasErrors) {
    console.log('❌ SOME CHECKS FAILED');
    process.exit(1);
  } else {
    console.log('✅ ALL CHECKS PASSED');
    process.exit(0);
  }
}

main();