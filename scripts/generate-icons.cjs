const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '..', 'apps', 'web', 'public');
const svgPath = path.join(publicDir, 'favicon.svg');

// Read original SVG
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Replace viewBox to add padding: current content is ~80% fill,
// new viewBox gives ~55-60% fill (proper icon padding)
const paddedSvg = svgContent.replace(
  'viewBox="752.043 -533.54 450 450"',
  'viewBox="652.043 -633.54 600 600"'
);

// Add dark background rect
const iconSvg = paddedSvg.replace(
  '<svg',
  '<svg style="background:#07080a"'
);

async function generate() {
  const sizes = [
    { name: 'icon-192x192.png', size: 192 },
    { name: 'icon-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];
  for (const { name, size } of sizes) {
    await sharp(Buffer.from(iconSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, name));
    console.log(`✓ ${name} (${size}x${size})`);
  }
}

generate().catch(err => { console.error(err); process.exit(1); });
