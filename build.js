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

console.log('Build process starting...');
console.log('API key exists:', !!apiKey);
console.log('API key length:', apiKey ? apiKey.length : 0);

if (!apiKey) {
  console.error('Error: GOOGLE_TTS_API_KEY not found in .env file');
  process.exit(1);
}

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
  console.log('Created dist directory');
}

// Process tts-manager.js
const ttsManagerPath = path.join(__dirname, 'tts-manager.js');
console.log('Reading tts-manager.js from:', ttsManagerPath);
let ttsManagerContent = fs.readFileSync(ttsManagerPath, 'utf8');

// Simple string replacement
const placeholder = '%%GOOGLE_TTS_API_KEY%%';
if (!ttsManagerContent.includes(placeholder)) {
    console.error('ERROR: Could not find API key placeholder in the file');
    process.exit(1);
}

console.log('Found placeholder in file');
ttsManagerContent = ttsManagerContent.replace(placeholder, apiKey);

// Verify replacement
if (ttsManagerContent.includes(placeholder)) {
    console.error('ERROR: Placeholder still exists after replacement');
    process.exit(1);
}
console.log('API key replacement successful');

// Write the processed tts-manager.js to dist
const outputPath = path.join(distDir, 'tts-manager.js');
fs.writeFileSync(outputPath, ttsManagerContent);
console.log('Wrote processed tts-manager.js to:', outputPath);

// Copy other static files
const filesToCopy = [
    'index.html',
    'styles.css',
    'app.js'
];

filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(distDir, file));
    }
});

// Copy images directory if it exists
const imagesDir = path.join(__dirname, 'images');
if (fs.existsSync(imagesDir)) {
    const distImagesDir = path.join(distDir, 'images');
    if (!fs.existsSync(distImagesDir)) {
        fs.mkdirSync(distImagesDir);
    }
    fs.readdirSync(imagesDir).forEach(file => {
        fs.copyFileSync(
            path.join(imagesDir, file),
            path.join(distImagesDir, file)
        );
    });
}

console.log('Build completed successfully!'); 