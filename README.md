# Vocabulary Learning App

A mobile web application for learning vocabulary through images with text-to-speech support.

## Features

- Image-based vocabulary learning
- Visual countdown timer
- Text-to-speech pronunciation (Google TTS API with browser fallback)
- English and Chinese translations
- Manual and automatic modes (coming soon)

## Setup

1. Clone the repository
2. Add your vocabulary images to the `images` directory
3. Set up Google Text-to-Speech API:
   - Create a Google Cloud Platform account
   - Enable the Text-to-Speech API
   - Create an API key with Text-to-Speech permissions
   - Add your API key to the `.env` file:
     ```
     GOOGLE_TTS_API_KEY=your_api_key_here
     ```
4. Install dependencies:
   ```
   npm install
   ```

## Building the Application

To build the application for deployment:

```
npm run build
```

This will:
1. Read the API key from your `.env` file
2. Replace the placeholder in `tts-manager.js` with your actual API key
3. Create a `dist` directory with all the prepared files

## Running the Application

### Development

1. Start a local server:
   ```
   npm start
   ```
   or
   ```
   python3 -m http.server 8000
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### Production

1. Build the application:
   ```
   npm run build
   ```
2. Deploy the contents of the `dist` directory to your hosting service (e.g., GitHub Pages)

## Adding New Vocabulary

To add new vocabulary items, edit the `vocabularyData` array in `app.js`:

```javascript
const vocabularyData = [
    {
        image: 'images/your-image.png',
        english: 'English Word',
        chinese: '中文词'
    },
    // Add more items as needed
];
```

## Future Enhancements

- Auto/manual mode toggle
- Categories for vocabulary items
- User progress tracking
- More language options

---
*Last build triggered: [Current Timestamp]* 