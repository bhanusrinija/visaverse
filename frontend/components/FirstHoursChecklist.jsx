'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, MapPin, Phone, Loader2, X } from 'lucide-react';
import SaveablePlanWrapper from './SaveablePlanWrapper';

export default function FirstHoursChecklist({ relocationData }) {
    const [city, setCity] = useState('');
    const [arrivalTime, setArrivalTime] = useState('daytime');
    const [checklist, setChecklist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [completedTasks, setCompletedTasks] = useState({});

    // Load cached checklist
    useEffect(() => {
        const cacheKey = `first_hours_${relocationData.destinationCountry}_${arrivalTime}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            setChecklist(parsed.checklist);
            setCity(parsed.city || '');
            setArrivalTime(parsed.arrivalTime || 'daytime');
        }
    }, [relocationData]);

    const fetchChecklist = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/first-hours/checklist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination_country: relocationData.destinationCountry,
                    city: city || null,
                    arrival_time: arrivalTime
                })
            });
            const data = await response.json();
            setChecklist(data);
            setCompletedTasks({});

            // Cache the results
            const cacheKey = `first_hours_${relocationData.destinationCountry}_${arrivalTime}`;
            localStorage.setItem(cacheKey, JSON.stringify({
                checklist: data,
                city,
                arrivalTime
            }));
        } catch (err) {
            setError('Failed to fetch first hours checklist');
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = (slot, taskIndex) => {
        const key = `${slot}-${taskIndex}`;
        setCompletedTasks(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const clearChecklist = () => {
        setChecklist(null);
        setCompletedTasks({});
        const cacheKey = `first_hours_${relocationData.destinationCountry}_${arrivalTime}`;
        localStorage.removeItem(cacheKey);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'border-danger-500 bg-danger-100';
            case 'important': return 'border-warning-500 bg-warning-100';
            case 'recommended': return 'border-success-500 bg-success-100';
            default: return 'border-primary-500 bg-primary-100';
        }
    };

    const TimeSlotCard = ({ slot, slotData }) => (
        <div className={`glass-card p-5 border-2 ${getPriorityColor(slotData.priority_level)}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{slotData.time_slot}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        slotData.priority_level === 'critical' ? 'bg-danger-200 text-danger-700' :
                        slotData.priority_level === 'important' ? 'bg-warning-200 text-warning-700' :
                        'bg-success-200 text-success-700'
                    }`}>
                        {slotData.priority_level}
                    </span>
                </div>
                <Clock className="w-6 h-6 text-accent-600" />
            </div>

            <ul className="space-y-3 mb-4">
                {slotData.tasks?.map((task, idx) => {
                    const taskKey = `${slot}-${idx}`;
                    const isCompleted = completedTasks[taskKey];
                    return (
                        <li
                            key={idx}
                            onClick={() => toggleTask(slot, idx)}
                            className="flex items-start gap-3 cursor-pointer group"
                        >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                isCompleted
                                    ? 'bg-success-500 border-success-500'
                                    : 'border-gray-400 group-hover:border-success-500'
                            }`}>
                                {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <span className={`text-gray-700 transition-all ${isCompleted ? 'line-through opacity-50' : ''}`}>
                                {task}
                            </span>
                        </li>
                    );
                })}
            </ul>

            {slotData.location_specific_notes && (
                <div className="bg-gray-100 rounded-lg p-3 mt-4 border border-gray-300">
                    <p className="text-xs font-semibold text-primary-600 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Location Notes
                    </p>
                    <p className="text-sm text-gray-700">{slotData.location_specific_notes}</p>
                </div>
            )}
        </div>
    );

    return (
        <SaveablePlanWrapper
            planType="first-hours"
            planData={checklist}
            relocationData={relocationData}
        >
            <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-warning-600" />
                        <h2 className="text-3xl font-bold text-gray-800">First 48 Hours Checklist</h2>
                    </div>
                    {checklist && (
                        <button
                            onClick={clearChecklist}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all text-sm font-medium"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City (optional)</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={`City in ${relocationData.destinationCountry}`}
                        className="input-glass w-full"
                    />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Time</label>
                    <select
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        className="input-glass w-full"
                    >
                        <option value="daytime">Daytime</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={fetchChecklist}
                    disabled={loading}
                    className="glass-button w-full flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Loading Checklist...
                        </>
                    ) : (
                        checklist ? 'Regenerate Checklist' : 'Get My Checklist'
                    )}
                </button>

                {error && (
                    <div className="bg-danger-100 border border-danger-300 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-danger-600" />
                        <p className="text-danger-700">{error}</p>
                    </div>
                )}

                {checklist && (
                    <div className="space-y-6 animate-fade-in">
                        <TimeSlotCard slot="hour_1_3" slotData={checklist.hour_1_3} />
                        <TimeSlotCard slot="day_1" slotData={checklist.day_1} />
                        <TimeSlotCard slot="day_2" slotData={checklist.day_2} />

                        {/* Emergency Contacts */}
                        {checklist.emergency_contacts && checklist.emergency_contacts.length > 0 && (
                            <div className="glass-card p-5 bg-danger-100 border-2 border-danger-300">
                                <h3 className="text-lg font-bold text-danger-700 mb-3 flex items-center gap-2">
                                    <Phone className="w-5 h-5" />
                                    Emergency Contacts
                                </h3>
                                <ul className="space-y-2">
                                    {checklist.emergency_contacts.map((contact, idx) => (
                                        <li key={idx} className="text-gray-800 font-medium">{contact}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Important Locations */}
                        {checklist.important_locations && checklist.important_locations.length > 0 && (
                            <div className="glass-card p-5 bg-primary-100">
                                <h3 className="text-lg font-bold text-primary-700 mb-3 flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Important Locations
                                </h3>
                                <ul className="space-y-2">
                                    {checklist.important_locations.map((location, idx) => (
                                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                                            {location}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Progress Indicator */}
                        <div className="glass-card p-4 bg-success-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm font-bold text-success-700">
                                    {Object.values(completedTasks).filter(Boolean).length} tasks completed
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-success-500 to-primary-500 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${(Object.values(completedTasks).filter(Boolean).length /
                                            ((checklist.hour_1_3?.tasks?.length || 0) +
                                            (checklist.day_1?.tasks?.length || 0) +
                                            (checklist.day_2?.tasks?.length || 0))) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SaveablePlanWrapper>
    );
}
