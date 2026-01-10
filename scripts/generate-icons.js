import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const iconsDir = join(publicDir, 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Read the SVG
const svgPath = join(publicDir, 'favicon.svg');
const svgBuffer = readFileSync(svgPath);

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generating PWA icons...');

async function generateIcons() {
  try {
    // Generate all sizes
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(join(iconsDir, `icon-${size}.png`));
      console.log(`  Created icon-${size}.png`);
    }

    // Also create the vite-plugin-pwa expected icons
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(join(publicDir, 'pwa-192x192.png'));
    console.log('  Created pwa-192x192.png');

    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(join(publicDir, 'pwa-512x512.png'));
    console.log('  Created pwa-512x512.png');

    // Create apple-touch-icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(join(publicDir, 'apple-touch-icon.png'));
    console.log('  Created apple-touch-icon.png');

    console.log('\nAll PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
