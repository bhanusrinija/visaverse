'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { cultureAPI } from '@/lib/api';
import { offlineCultureData } from '@/lib/offlineData';

export default function CultureGuide({ country }) {
    const [guide, setGuide] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        loadGuide();
    }, [country]);

    const loadGuide = async () => {
        setIsLoading(true);

        // Try offline data first for common countries
        if (offlineCultureData[country]) {
            setGuide(offlineCultureData[country]);
            setIsOffline(true);
            setIsLoading(false);
            return;
        }

        // Try API if not in offline data
        try {
            const guideData = await cultureAPI.getGuide(country);
            setGuide(guideData);
            setIsOffline(false);
        } catch (error) {
            console.error('Error loading culture guide:', error);
            // Fallback to Germany if available
            if (offlineCultureData['Germany']) {
                setGuide(offlineCultureData['Germany']);
                setIsOffline(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="glass-card p-12 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="glass-card p-6">
                <p className="text-gray-700">Failed to load cultural guide. Please try again.</p>
                <button onClick={loadGuide} className="glass-button mt-4">Retry</button>
            </div>
        );
    }

    const categoryIcons = {
        'Greetings': '👋',
        'Workplace': '💼',
        'Dress': '👔',
        'Public': '🚶',
        'Tipping': '💵',
        'Religious': '🕌'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="w-8 h-8 text-primary-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Cultural Intelligence Guide</h2>
                        {isOffline && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1 inline-block">
                                ✓ Offline Mode
                            </span>
                        )}
                    </div>
                </div>
                <p className="text-gray-700">Essential cultural insights for {guide.country}</p>
            </div>

            {/* General Advice */}
            <div className="glass-card p-6 bg-gradient-to-r from-primary-100 to-accent-100 border border-primary-300">
                <h3 className="text-lg font-semibold mb-3 text-accent-700">💡 General Advice</h3>
                <p className="text-gray-700 leading-relaxed">{guide.general_advice}</p>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guide.categories.map((category, idx) => {
                    const icon = Object.keys(categoryIcons).find(key =>
                        category.category.includes(key)
                    );

                    return (
                        <div key={idx} className="glass-card p-6 card-hover">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span className="text-2xl">{categoryIcons[icon] || '📚'}</span>
                                <span className="text-primary-600">{category.category}</span>
                            </h3>
                            <ul className="space-y-3">
                                {category.tips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                        <span className="text-accent-600 flex-shrink-0">•</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Pro Tip */}
            <div className="glass-card p-6 bg-gradient-to-r from-accent-100 to-primary-100 border border-accent-300">
                <h3 className="text-lg font-semibold mb-3 text-primary-700">🌟 Pro Tip</h3>
                <p className="text-gray-700">
                    When in doubt, observe how locals behave and follow their lead. Most people appreciate
                    when newcomers make an effort to respect local customs, even if you make small mistakes.
                </p>
            </div>
        </div>
    );
}
