/**
 * Build script for VocabV2
 * 
 * This script prepares the application for deployment by:
 * 1. Reading the API key from the .env file
 * 2. Replacing the placeholder in tts-manager.js with the actual API key
 * 3. Creating a dist directory with the prepared files
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Get the API key from environment variables
const apiKey = process.env.GOOGLE_TTS_API_KEY;

if (!apiKey) {
  console.error('Error: GOOGLE_TTS_API_KEY not found in .env file');
  process.exit(1);
}

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy and process files
const filesToCopy = [
  'index.html',
  'styles.css',
  'app.js',
  'images'
];

// Process tts-manager.js
const ttsManagerPath = path.join(__dirname, 'tts-manager.js');
const ttsManagerContent = fs.readFileSync(ttsManagerPath, 'utf8');
const processedTtsManager = ttsManagerContent.replace(
  /return ['"]__GOOGLE_TTS_API_KEY__['"];/,
  `return '${apiKey}';`
);

// Write the processed tts-manager.js to dist
fs.writeFileSync(path.join(distDir, 'tts-manager.js'), processedTtsManager);

// Copy other files
filesToCopy.forEach(file => {
  const sourcePath = path.join(__dirname, file);
  const destPath = path.join(distDir, file);
  
  if (fs.lstatSync(sourcePath).isDirectory()) {
    // Copy directory recursively
    copyDir(sourcePath, destPath);
  } else {
    // Copy file
    fs.copyFileSync(sourcePath, destPath);
  }
});

console.log('Build completed successfully! Files are ready in the dist directory.');

/**
 * Recursively copy a directory
 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
} 