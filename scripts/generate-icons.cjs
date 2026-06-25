const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '..', 'apps', 'web', 'public');

// Original paths from favicon.svg
const path1 = "M923.287-487.57C1003.55-488.63 1065.82-489.08 1065.82-489.08C1125.82-489.08 1160.82-454.08 1160.82-394.07C1160.82-334.07 1125.82-299.07 1065.82-299.07L1011.2-299.13C1011.22-299.08 1048.69-333.94 1048.69-333.94L1065.82-334.07C1100.82-334.07 1125.82-354.07 1125.82-394.07C1125.82-434.08 1100.82-454.08 1065.82-454.08C925.817-454.08 903.747-451.87 903.747-451.87";
const path2 = "M885.207-415.01L1036.16-415.09L963.497-336.43L1018.53-335.67L793.267-128L886.247-301.68L824.087-301.08L885.207-415.01Z";

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="652.043 -633.54 600 600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0c10"/>
      <stop offset="100%" stop-color="#050608"/>
    </linearGradient>
  </defs>
  <rect x="652.043" y="-633.54" width="600" height="600" rx="90" fill="url(#bg)"/>
  <rect x="652.043" y="-633.54" width="600" height="600" rx="90" fill="none" stroke="#1e2026" stroke-width="10"/>
  <g transform="translate(952.043, -363.54) scale(0.7) translate(-952.043, 363.54)">
    <path fill="#FFFFFF" d="${path1}"/>
    <path fill="#FFFFFF" d="${path2}"/>
  </g>
</svg>`;

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
