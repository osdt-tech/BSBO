#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// === Projektinformationen ===
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));



const projectName = packageJson.name;
const version = packageJson.version;

// === Git-Hash ===
let gitHash = '';
try {
  gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch {
  console.warn('⚠️  Warning: Could not get git hash, using timestamp instead.');
  gitHash = Date.now().toString(36);
}

// === Pfade vorbereiten ===
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist directory not found. Run "npm run build" first.');
  process.exit(1);
}



const releasesDir = path.join(rootDir, 'releases');
if (!fs.existsSync(releasesDir)) fs.mkdirSync(releasesDir, { recursive: true });

const archiveName = `${projectName}-v${version}-${gitHash}.zip`;
const archivePath = path.join(releasesDir, archiveName);

console.log('📦 Creating ChurchTools extension package...');
console.log(`   Project: ${projectName}`);
console.log(`   Version: ${version}`);
console.log(`   Git Hash: ${gitHash}`);
console.log(`   Archive: ${archiveName}`);


// === ZIP-Datei mit archiver erstellen ===
try {
  const output = fs.createWriteStream(archivePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    const sizeMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
    console.log(`✅ Package created successfully (${sizeMB} MB)`);
    console.log(`📁 Location: ${archivePath}`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Upload the ZIP file to your ChurchTools instance');
    console.log('   2. Go to Admin → Extensions → Upload Extension');
    console.log('   3. Select the ZIP file and install');
    console.log('');
  });

  archive.on('error', (err) => { throw err; });

  archive.pipe(output);
  archive.directory(distDir, false);
  archive.finalize();

} catch (error) {
  console.error('❌ Error creating package:', error);
  process.exit(1);
}
