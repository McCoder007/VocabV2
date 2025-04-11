require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('dist'));

// TTS endpoint
app.post('/api/tts', async (req, res) => {
    try {
        const { text, lang, voice } = req.body;
        
        // Validate input
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Prepare voice configuration
        const voiceConfig = voice ? {
            name: voice,
            languageCode: lang || 'en-US'
        } : {
            languageCode: lang || 'en-US'
        };

        // Call Google TTS API
        const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: { text },
                    voice: voiceConfig,
                    audioConfig: {
                        audioEncoding: 'MP3',
                        speakingRate: 1.0,
                        pitch: 0
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Google TTS API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Convert base64 to buffer
        const audioBuffer = Buffer.from(data.audioContent, 'base64');
        
        // Send audio data
        res.set('Content-Type', 'audio/mp3');
        res.send(audioBuffer);

    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 