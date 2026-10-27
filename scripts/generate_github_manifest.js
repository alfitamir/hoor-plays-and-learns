import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const INCLUDED_PATHS = [
  '.gitignore',
  '.env.example',
  'README.md',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'metadata.json',
  'index.html',
  '.github/workflows/build-and-deploy.yml',
  'scripts/bundle_html.js',
  'scripts/build_apk.sh',
  'scripts/generate_github_manifest.js',
  'public/icon.svg',
  'public/apple-touch-icon.png',
  'public/pwa-192x192.png',
  'public/pwa-512x512.png',
  'public/pwa-maskable-512x512.png',
  'public/twa-manifest.json',
  'public/assets/aistudio/10160185010238213_11fa6234.jpg',
  'public/Hoor-Plays-Learns.apk',
  'public/Hoor-Plays-Learns-Android.html',
];

function walkDir(dir, baseRel = '') {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = path.posix.join(baseRel, entry.name);
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, relPath));
    } else if (entry.isFile()) {
      results.push(relPath);
    }
  }
  return results;
}

const srcFiles = walkDir(path.join(rootDir, 'src'), 'src');
const allFiles = [...INCLUDED_PATHS, ...srcFiles];

const manifestFiles = [];

for (const relPath of allFiles) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) continue;

  const ext = path.extname(relPath).toLowerCase();
  const isBinary = ['.jpg', '.jpeg', '.png', '.apk', '.zip', '.ico', '.webp'].includes(ext);

  if (isBinary) {
    const buffer = fs.readFileSync(fullPath);
    manifestFiles.push({
      path: relPath,
      encoding: 'base64',
      size: buffer.length,
      content: buffer.toString('base64'),
    });
  } else {
    const text = fs.readFileSync(fullPath, 'utf-8');
    manifestFiles.push({
      path: relPath,
      encoding: 'utf-8',
      size: Buffer.byteLength(text, 'utf-8'),
      content: text,
    });
  }
}

const outputManifest = {
  generatedAt: new Date().toISOString(),
  version: '2.4.0',
  totalFiles: manifestFiles.length,
  files: manifestFiles,
};

const outPath = path.join(rootDir, 'public', 'github-sync-manifest.json');
fs.writeFileSync(outPath, JSON.stringify(outputManifest, null, 2), 'utf-8');
console.log(`✅ Generated GitHub Sync Manifest with ${manifestFiles.length} files at ${outPath}`);
