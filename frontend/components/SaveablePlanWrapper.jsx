'use client';

import { useState, useEffect } from 'react';
import { Save, Printer, Download, History, X } from 'lucide-react';

export default function SaveablePlanWrapper({
    planType, // 'survival', 'itinerary', 'first-hours', 'arrival', 'rental'
    planData,
    children,
    relocationData
}) {
    const [savedPlans, setSavedPlans] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        loadSavedPlans();
    }, [planType]);

    const loadSavedPlans = () => {
        try {
            const key = `saved_${planType}_plans`;
            const saved = localStorage.getItem(key);
            if (saved) {
                setSavedPlans(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading saved plans:', error);
        }
    };

    const savePlan = () => {
        if (!planData) return;

        try {
            const key = `saved_${planType}_plans`;
            const newPlan = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                data: planData,
                relocation: relocationData,
            };

            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            const updated = [newPlan, ...existing].slice(0, 10); // Keep last 10
            localStorage.setItem(key, JSON.stringify(updated));

            setSavedPlans(updated);
            alert('Plan saved successfully!');
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Error saving plan. Please try again.');
        }
    };

    const printPlan = () => {
        window.print();
    };

    const downloadAsJSON = () => {
        if (!planData) return;

        const dataStr = JSON.stringify(planData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${planType}-plan-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const loadSavedPlan = (plan) => {
        // This would need to be implemented based on how each component handles loading
        console.log('Load plan:', plan);
        setShowHistory(false);
    };

    const deleteSavedPlan = (planId) => {
        try {
            const key = `saved_${planType}_plans`;
            const updated = savedPlans.filter(p => p.id !== planId);
            localStorage.setItem(key, JSON.stringify(updated));
            setSavedPlans(updated);
        } catch (error) {
            console.error('Error deleting plan:', error);
        }
    };

    if (!planData) {
        return children;
    }

    return (
        <div className="relative">
            {/* Action Buttons */}
            <div className="flex gap-2 mb-4 print:hidden flex-wrap">
                <button
                    onClick={savePlan}
                    className="flex items-center gap-2 px-4 py-2 bg-success-500 hover:bg-success-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                    title="Save this plan"
                >
                    <Save className="w-4 h-4" />
                    <span className="text-sm font-medium">Save Plan</span>
                </button>

                <button
                    onClick={printPlan}
                    className="flex items-center gap-2 px-4 py-2 bg-info-500 hover:bg-info-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                    title="Print this plan"
                >
                    <Printer className="w-4 h-4" />
                    <span className="text-sm font-medium">Print</span>
                </button>

                <button
                    onClick={downloadAsJSON}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                    title="Download as JSON"
                >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Download</span>
                </button>

                {savedPlans.length > 0 && (
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 px-4 py-2 bg-warning-500 hover:bg-warning-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                        title="View saved plans"
                    >
                        <History className="w-4 h-4" />
                        <span className="text-sm font-medium">History ({savedPlans.length})</span>
                    </button>
                )}
            </div>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <History className="w-6 h-6 text-warning-500" />
                                Saved {planType.replace('-', ' ')} Plans
                            </h3>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {savedPlans.length === 0 ? (
                                <p className="text-center text-gray-500 py-12">No saved plans yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {savedPlans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-primary-400 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">
                                                        {plan.relocation?.homeCountry} → {plan.relocation?.destinationCountry}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(plan.timestamp).toLocaleDateString()} at{' '}
                                                        {new Date(plan.timestamp).toLocaleTimeString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 capitalize">
                                                        Purpose: {plan.relocation?.purpose}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => deleteSavedPlan(plan.id)}
                                                    className="p-2 text-danger-500 hover:bg-danger-50 rounded-lg transition-all"
                                                    title="Delete this plan"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <pre className="text-xs text-gray-600 overflow-x-auto bg-gray-50 p-2 rounded max-h-32">
                                                    {JSON.stringify(plan.data, null, 2).substring(0, 200)}...
                                                </pre>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Content */}
            {children}
        </div>
    );
}
