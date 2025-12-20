'use client';

import { useState, useEffect } from 'react';
import { ListChecks, Shield, Heart, AlertCircle, Clock, MapPin, Loader2, X } from 'lucide-react';
import SaveablePlanWrapper from './SaveablePlanWrapper';

export default function ArrivalTasks({ relocationData }) {
    const [tasks, setTasks] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedTask, setExpandedTask] = useState(null);

    // Load cached tasks
    useEffect(() => {
        const cacheKey = `arrival_tasks_${relocationData.destinationCountry}_${relocationData.purpose}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            setTasks(JSON.parse(cached));
        }
    }, [relocationData]);

    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/arrival-tasks/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination_country: relocationData.destinationCountry,
                    purpose: relocationData.purpose
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Arrival tasks data:', data); // Debug log
            setTasks(data);

            // Cache the results
            const cacheKey = `arrival_tasks_${relocationData.destinationCountry}_${relocationData.purpose}`;
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (err) {
            console.error('Error fetching arrival tasks:', err);
            setError(`Failed to fetch arrival tasks: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const clearTasks = () => {
        setTasks(null);
        const cacheKey = `arrival_tasks_${relocationData.destinationCountry}_${relocationData.purpose}`;
        localStorage.removeItem(cacheKey);
    };

    const TaskCard = ({ task, index, categoryColor }) => {
        const isExpanded = expandedTask === `${task.task}-${index}`;

        return (
            <div
                onClick={() => setExpandedTask(isExpanded ? null : `${task.task}-${index}`)}
                className={`glass-card p-4 cursor-pointer transition-all ${
                    isExpanded ? 'ring-2 ring-primary-500' : 'hover:bg-gray-50'
                }`}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">{task.task}</h4>
                        {task.deadline && (
                            <p className="text-sm text-warning-700 flex items-center gap-1 mb-2">
                                <Clock className="w-3 h-3" />
                                Deadline: {task.deadline}
                            </p>
                        )}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${categoryColor} flex-shrink-0 mt-2`} />
                </div>

                {isExpanded && (
                    <div className="mt-4 space-y-3 animate-fade-in">
                        <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                            <p className="text-xs font-semibold text-accent-600 mb-2">Why This Matters</p>
                            <p className="text-sm text-gray-700">{task.why_it_matters}</p>
                        </div>

                        {task.where_to_do && (
                            <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                                <p className="text-xs font-semibold text-primary-600 mb-2 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    Where to Do This
                                </p>
                                <p className="text-sm text-gray-700">{task.where_to_do}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const TaskCategory = ({ title, icon: Icon, tasks: categoryTasks, categoryColor, bgColor }) => (
        <div className={`glass-card p-5 ${bgColor} border border-gray-300`}>
            <div className="flex items-center gap-3 mb-4">
                <Icon className={`w-6 h-6 ${categoryColor}`} />
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <span className="ml-auto bg-gray-200 px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                    {categoryTasks?.length || 0}
                </span>
            </div>

            <div className="space-y-3">
                {categoryTasks?.map((task, idx) => (
                    <TaskCard
                        key={idx}
                        task={task}
                        index={idx}
                        categoryColor={categoryColor}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <SaveablePlanWrapper
            planType="arrival"
            planData={tasks}
            relocationData={relocationData}
        >
            <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <ListChecks className="w-8 h-8 text-danger-600" />
                        <h2 className="text-3xl font-bold text-gray-800">Post-Arrival Tasks</h2>
                    </div>
                    {tasks && (
                        <button
                            onClick={clearTasks}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all text-sm font-medium"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>

                {!tasks && (
                    <div className="text-center py-12">
                        <ListChecks className="w-16 h-16 text-accent-600 mx-auto mb-4" />
                        <p className="text-gray-700 mb-6">
                            Get a comprehensive checklist of all tasks to complete after arriving in {relocationData.destinationCountry}
                        </p>
                        <button
                            onClick={fetchTasks}
                            disabled={loading}
                            className="glass-button flex items-center justify-center gap-2 mx-auto"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Loading Tasks...
                                </>
                            ) : (
                                'Get My Task List'
                            )}
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-danger-100 border border-danger-300 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-danger-600" />
                        <p className="text-danger-700">{error}</p>
                    </div>
                )}

                {tasks && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Country Specific Notes */}
                        {tasks.country_specific_notes && (
                            <div className="glass-card p-4 bg-primary-100 border-2 border-primary-300">
                                <h3 className="text-lg font-bold text-primary-700 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Important Note for {relocationData.destinationCountry}
                                </h3>
                                <p className="text-gray-700">{tasks.country_specific_notes}</p>
                            </div>
                        )}

                        {/* Mandatory Tasks */}
                        <TaskCategory
                            title="Mandatory Tasks"
                            icon={AlertCircle}
                            tasks={tasks.mandatory_tasks}
                            categoryColor="text-danger-600"
                            bgColor="bg-danger-100"
                        />

                        {/* Survival Tasks */}
                        <TaskCategory
                            title="Survival Essentials"
                            icon={Heart}
                            tasks={tasks.survival_tasks}
                            categoryColor="text-warning-600"
                            bgColor="bg-warning-100"
                        />

                        {/* Safety Tasks */}
                        <TaskCategory
                            title="Safety & Security"
                            icon={Shield}
                            tasks={tasks.safety_tasks}
                            categoryColor="text-success-600"
                            bgColor="bg-success-100"
                        />

                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="glass-card p-4 bg-danger-100 text-center border border-danger-300">
                                <p className="text-3xl font-bold text-danger-600">
                                    {tasks.mandatory_tasks?.length || 0}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Mandatory</p>
                            </div>
                            <div className="glass-card p-4 bg-warning-100 text-center border border-warning-300">
                                <p className="text-3xl font-bold text-warning-600">
                                    {tasks.survival_tasks?.length || 0}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Survival</p>
                            </div>
                            <div className="glass-card p-4 bg-success-100 text-center border border-success-300">
                                <p className="text-3xl font-bold text-success-600">
                                    {tasks.safety_tasks?.length || 0}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Safety</p>
                            </div>
                        </div>

                        <div className="bg-accent-100 border border-accent-300 rounded-lg p-4">
                            <p className="text-sm text-gray-700">
                                💡 <span className="font-semibold">Tip:</span> Click on any task to see why it matters and where to complete it.
                            </p>
                        </div>

                        <button
                            onClick={fetchTasks}
                            className="glass-button w-full"
                        >
                            Refresh Task List
                        </button>
                    </div>
                )}
            </div>
        </SaveablePlanWrapper>
    );
}
