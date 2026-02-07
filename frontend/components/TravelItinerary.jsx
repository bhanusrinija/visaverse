'use client';

import { useState, useEffect } from 'react';
import { Map, MapPin, Calendar, DollarSign, Heart, TrendingUp, Loader2, AlertTriangle, X, Star } from 'lucide-react';
import SaveablePlanWrapper from './SaveablePlanWrapper';

export default function TravelItinerary({ relocationData }) {
    const [city, setCity] = useState('');
    const [durationDays, setDurationDays] = useState(5);
    const [totalBudget, setTotalBudget] = useState(1000);
    const [travelStyle, setTravelStyle] = useState('moderate');
    const [interests, setInterests] = useState([]);
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const availableInterests = [
        'culture',
        'food',
        'nature',
        'history',
        'adventure',
        'shopping',
        'nightlife',
        'art',
        'architecture',
        'photography'
    ];

    const [activeLocation, setActiveLocation] = useState('');

    // Auto-scroll to map when activeLocation changes
    useEffect(() => {
        if (activeLocation) {
            const mapElement = document.getElementById('itinerary-map');
            if (mapElement) {
                mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeLocation]);

    // Load cached itinerary
    useEffect(() => {
        const cacheKey = `itinerary_${relocationData.destinationCountry}_${travelStyle}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            setItinerary(parsed.itinerary);
            setCity(parsed.city || '');
            setDurationDays(parsed.durationDays || 5);
            setTotalBudget(parsed.totalBudget || 1000);
            setTravelStyle(parsed.travelStyle || 'moderate');
            setInterests(parsed.interests || []);
        }
    }, [relocationData]);

    const toggleInterest = (interest) => {
        setInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const generateItinerary = async () => {
        setLoading(true);
        setError(null);
        setActiveLocation('');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itinerary/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination_country: relocationData.destinationCountry,
                    city: city || relocationData.destinationCountry,
                    duration_days: durationDays,
                    total_budget: totalBudget,
                    travel_style: travelStyle,
                    interests: interests
                })
            });
            const data = await response.json();
            setItinerary(data);

            // Cache the results
            const cacheKey = `itinerary_${relocationData.destinationCountry}_${travelStyle}`;
            localStorage.setItem(cacheKey, JSON.stringify({
                itinerary: data,
                city,
                durationDays,
                totalBudget,
                travelStyle,
                interests
            }));
        } catch (err) {
            setError('Failed to generate itinerary');
        } finally {
            setLoading(false);
        }
    };

    const clearItinerary = () => {
        setItinerary(null);
        setActiveLocation('');
        const cacheKey = `itinerary_${relocationData.destinationCountry}_${travelStyle}`;
        localStorage.removeItem(cacheKey);
    };

    return (
        <SaveablePlanWrapper
            planType="itinerary"
            planData={itinerary}
            relocationData={relocationData}
        >
            <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Map className="w-8 h-8 text-success-600" />
                        <h2 className="text-3xl font-bold text-gray-800">Travel Itinerary Planner</h2>
                    </div>
                    {itinerary && (
                        <button
                            onClick={clearItinerary}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all text-sm font-medium"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>

                {/* Input Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder={`e.g., capital of ${relocationData.destinationCountry}`}
                            className="input-glass w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                        <input
                            type="number"
                            value={durationDays}
                            onChange={(e) => setDurationDays(parseInt(e.target.value))}
                            min="1"
                            max="30"
                            className="input-glass w-full"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Total Budget: ${totalBudget}
                    </label>
                    <input
                        type="range"
                        min="100"
                        max="10000"
                        step="100"
                        value={totalBudget}
                        onChange={(e) => setTotalBudget(parseInt(e.target.value))}
                        className="w-full accent-success-500"
                    />
                </div>

                {/* Travel Style */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Travel Style</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['relaxed', 'moderate', 'packed'].map(style => (
                            <button
                                key={style}
                                onClick={() => setTravelStyle(style)}
                                className={`py-3 px-4 rounded-lg font-semibold capitalize transition-all ${travelStyle === style
                                    ? 'bg-gradient-to-r from-success-500 to-primary-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Interests */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Heart className="w-4 h-4 inline mr-1" />
                        Interests
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {availableInterests.map(interest => (
                            <button
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${interests.includes(interest)
                                    ? 'bg-accent-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {interest}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={generateItinerary}
                    disabled={loading}
                    className="glass-button w-full flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating Itinerary...
                        </>
                    ) : (
                        itinerary ? 'Regenerate Itinerary' : 'Generate Itinerary'
                    )}
                </button>

                {error && (
                    <div className="bg-danger-100 border border-danger-300 rounded-lg p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-danger-600" />
                        <p className="text-danger-700">{error}</p>
                    </div>
                )}

                {/* Itinerary Results */}
                {itinerary && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Map Preview */}
                        <div id="itinerary-map" className="glass-card p-0 overflow-hidden h-96 relative border-2 border-primary-200">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                src={`https://maps.google.com/maps?q=${encodeURIComponent((activeLocation ? activeLocation + ', ' : '') + (city || relocationData.destinationCountry))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                title="Destination Map"
                            ></iframe>
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-primary-200">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current View</p>
                                <p className="text-sm font-bold text-primary-800 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-danger-500 animate-bounce" />
                                    {activeLocation || city || relocationData.destinationCountry}
                                </p>
                            </div>
                            {activeLocation && (
                                <button
                                    onClick={() => setActiveLocation('')}
                                    className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-full text-xs font-bold text-primary-600 shadow-lg border border-primary-200 hover:bg-primary-50 transition-all"
                                >
                                    Reset to City
                                </button>
                            )}
                        </div>

                        {/* Budget Breakdown */}
                        <div className="glass-card p-5">
                            <h3 className="text-xl font-bold text-success-600 mb-4 flex items-center gap-2">
                                <DollarSign className="w-6 h-6" />
                                Budget Breakdown
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="bg-gray-100 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-600 mb-1">Accommodation</p>
                                    <p className="text-lg font-bold text-primary-600">${itinerary.budget_breakdown?.accommodation}</p>
                                </div>
                                <div className="bg-gray-100 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-600 mb-1">Food</p>
                                    <p className="text-lg font-bold text-warning-600">${itinerary.budget_breakdown?.food}</p>
                                </div>
                                <div className="bg-gray-100 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-600 mb-1">Transport</p>
                                    <p className="text-lg font-bold text-accent-600">${itinerary.budget_breakdown?.transport}</p>
                                </div>
                                <div className="bg-gray-100 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-600 mb-1">Attractions</p>
                                    <p className="text-lg font-bold text-success-600">${itinerary.budget_breakdown?.attractions}</p>
                                </div>
                                <div className="bg-gray-100 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-600 mb-1">Buffer</p>
                                    <p className="text-lg font-bold text-danger-600">${itinerary.budget_breakdown?.buffer}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-300">
                                <p className="text-sm text-gray-700">Total Estimated Cost:</p>
                                <p className="text-3xl font-bold text-success-600">${itinerary.total_estimated_cost}</p>
                            </div>
                        </div>

                        {/* Cost Justification */}
                        <div className="glass-card p-4 bg-primary-100 border border-primary-300">
                            <h4 className="text-sm font-semibold text-primary-700 mb-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Budget Analysis
                            </h4>
                            <p className="text-gray-700 text-sm">{itinerary.cost_justification}</p>
                        </div>

                        {/* Daily Plans */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-accent-600" />
                                Day-by-Day Itinerary
                            </h3>
                            {itinerary.daily_plans?.map((day) => (
                                <div key={day.day_number} className="glass-card p-5 card-hover">
                                    <div className="flex items-start justify-between mb-4">
                                        <h4 className="text-lg font-bold text-accent-600">Day {day.day_number}</h4>
                                        <span className="px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm font-semibold">
                                            Approx. ${day.estimated_cost}
                                        </span>
                                    </div>
                                    <div className="space-y-3 mb-4">
                                        {day.activities?.map((activity, idx) => (
                                            <div key={idx} className="flex flex-col gap-1 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-primary-300 transition-all group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold bg-primary-100 text-primary-600 px-2 py-0.5 rounded uppercase tracking-wider">{activity.time || "N/A"}</span>
                                                        <p className="text-sm font-bold text-gray-800">{activity.task || activity}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {activity.rating && (
                                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                                <span className="text-[10px] font-bold text-yellow-700">{activity.rating}</span>
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={() => setActiveLocation(activity.location || activity)}
                                                            className="text-primary-500 hover:text-primary-700 p-1.5 rounded-full hover:bg-primary-50 transition-all opacity-0 group-hover:opacity-100"
                                                            title="View on Map"
                                                        >
                                                            <MapPin className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {activity.description && (
                                                    <p className="text-xs text-gray-600 ml-16 mt-0.5 italic">"{activity.description}"</p>
                                                )}
                                                {activity.location && (
                                                    <div className="flex items-center justify-between ml-16 mt-1">
                                                        <p className="text-xs text-primary-600 flex items-center gap-1 font-medium">
                                                            <MapPin className="w-3 h-3" />
                                                            {activity.location}
                                                        </p>
                                                        <a
                                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activity.location)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-accent-600 hover:underline flex items-center gap-1 font-bold"
                                                        >
                                                            Get Directions
                                                            <ChevronRight className="w-2.5 h-2.5" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {day.tips && day.tips.length > 0 && (
                                        <div className="bg-gray-100 rounded-lg p-3 mt-3 border border-gray-300">
                                            <p className="text-xs font-semibold text-primary-600 mb-2">Tips</p>
                                            <ul className="space-y-1">
                                                {day.tips.map((tip, idx) => (
                                                    <li key={idx} className="text-xs text-gray-700">• {tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Money Saving Tips */}
                        {itinerary.money_saving_tips && itinerary.money_saving_tips.length > 0 && (
                            <div className="glass-card p-5 bg-warning-100 border border-warning-300">
                                <h3 className="text-xl font-bold text-warning-700 mb-4">Money Saving Tips</h3>
                                <ul className="space-y-2">
                                    {itinerary.money_saving_tips.map((tip, idx) => (
                                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                                            <DollarSign className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
                                            {tip}
                                        </li>
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
