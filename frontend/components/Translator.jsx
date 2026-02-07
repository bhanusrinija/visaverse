'use client';

import { useState, useEffect } from 'react';
import { Languages, Volume2, Loader2, WifiOff, Mic, MicOff } from 'lucide-react';
import { languageAPI } from '@/lib/api';
import speechService from '@/lib/speech';
import { getLanguageForCountry } from '@/lib/countryUtils';

export default function Translator({ relocationData }) {
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Auto-detect languages from countries
    const homeLanguage = getLanguageForCountry(relocationData.homeCountry);
    const destLanguage = getLanguageForCountry(relocationData.destinationCountry);

    const [sourceLang, setSourceLang] = useState(homeLanguage);
    const [targetLang, setTargetLang] = useState(destLanguage);
    const [isOffline, setIsOffline] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Update languages when countries change
    useEffect(() => {
        const home = getLanguageForCountry(relocationData.homeCountry);
        const dest = getLanguageForCountry(relocationData.destinationCountry);
        setSourceLang(home);
        setTargetLang(dest);
    }, [relocationData.homeCountry, relocationData.destinationCountry]);

    const handleVoiceInput = () => {
        if (isListening) {
            speechService.stopListening();
            setIsListening(false);
        } else {
            setIsListening(true);
            speechService.startListening((transcript) => {
                setSourceText(transcript);
                setIsListening(false);
            }, (error) => {
                console.error('Voice input error:', error);
                setIsListening(false);
            });
        }
    };

    const handleTranslate = async () => {
        if (!sourceText.trim()) return;

        setIsLoading(true);
        setIsOffline(false);

        try {
            const response = await languageAPI.translate(sourceText, sourceLang, targetLang);
            setTranslatedText(response.translated_text);
        } catch (error) {
            console.error('Translation error:', error);
            setIsOffline(true);
            setTranslatedText('Offline Mode: Translation requires internet connection.\n\nYour text: "' + sourceText + '"\n\nPlease use the Language tab for offline essential phrases, or connect to internet for real-time translation.');
        } finally {
            setIsLoading(false);
        }
    };

    const speakTranslation = () => {
        if (translatedText && !isOffline) {
            const langCode = targetLang === 'German' ? 'de-DE' :
                targetLang === 'Spanish' ? 'es-ES' :
                    targetLang === 'French' ? 'fr-FR' :
                        targetLang === 'Japanese' ? 'ja-JP' :
                            targetLang === 'Chinese' ? 'zh-CN' :
                                targetLang === 'Hindi' ? 'hi-IN' :
                                    targetLang === 'Telugu' ? 'te-IN' : 'en-US';

            speechService.speak(translatedText, { lang: langCode });
        }
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Languages className="w-8 h-8 text-primary-400" />
                    <div>
                        <h2 className="text-2xl font-bold">Real-Time Translator</h2>
                        <p className="text-xs text-white/60 mt-1">
                            {sourceLang} → {targetLang} (Auto-detected)
                        </p>
                        {isOffline && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded mt-1 inline-block flex items-center gap-1">
                                <WifiOff className="w-3 h-3" />
                                Requires Internet
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source */}
                <div>
                    <label className="block text-sm font-medium mb-2">From</label>
                    <select
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value)}
                        className="input-glass w-full mb-3"
                    >
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Telugu</option>
                        <option>Bengali</option>
                        <option>Marathi</option>
                        <option>Tamil</option>
                        <option>Gujarati</option>
                        <option>Urdu</option>
                        <option>Kannada</option>
                        <option>Odia</option>
                        <option>Malayalam</option>
                        <option>Punjabi</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                    </select>
                    <textarea
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        placeholder="Enter text to translate or click the mic to speak..."
                        className="input-glass w-full h-40 resize-none"
                    />
                    <button
                        onClick={handleVoiceInput}
                        className={`mt-2 px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isListening
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-primary-500 hover:bg-primary-600'
                            }`}
                    >
                        {isListening ? (
                            <>
                                <MicOff className="w-5 h-5" />
                                <span>Stop Listening</span>
                            </>
                        ) : (
                            <>
                                <Mic className="w-5 h-5" />
                                <span>Voice Input</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Target */}
                <div>
                    <label className="block text-sm font-medium mb-2">To</label>
                    <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="input-glass w-full mb-3"
                    >
                        <option>Hindi</option>
                        <option>Telugu</option>
                        <option>Bengali</option>
                        <option>Marathi</option>
                        <option>Tamil</option>
                        <option>Gujarati</option>
                        <option>Urdu</option>
                        <option>Kannada</option>
                        <option>Odia</option>
                        <option>Malayalam</option>
                        <option>Punjabi</option>
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Japanese</option>
                        <option>Chinese</option>
                    </select>
                    <div className="input-glass w-full h-40 overflow-y-auto relative">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                            </div>
                        ) : (
                            <p className="text-white/90 whitespace-pre-wrap">{translatedText || 'Translation will appear here...'}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    onClick={handleTranslate}
                    className="glass-button flex-1"
                    disabled={isLoading || !sourceText.trim()}
                >
                    {isLoading ? 'Translating...' : 'Translate'}
                </button>
                <button
                    onClick={speakTranslation}
                    className="glass-button px-6"
                    disabled={!translatedText || isOffline}
                >
                    <Volume2 className="w-5 h-5" />
                </button>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <p className="text-sm text-white/70">
                    <strong>Tip:</strong> Click the speaker icon to hear the translation pronounced correctly!
                </p>
            </div>
        </div>
    );
}
