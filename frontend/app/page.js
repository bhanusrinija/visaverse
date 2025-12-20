'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Globe, Sparkles, ArrowRight, MessageSquare, FileText, Languages, Coins, Package, BookOpen, Calendar, Clock, ListChecks, Home as HomeIcon, Map } from 'lucide-react';
import { allCountries } from '@/lib/countryUtils';

export default function Home() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        homeCountry: '',
        destinationCountry: '',
        purpose: 'Work',
        durationDays: 30,
        departureDate: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        sessionStorage.setItem('relocationData', JSON.stringify(formData));
        router.push('/dashboard');
    };

    const features = [
        { icon: FileText, title: 'AI Relocation Planner', desc: 'Visa guidance & document checklists' },
        { icon: Calendar, title: '30-Day Survival Plan', desc: 'Week-by-week action plan for settling in' },
        { icon: Clock, title: 'First 48 Hours Guide', desc: 'Critical tasks for your first two days' },
        { icon: ListChecks, title: 'Arrival Tasks', desc: 'Complete post-arrival checklist' },
        { icon: HomeIcon, title: 'Housing Finder', desc: 'Accommodation & rental guidance' },
        { icon: Map, title: 'Travel Itinerary', desc: 'Smart travel planning & routes' },
        { icon: Plane, title: 'Flight Deals & Tips', desc: 'Best prices, coupons & booking tips' },
        { icon: Calendar, title: 'Smart Calendar', desc: 'Auto-generated relocation timeline' },
        { icon: BookOpen, title: 'Cultural Intelligence', desc: 'Learn local customs & etiquette' },
        { icon: Languages, title: 'Language Assistant', desc: 'Translation & essential phrases' },
        { icon: MessageSquare, title: 'Voice AI Chat', desc: 'Hands-free conversational help' },
        { icon: Coins, title: 'Currency Helper', desc: 'Real-time conversion & money tips' },
        { icon: FileText, title: 'Document Analysis', desc: 'AI-powered PDF understanding' },
        { icon: Package, title: 'Smart Packing', desc: 'Country-specific packing lists' },
    ];

    return (
        <div className="min-h-screen overflow-hidden relative">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

                {/* Decorative Floating Elements */}
                <Plane className="absolute top-32 right-1/4 w-16 h-16 text-primary-300/20 animate-float" style={{ animationDuration: '6s' }} />
                <Globe className="absolute bottom-32 left-1/4 w-20 h-20 text-accent-300/20 animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }} />
                <Plane className="absolute top-1/2 left-12 w-12 h-12 text-accent-300/15 animate-float transform -rotate-45" style={{ animationDuration: '7s', animationDelay: '2s' }} />
                <Globe className="absolute top-3/4 right-16 w-14 h-14 text-primary-300/15 animate-float" style={{ animationDuration: '9s', animationDelay: '0.5s' }} />
            </div>

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-16 animate-fade-in">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Globe className="w-12 h-12 text-primary-400 animate-float" />
                        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent animate-gradient">
                            VisaVerse
                        </h1>
                        <Sparkles className="w-12 h-12 text-accent-400 animate-float" style={{ animationDelay: '0.5s' }} />
                    </div>
                    <p className="text-xl md:text-2xl text-gray-800 font-semibold mb-4">
                        Your AI-Powered Global Relocation Companion
                    </p>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                        Navigate international relocation with confidence. Get visa guidance, cultural insights,
                        language help, and more—all powered by AI.
                    </p>
                </div>

                {/* Main Form Card */}
                <div className="max-w-2xl mx-auto mb-20 animate-slide-up">
                    <div className="glass-card p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                            Start Your Journey
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From (Home Country)
                                </label>
                                <select
                                    required
                                    value={formData.homeCountry}
                                    onChange={(e) => setFormData({ ...formData, homeCountry: e.target.value })}
                                    className="input-glass w-full"
                                >
                                    <option value="">Select your country</option>
                                    {allCountries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    To (Destination Country)
                                </label>
                                <select
                                    required
                                    value={formData.destinationCountry}
                                    onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                                    className="input-glass w-full"
                                >
                                    <option value="">Select destination</option>
                                    {allCountries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Purpose of Relocation
                                </label>
                                <select
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    className="input-glass w-full"
                                >
                                    <option value="Work">Work</option>
                                    <option value="Study">Study</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Business">Business</option>
                                    <option value="Immigration">Permanent Immigration</option>
                                    <option value="Family">Family Reunion</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expected Duration (Days)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="3650"
                                    value={formData.durationDays}
                                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                                    className="input-glass w-full"
                                    placeholder="e.g., 30, 90, 365"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    How many days do you plan to stay?
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Departure Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={formData.departureDate}
                                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                                    className="input-glass w-full"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    When do you plan to depart? (Helps with calendar and flight deals)
                                </p>
                            </div>

                            <button type="submit" className="glass-button w-full flex items-center justify-center gap-2">
                                <span>Get Started</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="mb-20">
                    <h2 className="section-title text-center mb-12">
                        Everything You Need in One Place
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="glass-card p-6 card-hover"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <feature.icon className="w-10 h-10 text-primary-600 mb-4" />
                                <h3 className="text-lg font-semibold mb-2 text-gray-800">{feature.title}</h3>
                                <p className="text-gray-700 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center glass-card p-12 max-w-3xl mx-auto">
                    <Plane className="w-16 h-16 text-accent-600 mx-auto mb-6 animate-float" />
                    <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Relocate with Confidence?</h2>
                    <p className="text-gray-700 mb-8">
                        Join thousands of successful relocators who trusted VisaVerse for their international move.
                    </p>
                    <button
                        onClick={() => document.querySelector('form').scrollIntoView({ behavior: 'smooth' })}
                        className="glass-button"
                    >
                        Start Planning Now
                    </button>
                </div>
            </div>
        </div>
    );
}
