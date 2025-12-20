// Web Speech API utilities

class SpeechService {
    constructor() {
        this.recognition = null;
        this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
        this.isListening = false;
    }

    // Initialize Speech Recognition
    initRecognition(language = 'en-US') {
        if (typeof window === 'undefined') {
            console.error('Speech recognition not available on server');
            return null;
        }

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported');
            return null;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = language;

        return this.recognition;
    }

    // Start listening
    startListening(onResult, onError) {
        if (!this.recognition) {
            this.initRecognition();
        }

        if (!this.recognition) {
            onError?.('Speech recognition not supported in this browser');
            return;
        }

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        this.recognition.onerror = (event) => {
            onError?.(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };

        try {
            this.recognition.start();
            this.isListening = true;
        } catch (error) {
            console.error('Error starting recognition:', error);
            onError?.(error.message);
        }
    }

    // Stop listening
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    // Text to Speech
    speak(text, options = {}) {
        if (!this.synthesis) {
            console.error('Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Set options
        utterance.lang = options.lang || 'en-US';
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        // Select voice if specified
        if (options.voiceName) {
            const voices = this.synthesis.getVoices();
            const selectedVoice = voices.find(voice => voice.name === options.voiceName);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        // Callbacks
        if (options.onEnd) {
            utterance.onend = options.onEnd;
        }
        if (options.onError) {
            utterance.onerror = options.onError;
        }

        this.synthesis.speak(utterance);
    }

    // Stop speaking
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    // Get available voices
    getVoices() {
        if (!this.synthesis) return [];
        return this.synthesis.getVoices();
    }

    // Get voices for a specific language
    getVoicesForLanguage(lang) {
        const voices = this.getVoices();
        return voices.filter(voice => voice.lang.startsWith(lang));
    }
}

// Singleton instance
const speechService = new SpeechService();

export default speechService;
