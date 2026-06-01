import fs from 'fs';
import path from 'path';

const icon192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35"/>
      <stop offset="100%" style="stop-color:#F7C59F"/>
    </linearGradient>
  </defs>
  <circle cx="96" cy="96" r="88" fill="url(#grad)"/>
  <text x="96" y="108" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">食</text>
</svg>`;

const icon512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35"/>
      <stop offset="100%" style="stop-color:#F7C59F"/>
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="235" fill="url(#grad)"/>
  <text x="256" y="285" font-family="Arial, sans-serif" font-size="192" font-weight="bold" fill="white" text-anchor="middle">食</text>
</svg>`;

const publicDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'icon-192x192.svg'), icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.svg'), icon512);

console.log('Icons generated successfully!');