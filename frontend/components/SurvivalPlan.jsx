'use client';

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import SaveablePlanWrapper from './SaveablePlanWrapper';

export default function SurvivalPlan({ relocationData }) {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load cached plan on mount
    useEffect(() => {
        const cacheKey = `survival_plan_${relocationData.homeCountry}_${relocationData.destinationCountry}_${relocationData.purpose}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                setPlan(JSON.parse(cached));
            } catch (e) {
                console.error('Error loading cached plan:', e);
            }
        }
    }, [relocationData]);

    const generatePlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survival-plan/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    home_country: relocationData.homeCountry,
                    destination_country: relocationData.destinationCountry,
                    purpose: relocationData.purpose
                })
            });
            const data = await response.json();
            setPlan(data);

            // Cache the plan
            const cacheKey = `survival_plan_${relocationData.homeCountry}_${relocationData.destinationCountry}_${relocationData.purpose}`;
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (err) {
            setError('Failed to generate survival plan');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'text-danger-400 bg-danger-500/20';
            case 'important': return 'text-warning-400 bg-warning-500/20';
            case 'recommended': return 'text-success-400 bg-success-500/20';
            default: return 'text-primary-400 bg-primary-500/20';
        }
    };

    const WeekCard = ({ week }) => (
        <div className="glass-card p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Week {week.week_number}</h3>
                    <p className="text-lg text-accent-600">{week.title}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(week.priority)}`}>
                    {week.priority}
                </span>
            </div>
            <ul className="space-y-2">
                {week.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                        <span>{task}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <SaveablePlanWrapper
            planType="survival"
            planData={plan}
            relocationData={relocationData}
        >
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-8 h-8 text-accent-600" />
                    <h2 className="text-3xl font-bold text-gray-800">30-Day Survival Plan</h2>
                </div>

                {!plan && (
                    <div className="text-center py-12">
                        <Clock className="w-16 h-16 text-accent-500 mx-auto mb-4" />
                        <p className="text-gray-600 mb-6">
                            Get a personalized week-by-week plan for your first 30 days in {relocationData.destinationCountry}
                        </p>
                        <button
                            onClick={generatePlan}
                            disabled={loading}
                            className="glass-button"
                        >
                            {loading ? 'Generating Plan...' : 'Generate My 30-Day Plan'}
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-danger-500/20 border border-danger-500/50 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-danger-400" />
                        <p className="text-danger-400">{error}</p>
                    </div>
                )}

                {plan && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-accent-100 border border-accent-300 rounded-lg p-4">
                            <p className="text-gray-800">{plan.overview}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <WeekCard week={plan.week_1} />
                            <WeekCard week={plan.week_2} />
                            <WeekCard week={plan.week_3} />
                            <WeekCard week={plan.week_4} />
                        </div>

                        {plan.emergency_contacts && plan.emergency_contacts.length > 0 && (
                            <div className="glass-card p-4 bg-danger-100 border-danger-300">
                                <h3 className="text-lg font-bold text-danger-700 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Emergency Contacts
                                </h3>
                                <ul className="space-y-1">
                                    {plan.emergency_contacts.map((contact, idx) => (
                                        <li key={idx} className="text-gray-700">{contact}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={generatePlan}
                            className="glass-button w-full"
                        >
                            Regenerate Plan
                        </button>
                    </div>
                )}
            </div>
        </SaveablePlanWrapper>
    );
}
