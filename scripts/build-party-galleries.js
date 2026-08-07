#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const siteRoot = path.resolve(__dirname, '..');
const galleriesRoot = path.join(siteRoot, 'gallery', 'party-galleries');
const manifestPath = path.join(galleriesRoot, 'party-galleries.json');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const videoExtensions = new Set(['.mp4', '.m4v', '.webm', '.mov']);

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function slugify(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'party';
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function mediaUrl(folderName, fileName) {
  return `gallery/party-galleries/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`;
}

function mediaLabel(fileName) {
  return path.parse(fileName).name.replace(/^\d+[\s._-]*/, '').replace(/[-_]+/g, ' ').trim() || 'Event moment';
}

function makePartyPage(party) {
  const mediaMarkup = party.media.map((item, index) => {
    const label = escapeHtml(mediaLabel(item.file));
    if (item.type === 'video') {
      return `<article class="album-item"><video controls muted playsinline preload="metadata" aria-label="${label}"><source src="${item.src}"></video><span>${label}</span></article>`;
    }
    return `<a class="album-item" href="${item.src}" target="_blank" rel="noopener"><img ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" src="${item.src}" alt="${label}"><span>${label}</span></a>`;
  }).join('\n        ');

  const countLabel = [party.photoCount ? `${party.photoCount} Photo${party.photoCount === 1 ? '' : 's'}` : '', party.videoCount ? `${party.videoCount} Video${party.videoCount === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · ');
  return `<!DOCTYPE html>
<!-- AUTO-GENERATED PARTY GALLERY. Rename the folder or change its media, then run the gallery builder. -->
<html lang="en">
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-DNPBNVPL8C"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-DNPBNVPL8C');</script>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(party.title)} Gallery | Heat District Productions</title>
  <meta name="description" content="View the complete ${escapeHtml(party.title)} event gallery from Heat District Productions in South Florida.">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="https://heatdistrictproductions.com/${party.url}">
  <link rel="stylesheet" href="css/fonts.css"><link rel="stylesheet" href="css/global.css"><link rel="icon" href="favicon.png">
  <style>
    :root{--neon-blue:#00f0ff;--neon-pink:#ff2d78;--dark:#05050f;--text:#e8e8f0}*{box-sizing:border-box}body{margin:0;background:var(--dark);color:var(--text);font-family:'Raleway',sans-serif}.album-hero{padding:145px 42px 68px;border-bottom:1px solid rgba(0,240,255,.13);background:radial-gradient(circle at 82% 18%,rgba(255,45,120,.09),transparent 34%),radial-gradient(circle at 12% 82%,rgba(0,240,255,.07),transparent 36%)}.album-inner,.album-wrap{width:min(1450px,100%);margin:auto}.back{display:inline-block;margin-bottom:30px;color:var(--neon-blue);font-size:.62rem;font-weight:700;letter-spacing:2.2px;text-decoration:none;text-transform:uppercase}.eyebrow{margin:0 0 12px;color:rgba(0,240,255,.75);font-size:.6rem;font-weight:700;letter-spacing:3.6px;text-transform:uppercase}h1{margin:0;color:#fff;font-size:clamp(2.5rem,7vw,5.6rem);font-weight:300;font-style:italic;line-height:1}.meta{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.meta span{padding:8px 12px;border:1px solid rgba(0,240,255,.16);border-radius:999px;color:rgba(232,232,240,.72);font-size:.61rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase}.album-wrap{padding:62px 42px 105px}.album-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.album-item{position:relative;display:grid;place-items:center;min-height:470px;overflow:hidden;border:1px solid rgba(0,240,255,.13);border-radius:18px;background:#030309;text-decoration:none}.album-item img,.album-item video{width:100%;height:100%;max-height:78vh;object-fit:contain;background:#030309}.album-item span{position:absolute;right:0;bottom:0;left:0;padding:42px 18px 15px;background:linear-gradient(to top,rgba(5,5,15,.95),transparent);color:#fff;font-size:.72rem;font-weight:600;text-transform:capitalize}.empty{padding:90px 20px;text-align:center;color:rgba(232,232,240,.65)}@media(max-width:760px){.album-hero{padding:120px 20px 52px}.album-wrap{padding:42px 18px 80px}.album-grid{grid-template-columns:1fr}.album-item{min-height:360px}}
  </style>
</head>
<body><header id="siteNav"></header><main>
  <section class="album-hero"><div class="album-inner"><a class="back" href="gallery.html#event-photography">← Back to all party galleries</a><p class="eyebrow">Complete Party Gallery</p><h1>${escapeHtml(party.title)}</h1><div class="meta"><span>South Florida</span><span>${countLabel}</span></div></div></section>
  <section class="album-wrap"><div class="album-grid">${mediaMarkup || '<p class="empty">Photos coming soon.</p>'}</div></section>
</main><footer><div class="footer-logo"><img src="images/optimized/logo-nav.webp" alt="Heat District Productions" width="280" height="207"><span class="footer-productions-text">Productions</span></div><div class="footer-contact"><a href="tel:9545472990">(954) 547-2990</a><a href="mailto:HeatDistrictProd@gmail.com">HeatDistrictProd@gmail.com</a><a href="https://instagram.com/heatdistrictproductions" target="_blank" rel="noopener">@HeatDistrictProductions</a></div><p class="footer-copy">© 2026 Heat District Productions · All Rights Reserved</p></footer><script src="js/nav.js"></script><script src="js/global-cart.js"></script></body></html>`;
}

fs.mkdirSync(galleriesRoot, { recursive: true });
const usedSlugs = new Set();
const parties = fs.readdirSync(galleriesRoot, { withFileTypes: true }).filter(entry => entry.isDirectory()).sort((a, b) => naturalCompare(a.name, b.name)).map(entry => {
  const files = fs.readdirSync(path.join(galleriesRoot, entry.name), { withFileTypes: true }).filter(file => file.isFile()).map(file => file.name).filter(file => imageExtensions.has(path.extname(file).toLowerCase()) || videoExtensions.has(path.extname(file).toLowerCase())).sort(naturalCompare);
  if (!files.length) return null;
  let slug = slugify(entry.name); let suffix = 2; while (usedSlugs.has(slug)) slug = `${slugify(entry.name)}-${suffix++}`; usedSlugs.add(slug);
  const media = files.map(file => ({ file, src: mediaUrl(entry.name, file), type: videoExtensions.has(path.extname(file).toLowerCase()) ? 'video' : 'image' }));
  const images = media.filter(item => item.type === 'image');
  return { title: entry.name, slug, url: `party-${slug}.html`, cover: images.length ? images[0].src : 'images/optimized/logo-nav.webp', photoCount: images.length, videoCount: media.length - images.length, media };
}).filter(Boolean);

const generatedMarker = '<!-- AUTO-GENERATED PARTY GALLERY.';
for (const file of fs.readdirSync(siteRoot)) {
  if (!/^party-.*\.html$/i.test(file)) continue;
  const fullPath = path.join(siteRoot, file);
  if (fs.readFileSync(fullPath, 'utf8').includes(generatedMarker) && !parties.some(party => party.url === file)) fs.unlinkSync(fullPath);
}
for (const party of parties) fs.writeFileSync(path.join(siteRoot, party.url), makePartyPage(party));
fs.writeFileSync(manifestPath, `${JSON.stringify({ parties }, null, 2)}\n`);
console.log(`Built ${parties.length} automatic party ${parties.length === 1 ? 'gallery' : 'galleries'}.`);
