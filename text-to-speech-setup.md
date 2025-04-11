# Text-to-Speech Setup Documentation

This document explains how to set up and securely manage the Google Text-to-Speech API in your project.

## Overview

The project uses Google's Text-to-Speech API with a fallback to browser-based speech synthesis. This setup provides high-quality voice output while maintaining security best practices for API key management.

## Prerequisites

1. A Google Cloud Platform account
2. Google Text-to-Speech API enabled in your GCP project
3. A GCP API key with Text-to-Speech permissions

## API Key Management

### Development Environment

1. Create a `.env` file in your project root (make sure it's in `.gitignore`)
2. Add your Google TTS API key:
   ```
   GOOGLE_TTS_API_KEY=your_api_key_here
   ```

### Production Environment

For production deployments, we use GitHub Actions secrets:

1. Go to your GitHub repository settings
2. Navigate to Secrets and Variables > Actions
3. Add a new secret named `GOOGLE_TTS_API_KEY` with your API key value

The deployment workflow automatically injects the API key during the build process:

```yaml
env:
  GOOGLE_TTS_API_KEY: ${{ secrets.GOOGLE_TTS_API_KEY }}
```

## Implementation Details

### Configuration

The API key is referenced in the code using a placeholder:

```javascript
googleTtsApiKey: '__GOOGLE_TTS_API_KEY__'
```

During build time, this placeholder is replaced with the actual API key from the environment variables.

### Security Measures

1. API key is never committed to the repository
2. Key is stored as an environment variable
3. Build process handles key injection
4. Fallback to browser TTS if API key is not properly configured
5. Client-side code never exposes the API key in source maps or browser dev tools

### Fallback Mechanism

The system includes a browser-based TTS fallback that automatically activates if:
- The Google TTS API key is not set
- The API request fails
- The API key is still set to the placeholder value

## Usage Example

```javascript
// Initialize the TTS manager
const googleTTS = new GoogleTTSManager();

// The API key is automatically loaded from the environment
// You don't need to manually set it in your code

// Use TTS in your application
googleTTS.speak("Hello, world!");
```

## Best Practices

1. Never commit the API key to version control
2. Always use environment variables for sensitive credentials
3. Implement proper error handling and fallback mechanisms
4. Regularly rotate API keys for security
5. Monitor API usage to prevent unexpected costs

## Troubleshooting

If text-to-speech isn't working:

1. Check if the API key is properly set in your environment
2. Verify the API is enabled in your Google Cloud Console
3. Check browser console for any error messages
4. Ensure the fallback browser TTS is supported in your target browsers

## Additional Resources

- [Google Cloud Text-to-Speech API Documentation](https://cloud.google.com/text-to-speech)
- [Google Cloud Console](https://console.cloud.google.com)
- [Environment Variables in GitHub Actions](https://docs.github.com/en/actions/reference/environment-variables) 