import fs from 'fs';
import path from 'path';

// 生成不同尺寸的 SVG 图标
function generateIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35"/>
      <stop offset="100%" style="stop-color:#F7C59F"/>
    </linearGradient>
  </defs>
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 * 0.9}" fill="url(#grad)"/>
  <text x="${size/2}" y="${size/2 + size*0.15}" font-family="Arial, sans-serif" font-size="${size*0.4}" font-weight="bold" fill="white" text-anchor="middle">食</text>
</svg>`;
}

const sizes = [36, 48, 72, 96, 144, 192, 512];
const publicDir = path.join(process.cwd(), 'public/icons');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

sizes.forEach(size => {
  const content = generateIcon(size);
  fs.writeFileSync(path.join(publicDir, `icon-${size}.svg`), content);
  console.log(`Generated icon-${size}.svg`);
});

console.log('All icons generated successfully!');
