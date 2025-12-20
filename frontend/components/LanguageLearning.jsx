'use client';

import { useState, useEffect } from 'react';
import { Languages, Volume2, Loader2 } from 'lucide-react';
import { languageAPI } from '@/lib/api';
import speechService from '@/lib/speech';
import { offlineLanguageData } from '@/lib/offlineData';
import { getLanguageForCountry, allLanguages, formatDuration } from '@/lib/countryUtils';

export default function LanguageLearning({ relocationData }) {
    const [phrases, setPhrases] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Auto-detect language from destination country
    const defaultLanguage = getLanguageForCountry(relocationData.destinationCountry);
    const [language, setLanguage] = useState(defaultLanguage);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        // Update language when destination country changes
        const detectedLang = getLanguageForCountry(relocationData.destinationCountry);
        setLanguage(detectedLang);
    }, [relocationData.destinationCountry]);

    useEffect(() => {
        loadPhrases();
    }, [language]);

    const loadPhrases = async () => {
        setIsLoading(true);

        // Try to use offline data first
        if (offlineLanguageData[language]) {
            setPhrases({
                language: language,
                country: offlineLanguageData[language].country,
                categories: offlineLanguageData[language].categories
            });
            setIsOffline(true);
            setIsLoading(false);
            return;
        }

        // If not in offline data, try API
        try {
            const phrasesData = await languageAPI.getPhrases(relocationData.destinationCountry, language);
            setPhrases(phrasesData);
            setIsOffline(false);
        } catch (error) {
            console.error('Error loading phrases:', error);
            // Fallback to offline data for German if API fails
            if (offlineLanguageData['German']) {
                setPhrases({
                    language: 'German',
                    country: 'Germany',
                    categories: offlineLanguageData['German'].categories
                });
                setIsOffline(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const speakPhrase = (phrase, lang) => {
        // Determine language code based on the selected language
        let langCode = 'en-US';

        if (lang.toLowerCase().includes('german')) langCode = 'de-DE';
        else if (lang.toLowerCase().includes('spanish')) langCode = 'es-ES';
        else if (lang.toLowerCase().includes('french')) langCode = 'fr-FR';
        else if (lang.toLowerCase().includes('japanese')) langCode = 'ja-JP';
        else if (lang.toLowerCase().includes('chinese')) langCode = 'zh-CN';
        else if (lang.toLowerCase().includes('hindi')) langCode = 'hi-IN';
        else if (lang.toLowerCase().includes('arabic')) langCode = 'ar-SA';
        else if (lang.toLowerCase().includes('italian')) langCode = 'it-IT';
        else if (lang.toLowerCase().includes('portuguese')) langCode = 'pt-PT';
        else if (lang.toLowerCase().includes('russian')) langCode = 'ru-RU';

        // Speak the local language phrase (not English)
        speechService.speak(phrase.local, { lang: langCode });
    };

    if (isLoading) {
        return (
            <div className="glass-card p-12 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Languages className="w-8 h-8 text-primary-600" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Essential Phrases</h2>
                            {isOffline && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1 inline-block">
                                    ✓ Offline Mode
                                </span>
                            )}
                        </div>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="input-glass"
                    >
                        {allLanguages.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>
                <p className="text-gray-700">
                    Learn essential daily-use phrases for {phrases?.language || language}
                </p>
                {relocationData.durationDays && (
                    <p className="text-sm text-primary-600 mt-2">
                        📅 Duration: {formatDuration(relocationData.durationDays)}
                    </p>
                )}
            </div>

            {/* Phrase Categories */}
            {phrases && phrases.categories && phrases.categories.map((category, idx) => (
                <div key={idx} className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4 text-accent-600">{category.category}</h3>
                    <div className="space-y-3">
                        {category.phrases.map((phrase, i) => (
                            <div key={i} className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-all border border-gray-300">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="text-gray-800 font-medium mb-1">{phrase.english}</p>
                                        <p className="text-primary-600 text-lg font-semibold mb-1">{phrase.local}</p>
                                        {phrase.pronunciation && (
                                            <p className="text-gray-600 text-sm italic">({phrase.pronunciation})</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => speakPhrase(phrase, language)}
                                        className="p-2 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 hover:shadow-lg transition-all ml-4 text-white"
                                    >
                                        <Volume2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Learning Tips */}
            <div className="glass-card p-6 bg-gradient-to-r from-primary-100 to-accent-100 border border-primary-300">
                <h3 className="text-lg font-semibold mb-3 text-primary-700">📚 Learning Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-accent-600">•</span>
                        <span>Practice pronunciation by clicking the speaker icon</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-accent-600">•</span>
                        <span>Start with greetings and emergency phrases</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-accent-600">•</span>
                        <span>Use the translator tab for custom phrases</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-accent-600">•</span>
                        <span>Locals appreciate when you try to speak their language!</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
