'use client';

import { useState, useEffect } from 'react';
import { Building2, FileText, AlertTriangle, CheckCircle2, DollarSign, Shield, Loader2, X, Home, MapPin, Wifi, Car } from 'lucide-react';
import SaveablePlanWrapper from './SaveablePlanWrapper';

export default function RentalGuide({ relocationData }) {
    const [city, setCity] = useState('');
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load cached guide
    useEffect(() => {
        const cacheKey = `rental_guide_${relocationData.destinationCountry}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            setGuide(parsed.guide);
            setCity(parsed.city || '');
        }
    }, [relocationData]);

    const fetchGuide = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rental-housing/guide`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination_country: relocationData.destinationCountry,
                    city: city || null
                })
            });
            const data = await response.json();
            setGuide(data);

            // Cache the results
            const cacheKey = `rental_guide_${relocationData.destinationCountry}`;
            localStorage.setItem(cacheKey, JSON.stringify({
                guide: data,
                city
            }));
        } catch (err) {
            setError('Failed to fetch rental housing guide');
        } finally {
            setLoading(false);
        }
    };

    const clearGuide = () => {
        setGuide(null);
        const cacheKey = `rental_guide_${relocationData.destinationCountry}`;
        localStorage.removeItem(cacheKey);
    };

    return (
        <SaveablePlanWrapper
            planType="rental"
            planData={guide}
            relocationData={relocationData}
        >
            <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-accent-600" />
                        <h2 className="text-3xl font-bold text-gray-800">Rental Housing Guide</h2>
                    </div>
                    {guide && (
                        <button
                            onClick={clearGuide}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all text-sm font-medium"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>

                <div className="flex gap-4">
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={`City in ${relocationData.destinationCountry} (optional)`}
                        className="input-glass flex-1"
                    />
                    <button
                        onClick={fetchGuide}
                        disabled={loading}
                        className="glass-button flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            guide ? 'Regenerate Guide' : 'Get Rental Guide'
                        )}
                    </button>
                </div>

                {error && (
                    <div className="bg-danger-100 border border-danger-300 rounded-lg p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-danger-600" />
                        <p className="text-danger-700">{error}</p>
                    </div>
                )}

                {guide && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Rental Process */}
                        <div className="glass-card p-5">
                            <h3 className="text-xl font-bold text-primary-600 mb-4 flex items-center gap-2">
                                <FileText className="w-6 h-6" />
                                Rental Process
                            </h3>
                            <p className="text-gray-700 whitespace-pre-line">{guide.rental_process}</p>
                        </div>

                        {/* Typical Costs */}
                        <div className="glass-card p-5">
                            <h3 className="text-xl font-bold text-success-600 mb-4 flex items-center gap-2">
                                <DollarSign className="w-6 h-6" />
                                Typical Costs
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(guide.typical_costs || {}).map(([key, value]) => (
                                    <div key={key} className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                                        <p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                                        <p className="text-lg font-semibold text-gray-800">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Required Documents */}
                        <div className="glass-card p-5">
                            <h3 className="text-xl font-bold text-accent-600 mb-4 flex items-center gap-2">
                                <FileText className="w-6 h-6" />
                                Required Documents
                            </h3>
                            <ul className="space-y-2">
                                {guide.required_documents?.map((doc, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                                        {doc}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contract Tips */}
                        <div className="glass-card p-5 bg-primary-100 border border-primary-300">
                            <h3 className="text-xl font-bold text-primary-700 mb-4 flex items-center gap-2">
                                <Shield className="w-6 h-6" />
                                Contract Tips
                            </h3>
                            <ul className="space-y-2">
                                {guide.contract_tips?.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Common Scams */}
                        <div className="glass-card p-5 bg-danger-100 border-2 border-danger-300">
                            <h3 className="text-xl font-bold text-danger-700 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6" />
                                Common Scams to Avoid
                            </h3>
                            <ul className="space-y-2">
                                {guide.common_scams?.map((scam, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-danger-700">
                                        <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                                        {scam}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Registration Requirements */}
                        <div className="glass-card p-5">
                            <h3 className="text-xl font-bold text-warning-600 mb-4">Registration Requirements</h3>
                            <p className="text-gray-700 whitespace-pre-line">{guide.registration_requirements}</p>
                        </div>

                        {/* Legal Tips */}
                        <div className="glass-card p-5 bg-success-100 border border-success-300">
                            <h3 className="text-xl font-bold text-success-700 mb-4 flex items-center gap-2">
                                <Shield className="w-6 h-6" />
                                Legal Tips
                            </h3>
                            <ul className="space-y-2">
                                {guide.legal_tips?.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Rental Options */}
                        {guide.rental_options && guide.rental_options.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <Home className="w-7 h-7 text-accent-600" />
                                    Available Rental Options
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {guide.rental_options.map((property, idx) => (
                                        <div key={idx} className="glass-card p-5 hover:shadow-xl transition-all border-2 border-accent-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-800">{property.property_name}</h4>
                                                    <p className="text-sm text-accent-600 flex items-center gap-1 mt-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {property.area}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded-lg text-xs font-bold">
                                                    {property.property_type}
                                                </span>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Bedrooms:</span>
                                                    <span className="text-sm font-semibold text-gray-800">{property.bedrooms}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Monthly Rent:</span>
                                                    <span className="text-lg font-bold text-success-600">{property.monthly_rent}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Deposit:</span>
                                                    <span className="text-sm font-semibold text-gray-800">{property.deposit}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Utilities:</span>
                                                    <span className={`text-sm font-semibold ${property.utilities_included ? 'text-success-600' : 'text-warning-600'}`}>
                                                        {property.utilities_included ? 'Included ✓' : 'Not included'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <p className="text-xs font-semibold text-gray-700 mb-2">Amenities:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {property.amenities?.map((amenity, i) => (
                                                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    Nearby Facilities:
                                                </p>
                                                <p className="text-xs text-gray-600">{property.nearby_facilities?.join(', ')}</p>
                                            </div>

                                            <div className="mb-3 pb-3 border-b border-gray-300">
                                                <p className="text-xs font-semibold text-gray-700 mb-1">Public Transport:</p>
                                                <p className="text-xs text-gray-600">{property.public_transport}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div>
                                                    <p className="text-xs font-semibold text-success-700 mb-1">Pros:</p>
                                                    <ul className="space-y-1">
                                                        {property.pros?.map((pro, i) => (
                                                            <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                                                <span className="text-success-600">+</span>
                                                                <span>{pro}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-danger-700 mb-1">Cons:</p>
                                                    <ul className="space-y-1">
                                                        {property.cons?.map((con, i) => (
                                                            <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                                                <span className="text-danger-600">-</span>
                                                                <span>{con}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-gray-300">
                                                <span className="text-xs text-gray-600">Best for: </span>
                                                <span className="text-xs font-bold text-primary-600 capitalize">{property.best_for}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </SaveablePlanWrapper>
    );
}
