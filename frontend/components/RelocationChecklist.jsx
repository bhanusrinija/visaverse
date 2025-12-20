'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Loader2, Calendar, FileText, AlertCircle } from 'lucide-react';
import { relocationAPI } from '@/lib/api';

export default function RelocationChecklist({ relocationData }) {
    const [plan, setPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPlan();
    }, []);

    const loadPlan = async () => {
        setIsLoading(true);
        try {
            const planData = await relocationAPI.getPlan(
                relocationData.homeCountry,
                relocationData.destinationCountry,
                relocationData.purpose
            );
            setPlan(planData);
        } catch (error) {
            console.error('Error loading plan:', error);
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

    if (!plan) {
        return (
            <div className="glass-card p-6">
                <p className="text-gray-700">Failed to load relocation plan. Please try again.</p>
                <button onClick={loadPlan} className="glass-button mt-4">Retry</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <CheckSquare className="w-8 h-8 text-primary-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Your Relocation Plan</h2>
                </div>
                <p className="text-gray-700">
                    Personalized plan for relocating from <span className="text-primary-600 font-semibold">{relocationData.homeCountry}</span> to{' '}
                    <span className="text-accent-600 font-semibold">{relocationData.destinationCountry}</span>
                </p>
            </div>

            {/* Timeline */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-6 h-6 text-accent-600" />
                    <h3 className="text-xl font-semibold text-gray-800">Timeline</h3>
                </div>
                <div className="bg-gradient-to-r from-primary-100 to-accent-100 rounded-lg p-4 border border-primary-300">
                    <p className="text-2xl font-bold text-gray-800 mb-2">{plan.timeline_weeks} weeks</p>
                    <p className="text-sm text-gray-700">{plan.timeline_description}</p>
                </div>
            </div>

            {/* Visa Recommendations */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <FileText className="w-6 h-6 text-primary-600" />
                    Visa Recommendations
                </h3>
                <div className="space-y-4">
                    {plan.visa_recommendations.map((visa, idx) => (
                        <div key={idx} className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                            <h4 className="font-semibold text-primary-600 mb-2">{visa.visa_type}</h4>
                            <p className="text-sm text-gray-700 mb-3">{visa.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <Calendar className="w-4 h-4" />
                                <span>Processing Time: {visa.processing_time}</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 mb-2">Requirements:</p>
                                <ul className="space-y-1">
                                    {visa.requirements.map((req, i) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="text-accent-600">•</span>
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Document Checklist */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <CheckSquare className="w-6 h-6 text-accent-600" />
                    Document Checklist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {plan.document_checklist.map((doc, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg border border-gray-300">
                            <input type="checkbox" className="mt-1" />
                            <span className="text-sm text-gray-700">{doc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Common Mistakes */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    Common Mistakes to Avoid
                </h3>
                <div className="space-y-3">
                    {plan.common_mistakes.map((mistake, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                            <span className="text-yellow-600">⚠️</span>
                            <span className="text-sm text-gray-700">{mistake}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Country-Specific Rules */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Country-Specific Rules</h3>
                <div className="space-y-3">
                    {plan.country_specific_rules.map((rule, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg border border-gray-300">
                            <span className="text-primary-600">📋</span>
                            <span className="text-sm text-gray-700">{rule}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
