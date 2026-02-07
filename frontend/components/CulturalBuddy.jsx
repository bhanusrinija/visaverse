'use client';

import { useState } from 'react';
import { User, Bot, Send, RefreshCw, Star, AlertCircle, Loader2 } from 'lucide-react';

export default function CulturalBuddy({ relocationData }) {
    const [scenario, setScenario] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [score, setScore] = useState(0);
    const [totalCompetency, setTotalCompetency] = useState(0);

    const scenarioTypes = [
        'Business Meeting',
        'Dinner Party',
        'Street Interaction',
        'Public Transport',
        'Housing Interview'
    ];

    const startSimulation = async (type) => {
        setLoading(true);
        setScenario(null);
        setHistory([]);
        setScore(0);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/simulation/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination_country: relocationData.destinationCountry,
                    scenario_type: type
                })
            });
            const data = await response.json();

            if (data.error) {
                setHistory([{ role: 'bot', content: `Error: ${data.error}. Please make sure your Gemini API key is valid and you have access to the models.` }]);
                return;
            }

            setScenario(data);
            setHistory([{
                role: 'bot',
                content: data.initial_message || "Hello! Let's start the simulation.",
                character: data.character_name || "Local Guide",
                options: data.options || []
            }]);
        } catch (err) {
            console.error(err);
            setHistory([{ role: 'bot', content: "Failed to connect to the simulation service. Please ensure the backend is running." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (option) => {
        setEvaluating(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/simulation/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination_country: relocationData.destinationCountry,
                    scenario_desc: scenario.description,
                    char_msg: history[history.length - 1].content,
                    user_action: option.text
                })
            });
            const data = await response.json();

            if (data.error) {
                setHistory(prev => [...prev, { role: 'user', content: option.text }, { role: 'bot', content: `Sorry, I had trouble processing that choice: ${data.error}` }]);
                return;
            }

            setScore(data.score || 0);
            setTotalCompetency(prev => prev + (data.score || 0));

            const newHistory = [...history,
            { role: 'user', content: option.text },
            {
                role: 'bot',
                content: data.reaction || "I understand. Let's see what happens next.",
                feedback: data.feedback || "",
                character: scenario.character_name,
                options: data.next_options || [],
                score: data.score || 0
            }
            ];
            setHistory(newHistory);
        } catch (err) {
            console.error(err);
            setHistory(prev => [...prev, { role: 'user', content: option.text }, { role: 'bot', content: "Connection error. Please try again or restart the simulation." }]);
        } finally {
            setEvaluating(false);
        }
    };

    return (
        <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Cultural Buddy</h2>
                        <p className="text-sm text-gray-600">Master {relocationData.destinationCountry} customs through roleplay</p>
                    </div>
                </div>
                {totalCompetency > 0 && (
                    <div className="bg-yellow-100 px-4 py-2 rounded-full flex items-center gap-2 border border-yellow-300">
                        <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                        <span className="font-bold text-yellow-700">CP: {totalCompetency}</span>
                    </div>
                )}
            </div>

            {!scenario && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <div className="col-span-1 md:col-span-2 bg-primary-50 p-4 rounded-xl border border-primary-200">
                        <p className="text-primary-800">Choose a scenario to practice your cultural interactions. Gemini 3 will simulate a local and guide you!</p>
                    </div>
                    {scenarioTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => startSimulation(type)}
                            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-400 hover:shadow-lg transition-all text-left flex items-center justify-between group"
                        >
                            <span className="font-semibold text-gray-700">{type}</span>
                            <RefreshCw className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-all duration-500" />
                        </button>
                    ))}
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                    <p className="text-gray-600 font-medium">Preparing simulation...</p>
                </div>
            )}

            {scenario && (
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                        <h3 className="font-bold text-gray-800">{scenario.title}</h3>
                        <p className="text-sm text-gray-600">{scenario.description}</p>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
                        {history.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'bot' && (
                                    <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-600 shrink-0">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-primary-500 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-200 rounded-tl-none shadow-sm'
                                    }`}>
                                    {msg.character && (
                                        <p className="text-[10px] uppercase tracking-wider font-bold mb-1 opacity-70">
                                            {msg.character}
                                        </p>
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.content}</p>

                                    {msg.feedback && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`p-1 rounded bg-opacity-20 ${msg.score >= 7 ? 'bg-success-500 text-success-700' : 'bg-warning-500 text-warning-700'}`}>
                                                    <Star className="w-3 h-3 fill-current" />
                                                </div>
                                                <span className="text-xs font-bold">Feedback ({msg.score}/10)</span>
                                            </div>
                                            <p className="text-xs italic text-gray-600">{msg.feedback}</p>
                                        </div>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {history[history.length - 1].options && !evaluating && (
                        <div className="grid grid-cols-1 gap-2 pt-4">
                            {history[history.length - 1].options.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleAction(opt)}
                                    className="p-3 text-left bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 text-primary-800 text-sm transition-all"
                                >
                                    <span className="font-bold mr-2">{opt.id}:</span> {opt.text}
                                </button>
                            ))}
                        </div>
                    )}

                    {evaluating && (
                        <div className="flex items-center justify-center gap-2 py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                            <span className="text-sm text-gray-500 italic">Character is thinking...</span>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => setScenario(null)}
                            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                        >
                            End Simulation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
