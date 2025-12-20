'use client';

import { useState, useEffect } from 'react';
import { Home, MapPin, DollarSign, Users, Star, AlertTriangle, CheckCircle2, Loader2, X, Wifi, Coffee, Dumbbell, Utensils, Car, Clock, Navigation } from 'lucide-react';
import SaveablePlanWrapper from './SaveablePlanWrapper';

export default function AccommodationFinder({ relocationData }) {
    const [userType, setUserType] = useState('traveler');
    const [city, setCity] = useState('');
    const [budgetMin, setBudgetMin] = useState(50);
    const [budgetMax, setBudgetMax] = useState(200);
    const [durationDays, setDurationDays] = useState(7);
    const [preferences, setPreferences] = useState([]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load cached results
    useEffect(() => {
        const cacheKey = `accommodation_${relocationData.destinationCountry}_${userType}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setResults(parsed.results);
                setCity(parsed.city || '');
                setBudgetMin(parsed.budgetMin || 50);
                setBudgetMax(parsed.budgetMax || 200);
                setPreferences(parsed.preferences || []);
            } catch (e) {
                console.error('Error loading cached results:', e);
            }
        }
    }, [relocationData, userType]);

    const availablePreferences = [
        'vegetarian',
        'quiet',
        'near_university',
        'near_transport',
        'student_community',
        'wifi',
        'kitchen',
        'gym'
    ];

    const togglePreference = (pref) => {
        setPreferences(prev =>
            prev.includes(pref)
                ? prev.filter(p => p !== pref)
                : [...prev, pref]
        );
    };

    const searchAccommodation = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = userType === 'student'
                ? '/api/accommodation/students'
                : '/api/accommodation/travelers';

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination_country: relocationData.destinationCountry,
                    city: city || relocationData.destinationCountry,
                    user_type: userType,
                    budget_min: budgetMin,
                    budget_max: budgetMax,
                    duration_days: durationDays,
                    preferences: preferences
                })
            });
            const data = await response.json();
            setResults(data);

            // Cache results
            const cacheKey = `accommodation_${relocationData.destinationCountry}_${userType}`;
            localStorage.setItem(cacheKey, JSON.stringify({
                results: data,
                city,
                budgetMin,
                budgetMax,
                preferences
            }));
        } catch (err) {
            setError('Failed to fetch accommodation recommendations');
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setResults(null);
        const cacheKey = `accommodation_${relocationData.destinationCountry}_${userType}`;
        localStorage.removeItem(cacheKey);
    };

    const getCompatibilityColor = (score) => {
        if (score >= 80) return 'text-success-600 bg-success-100';
        if (score >= 60) return 'text-warning-600 bg-warning-100';
        return 'text-danger-600 bg-danger-100';
    };

    return (
        <SaveablePlanWrapper
            planType="accommodation"
            planData={results}
            relocationData={relocationData}
        >
            <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Home className="w-8 h-8 text-primary-600" />
                        <h2 className="text-3xl font-bold text-gray-800">Accommodation Finder</h2>
                    </div>
                    {results && (
                        <button
                            onClick={clearResults}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>

                {/* User Type Toggle */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setUserType('traveler')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                            userType === 'traveler'
                                ? 'bg-gradient-to-r from-primary-400 to-accent-400 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Traveler
                    </button>
                    <button
                        onClick={() => setUserType('student')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                            userType === 'student'
                                ? 'bg-gradient-to-r from-primary-400 to-accent-400 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Student
                    </button>
                </div>

                {/* Search Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            City (optional)
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder={`e.g., capital of ${relocationData.destinationCountry}`}
                            className="input-glass w-full"
                        />
                    </div>

                    {userType === 'traveler' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (days)
                            </label>
                            <input
                                type="number"
                                value={durationDays}
                                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                                min="1"
                                className="input-glass w-full"
                            />
                        </div>
                    )}
                </div>

                {/* Budget Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Budget Range (per night): ${budgetMin} - ${budgetMax}
                    </label>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="range"
                                min="10"
                                max="500"
                                value={budgetMin}
                                onChange={(e) => setBudgetMin(parseInt(e.target.value))}
                                className="w-full accent-primary-500"
                            />
                            <span className="text-xs text-gray-600">Min: ${budgetMin}</span>
                        </div>
                        <div className="flex-1">
                            <input
                                type="range"
                                min="10"
                                max="500"
                                value={budgetMax}
                                onChange={(e) => setBudgetMax(parseInt(e.target.value))}
                                className="w-full accent-accent-500"
                            />
                            <span className="text-xs text-gray-600">Max: ${budgetMax}</span>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Users className="w-4 h-4 inline mr-1" />
                        Preferences
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {availablePreferences.map(pref => (
                            <button
                                key={pref}
                                onClick={() => togglePreference(pref)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    preferences.includes(pref)
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {pref.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={searchAccommodation}
                    disabled={loading}
                    className="glass-button w-full flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Searching...
                        </>
                    ) : (
                        'Find Accommodation'
                    )}
                </button>

                {/* Error */}
                {error && (
                    <div className="bg-danger-100 border border-danger-300 rounded-lg p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-danger-600" />
                        <p className="text-danger-700">{error}</p>
                    </div>
                )}

                {/* Results */}
                {results && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Safety Info */}
                        <div className="bg-primary-100 border border-primary-300 rounded-lg p-4">
                            <h3 className="text-lg font-bold text-primary-700 mb-2">Safety Information</h3>
                            <p className="text-gray-700">{results.area_safety_info}</p>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-800">Recommended Options</h3>
                            {results.recommendations?.map((option, idx) => (
                                <div key={idx} className="glass-card p-5 card-hover border-2 border-primary-200">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-xl font-bold text-gray-800">{option.name}</h4>
                                                {option.star_rating && (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-yellow-500" />
                                                        {option.star_rating}
                                                    </span>
                                                )}
                                                {option.best_for && (
                                                    <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded-lg text-xs font-bold">
                                                        {option.best_for}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-accent-600 font-medium mb-1">{option.type} in {option.area}</p>
                                            {option.distance_from_center && (
                                                <p className="text-gray-600 text-sm flex items-center gap-1">
                                                    <Navigation className="w-3 h-3" />
                                                    {option.distance_from_center}
                                                </p>
                                            )}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getCompatibilityColor(option.cultural_compatibility_score)}`}>
                                            <Star className="w-3 h-3 inline mr-1" />
                                            {option.cultural_compatibility_score}%
                                        </div>
                                    </div>

                                    {/* Price and Check-in/out Times */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 bg-gradient-to-r from-success-50 to-primary-50 p-4 rounded-lg border border-success-200">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600 mb-1">Price Range</p>
                                            <p className="text-lg font-bold text-success-700">{option.price_range}</p>
                                        </div>
                                        {option.cost_per_night && (
                                            <div className="text-center">
                                                <p className="text-xs text-gray-600 mb-1">Average Per Night</p>
                                                <p className="text-lg font-bold text-primary-700">{option.cost_per_night}</p>
                                            </div>
                                        )}
                                        {(option.check_in_time || option.check_out_time) && (
                                            <div className="text-center">
                                                <p className="text-xs text-gray-600 mb-1">
                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                    Check Times
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    {option.check_in_time && `In: ${option.check_in_time}`}
                                                    {option.check_in_time && option.check_out_time && ' | '}
                                                    {option.check_out_time && `Out: ${option.check_out_time}`}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Amenities */}
                                    {option.amenities && option.amenities.length > 0 && (
                                        <div className="mb-4">
                                            <h5 className="text-sm font-semibold text-primary-600 mb-2 flex items-center gap-1">
                                                <Home className="w-4 h-4" />
                                                Amenities
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                                {option.amenities.map((amenity, i) => (
                                                    <span key={i} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                        {amenity.toLowerCase().includes('wifi') && <Wifi className="w-3 h-3" />}
                                                        {amenity.toLowerCase().includes('breakfast') && <Coffee className="w-3 h-3" />}
                                                        {amenity.toLowerCase().includes('gym') && <Dumbbell className="w-3 h-3" />}
                                                        {amenity.toLowerCase().includes('parking') && <Car className="w-3 h-3" />}
                                                        {amenity.toLowerCase().includes('restaurant') && <Utensils className="w-3 h-3" />}
                                                        {amenity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nearby Attractions */}
                                    {option.nearby_attractions && option.nearby_attractions.length > 0 && (
                                        <div className="mb-4">
                                            <h5 className="text-sm font-semibold text-accent-600 mb-2 flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                Nearby Attractions
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                                {option.nearby_attractions.map((attraction, i) => (
                                                    <span key={i} className="px-3 py-1 bg-accent-100 text-accent-700 rounded-lg text-xs">
                                                        {attraction}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Public Transport */}
                                    {option.public_transport_access && (
                                        <div className="mb-4 bg-info-50 border border-info-200 rounded-lg p-3">
                                            <h5 className="text-sm font-semibold text-info-700 mb-1 flex items-center gap-1">
                                                <Navigation className="w-4 h-4" />
                                                Public Transport
                                            </h5>
                                            <p className="text-sm text-gray-700">{option.public_transport_access}</p>
                                        </div>
                                    )}

                                    {/* Pros and Cons */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <h5 className="text-sm font-semibold text-success-600 mb-2">Pros</h5>
                                            <ul className="space-y-1">
                                                {option.pros?.map((pro, i) => (
                                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                                                        {pro}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-semibold text-warning-600 mb-2">Cons</h5>
                                            <ul className="space-y-1">
                                                {option.cons?.map((con, i) => (
                                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                        <AlertTriangle className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
                                                        {con}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Warnings */}
                                    {option.warnings && option.warnings.length > 0 && (
                                        <div className="mt-4 bg-danger-100 border border-danger-300 rounded p-3">
                                            <h5 className="text-sm font-semibold text-danger-700 mb-2 flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                Warnings
                                            </h5>
                                            <ul className="space-y-1">
                                                {option.warnings.map((warning, i) => (
                                                    <li key={i} className="text-sm text-danger-700">{warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Compatibility Reasons */}
                                    {option.compatibility_reasons && option.compatibility_reasons.length > 0 && (
                                        <div className="mt-4">
                                            <h5 className="text-sm font-semibold text-primary-600 mb-2">Why This Matches You</h5>
                                            <ul className="space-y-1">
                                                {option.compatibility_reasons.map((reason, i) => (
                                                    <li key={i} className="text-sm text-gray-700">• {reason}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* General Tips */}
                        {results.general_tips && results.general_tips.length > 0 && (
                            <div className="glass-card p-4 bg-accent-100">
                                <h3 className="text-lg font-bold text-accent-700 mb-3">General Tips</h3>
                                <ul className="space-y-2">
                                    {results.general_tips.map((tip, idx) => (
                                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Scam Warnings */}
                        {results.scam_warnings && results.scam_warnings.length > 0 && (
                            <div className="glass-card p-4 bg-danger-100 border-danger-300">
                                <h3 className="text-lg font-bold text-danger-700 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Scam Warnings
                                </h3>
                                <ul className="space-y-2">
                                    {results.scam_warnings.map((warning, idx) => (
                                        <li key={idx} className="text-danger-700">{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </SaveablePlanWrapper>
    );
}
