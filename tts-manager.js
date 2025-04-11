/**
 * Google Text-to-Speech Manager
 * Handles text-to-speech functionality with Google TTS API and browser fallback
 */
class GoogleTTSManager {
    constructor() {
        this.apiKey = GoogleTTSManager.API_KEY;
        console.log('TTS Manager initialized with API key:', {
            length: this.apiKey ? this.apiKey.length : 0,
            firstChars: this.apiKey ? this.apiKey.substring(0, 6) : 'none',
            timestamp: new Date().toISOString()
        });
        this.audioContext = null;
        this.audioQueue = [];
        this.isPlaying = false;
    }

    // This will be replaced during build
    static API_KEY = '%%GOOGLE_TTS_API_KEY%%';

    /**
     * Speak the given text using Google TTS API with browser fallback
     * @param {string} text - The text to speak
     * @param {string} lang - The language code (default: 'en-US')
     * @param {string} voice - The voice name (optional)
     */
    speak(text, lang = 'en-US', voice = null) {
        console.log('speak called with:', { 
            textLength: text ? text.length : 0, 
            lang, 
            voice,
            apiKeyLength: this.apiKey ? this.apiKey.length : 0,
            apiKeyStart: this.apiKey ? this.apiKey.substring(0, 6) : 'none'
        });
        if (!text) return;

        // Try Google TTS first, fall back to browser TTS if needed
        this.speakWithGoogleTTS(text, lang, voice)
            .catch(error => {
                console.error('Detailed Google TTS error:', {
                    message: error.message,
                    apiKeyExists: !!this.apiKey,
                    apiKeyLength: this.apiKey ? this.apiKey.length : 0,
                    apiKeyStart: this.apiKey ? this.apiKey.substring(0, 6) : 'none'
                });
                this.speakWithBrowserTTS(text, lang, voice);
            });
    }

    /**
     * Speak using Google Text-to-Speech API
     * @param {string} text - The text to speak
     * @param {string} lang - The language code
     * @param {string} voice - The voice name (optional)
     * @returns {Promise} - Resolves when audio is loaded and ready to play
     */
    speakWithGoogleTTS(text, lang, voice) {
        return new Promise((resolve, reject) => {
            console.log('speakWithGoogleTTS called with:', {
                textLength: text ? text.length : 0,
                lang,
                voice,
                apiKeyExists: !!this.apiKey,
                apiKeyLength: this.apiKey ? this.apiKey.length : 0
            });

            // Check if API key is available and not empty
            if (!this.apiKey) {
                console.error('API key validation failed:', {
                    apiKeyExists: !!this.apiKey,
                    apiKeyLength: this.apiKey ? this.apiKey.length : 0
                });
                reject(new Error('Google TTS API key not configured'));
                return;
            }

            const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
            console.log('Making request to URL:', url.replace(this.apiKey, '[REDACTED]'));
            
            // Determine voice parameters
            let voiceConfig = {};
            if (voice) {
                voiceConfig = {
                    name: voice,
                    languageCode: lang
                };
            } else {
                // Default to a standard voice for the language
                voiceConfig = {
                    languageCode: lang
                };
            }

            // Prepare the request body
            const requestBody = {
                input: { text },
                voice: voiceConfig,
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: 1.0,
                    pitch: 0
                }
            };

            // Make the API request
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Google TTS API error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Decode the base64 audio content
                const audioContent = data.audioContent;
                const audioData = this.base64ToArrayBuffer(audioContent);
                
                // Create an audio element and play it
                this.playAudioData(audioData);
                resolve();
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    /**
     * Speak using browser's built-in speech synthesis
     * @param {string} text - The text to speak
     * @param {string} lang - The language code
     * @param {string} voice - The voice name (optional)
     */
    speakWithBrowserTTS(text, lang, voice) {
        // Cancel any ongoing speech
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        // Create a new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        
        // Set voice if specified
        if (voice) {
            const voices = window.speechSynthesis.getVoices();
            const selectedVoice = voices.find(v => v.name === voice);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        // Speak the text
        window.speechSynthesis.speak(utterance);
    }

    /**
     * Play audio data from a buffer
     * @param {ArrayBuffer} audioData - The audio data to play
     */
    async playAudioData(audioData) {
        try {
            // Create audio context if it doesn't exist
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Resume the audio context if it's suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Decode the audio data
            this.audioContext.decodeAudioData(audioData, 
                (buffer) => {
                    // Add to queue
                    this.audioQueue.push(buffer);
                    
                    // Start playing if not already playing
                    if (!this.isPlaying) {
                        this.playNextInQueue();
                    }
                },
                (error) => {
                    console.error('Error decoding audio data:', error);
                }
            );
        } catch (error) {
            console.error('Error playing audio:', error);
            // Fall back to browser TTS if there's an error
            this.speakWithBrowserTTS(text);
        }
    }

    /**
     * Play the next audio buffer in the queue
     */
    playNextInQueue() {
        if (this.audioQueue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const buffer = this.audioQueue.shift();
        
        // Create source and connect to destination
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        
        // Play the audio
        source.start(0);
        
        // When finished, play the next item in the queue
        source.onended = () => {
            this.playNextInQueue();
        };
    }

    /**
     * Convert base64 string to ArrayBuffer
     * @param {string} base64 - The base64 string to convert
     * @returns {ArrayBuffer} - The converted ArrayBuffer
     */
    base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
} 