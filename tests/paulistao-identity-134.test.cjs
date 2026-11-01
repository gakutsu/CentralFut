const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root,'src/style.css'),'utf8');
const app = fs.readFileSync(path.join(root,'src/app.js'),'utf8');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const svg = fs.readFileSync(path.join(root,'assets/paulistao-electric-bg.svg'),'utf8');

test('Paulistão has its own electric blue visual identity and local geometric asset',()=>{
 assert.match(css, /Paulistão: linguagem azul elétrica/);
 assert.match(css, /body\.theme-paulista\s*\{[\s\S]*?--accent:#6c8bff/);
 assert.match(css, /\.hero-paulista\s*\{[\s\S]*?paulistao-electric-bg\.svg/);
 assert.match(svg, /<svg/);
 assert.match(svg, /#030E86/);
 assert.match(svg, /<path/);
});

test('hero has PAULISTÃO wordmark and previous redundant trophy card remains excluded',()=>{
 assert.match(app, /c\.key==='paulista'\s*\?\s*'PAULISTÃO'/);
 assert.match(app, /c\.key === 'paulista' \? ''/);
 assert.match(app, /Campeonato Paulista · Série A1/);
});

test('non-Paulistão themes and cache-busting asset paths remain present',()=>{
 for (const slug of ['libertadores','copa','brasileirao']) {
   assert.match(css, new RegExp(`body\\.theme-${slug}`));
 }
 const version = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
 assert.ok(html.includes('style.css?v='+version));
 assert.ok(html.includes('bundle.js?v='+version));
 assert.ok(fs.existsSync(path.join(root,'assets/libertadores-trofeu.webp')));
 assert.ok(fs.existsSync(path.join(root,'assets/velo-clube-oficial-v2.png')));
});
