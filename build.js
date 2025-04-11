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
let apiKey = process.env.GOOGLE_TTS_API_KEY;

console.log('Build process starting...');
console.log('Initial checks:');
console.log('1. Direct env var:', process.env.GOOGLE_TTS_API_KEY ? '[PRESENT]' : '[MISSING]');
console.log('2. Loaded apiKey var:', apiKey ? '[PRESENT]' : '[MISSING]');
console.log('3. Direct env var type:', typeof process.env.GOOGLE_TTS_API_KEY);
console.log('4. Direct env var length:', process.env.GOOGLE_TTS_API_KEY ? process.env.GOOGLE_TTS_API_KEY.length : 0);
console.log('5. First 6 chars:', process.env.GOOGLE_TTS_API_KEY ? process.env.GOOGLE_TTS_API_KEY.substring(0, 6) : 'N/A');

// Try reading from .env file directly as backup
if (!apiKey || apiKey.length < 30) {
    console.log('API key missing or too short, trying to read from .env file directly...');
    try {
        const envContent = fs.readFileSync('.env', 'utf8');
        console.log('.env file content length:', envContent.length);
        const envMatch = envContent.match(/GOOGLE_TTS_API_KEY=(.+)/);
        if (envMatch && envMatch[1]) {
            apiKey = envMatch[1].trim();
            console.log('Successfully read API key from .env file');
            console.log('Key from .env length:', apiKey.length);
        }
    } catch (error) {
        console.error('Error reading .env file:', error.message);
    }
}

console.log('Final API key check:');
console.log('- Key exists:', !!apiKey);
console.log('- Key length:', apiKey ? apiKey.length : 0);
console.log('- Key starts with:', apiKey ? apiKey.substring(0, 6) + '...' : '[MISSING]');

if (!apiKey) {
    console.error('Error: Could not find API key in environment or .env file');
    process.exit(1);
}

if (apiKey === 'GOOGLE_TTS_API_KEY' || apiKey.length === 22) {
    console.error('Error: Found literal "GOOGLE_TTS_API_KEY" instead of actual key');
    process.exit(1);
}

// Validate API key format
if (apiKey.length < 30) {
    console.error('Error: API key seems too short. Google API keys are typically longer.');
    console.error('Expected length: ~39 characters, Got:', apiKey.length);
    process.exit(1);
}

if (!apiKey.startsWith('AIza')) {
  console.error('Error: API key format seems incorrect. Google API keys typically start with "AIza"');
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

// Simple string replacement with validation
const placeholder = '%%GOOGLE_TTS_API_KEY%%';
console.log('Checking for placeholder:', placeholder);
console.log('Placeholder exists in file:', ttsManagerContent.includes(placeholder));

if (!ttsManagerContent.includes(placeholder)) {
    console.error('ERROR: Could not find API key placeholder in the file');
    // Log the current API_KEY line for debugging
    const currentKeyMatch = ttsManagerContent.match(/static API_KEY = ['"]([^'"]+)['"]/);
    if (currentKeyMatch) {
        console.log('Current API_KEY value length:', currentKeyMatch[1].length);
        console.log('Current API_KEY starts with:', currentKeyMatch[1].substring(0, 6));
    }
    process.exit(1);
}

console.log('Found placeholder in file');

// Create the replacement pattern
const replacement = `static API_KEY = '${apiKey}';`;
console.log('Replacement string length:', replacement.length);
ttsManagerContent = ttsManagerContent.replace(/static API_KEY = ['"].*?['"];/, replacement);

// Verify replacement
if (ttsManagerContent.includes(placeholder)) {
    console.error('ERROR: Placeholder still exists after replacement');
    process.exit(1);
}

// Verify the API key was injected correctly
const keyPattern = new RegExp(apiKey);
if (!keyPattern.test(ttsManagerContent)) {
    console.error('ERROR: API key was not properly injected into the file');
    process.exit(1);
}

// Additional verification
const staticKeyMatch = ttsManagerContent.match(/static API_KEY = ['"]([^'"]+)['"]/);
if (!staticKeyMatch) {
    console.error('ERROR: Could not find static API_KEY after replacement');
    process.exit(1);
}

const injectedKeyLength = staticKeyMatch[1].length;
console.log('Verifying injected API key length:', injectedKeyLength);
console.log('Injected key starts with:', staticKeyMatch[1].substring(0, 6));

if (injectedKeyLength !== apiKey.length) {
    console.error('ERROR: Injected key length mismatch');
    console.error('Expected:', apiKey.length, 'Got:', injectedKeyLength);
    process.exit(1);
}

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