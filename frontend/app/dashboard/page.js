'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VoiceChat from '@/components/VoiceChat';
import Translator from '@/components/Translator';
import PDFUploader from '@/components/PDFUploader';
import CurrencyConverter from '@/components/CurrencyConverter';
import RelocationChecklist from '@/components/RelocationChecklist';
import LanguageLearning from '@/components/LanguageLearning';
import PackingList from '@/components/PackingList';
import SurvivalPlan from '@/components/SurvivalPlan';
import AccommodationFinder from '@/components/AccommodationFinder';
import RentalGuide from '@/components/RentalGuide';
import TravelItinerary from '@/components/TravelItinerary';
import FirstHoursChecklist from '@/components/FirstHoursChecklist';
import ArrivalTasks from '@/components/ArrivalTasks';
import FlightDeals from '@/components/FlightDeals';
import SmartCalendar from '@/components/SmartCalendar';
import { Home, MessageSquare, Languages, FileText, Coins, Package, BookOpen, CheckSquare, Calendar, Building2, Map, Clock, ListChecks, ChevronRight, Menu, X, Plane, CalendarClock, UserPlus } from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const [relocationData, setRelocationData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const data = sessionStorage.getItem('relocationData');
        if (!data) {
            router.push('/');
            return;
        }
        setRelocationData(JSON.parse(data));
    }, [router]);

    if (!relocationData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-accent-50 to-info-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    const menuGroups = [
        {
            name: 'Home',
            items: [
                { id: 'overview', label: 'Dashboard', icon: Home, color: 'text-primary-600' },
                { id: 'voice', label: 'Voice AI Chat', icon: MessageSquare, color: 'text-info-600' },
            ]
        },
        {
            name: 'Planning & Setup',
            items: [
                { id: 'relocation', label: 'Relocation Plan', icon: CheckSquare, color: 'text-primary-600' },
                { id: 'survival', label: '30-Day Plan', icon: Calendar, color: 'text-success-600' },
                { id: 'first-hours', label: 'First 48 Hours', icon: Clock, color: 'text-warning-600' },
                { id: 'arrival', label: 'Arrival Tasks', icon: ListChecks, color: 'text-danger-600' },
            ]
        },
        {
            name: 'Housing & Travel',
            items: [
                { id: 'accommodation', label: 'Find Housing', icon: Home, color: 'text-accent-600' },
                { id: 'rental', label: 'Rental Guide', icon: Building2, color: 'text-primary-600' },
                { id: 'itinerary', label: 'Travel Planner', icon: Map, color: 'text-success-600' },
                { id: 'flights', label: 'Flight Deals', icon: Plane, color: 'text-info-600' },
                { id: 'calendar', label: 'Smart Calendar', icon: CalendarClock, color: 'text-warning-600' },
            ]
        },
        {
            name: 'Cultural Integration',
            items: [
                { id: 'language', label: 'Language Learning', icon: Languages, color: 'text-accent-600' },
                { id: 'translator', label: 'Live Translator', icon: Languages, color: 'text-info-600' },
            ]
        },
        {
            name: 'Essentials',
            items: [
                { id: 'currency', label: 'Currency Helper', icon: Coins, color: 'text-warning-600' },
                { id: 'documents', label: 'Documents', icon: FileText, color: 'text-danger-600' },
                { id: 'packing', label: 'Packing List', icon: Package, color: 'text-success-600' },
            ]
        },
    ];

    const MenuItem = ({ item, group }) => (
        <button
            onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group ${activeTab === item.id
                ? 'bg-gradient-to-r from-primary-400 to-accent-400 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
        >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : item.color}`} />
            <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
            {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
        </button>
    );

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-primary-50 via-accent-50 to-info-50">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-72 bg-white/80 backdrop-blur-lg border-r border-gray-200/50 shadow-xl
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                overflow-y-auto
            `}>
                <div className="p-6">
                    {/* Logo */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                            VisaVerse
                        </h1>
                        <p className="text-xs text-gray-600 mt-1">Your Relocation Companion</p>
                    </div>

                    {/* Relocation Info Card */}
                    <div className="mb-6 p-4 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Your Journey</p>
                        <p className="text-sm font-bold text-gray-800">
                            {relocationData.homeCountry} → {relocationData.destinationCountry}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 capitalize">{relocationData.purpose}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-3 w-full text-xs py-2 px-3 bg-white/60 hover:bg-white/80 text-gray-700 font-medium rounded-lg transition-all"
                        >
                            Change Destination
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="space-y-6">
                        {menuGroups.map((group) => (
                            <div key={group.name}>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                                    {group.name}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map((item) => (
                                        <MenuItem key={item.id} item={item} group={group.name} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8 max-w-7xl">
                    {/* Tab Content */}
                    <div className="animate-fade-in">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="glass-card p-8">
                                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Your Relocation Hub!</h2>
                                    <p className="text-gray-700 mb-4">
                                        You're planning to move from <span className="text-primary-600 font-semibold">{relocationData.homeCountry}</span> to{' '}
                                        <span className="text-accent-600 font-semibold">{relocationData.destinationCountry}</span> for{' '}
                                        <span className="text-primary-600 font-semibold">{relocationData.purpose}</span>.
                                    </p>
                                    <p className="text-gray-600 mb-6">
                                        Use the sidebar to access all our AI-powered tools designed to make your relocation smooth and stress-free.
                                    </p>

                                    {/* Quick Actions Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div
                                            onClick={() => setActiveTab('survival')}
                                            className="p-4 bg-success-50 rounded-xl border border-success-200 hover:border-success-400 transition-all cursor-pointer hover:shadow-md"
                                        >
                                            <Calendar className="w-8 h-8 text-success-600 mb-2" />
                                            <h3 className="font-semibold text-gray-800 mb-1">30-Day Plan</h3>
                                            <p className="text-sm text-gray-600">Week-by-week survival guide</p>
                                        </div>

                                        <div
                                            onClick={() => setActiveTab('first-hours')}
                                            className="p-4 bg-warning-50 rounded-xl border border-warning-200 hover:border-warning-400 transition-all cursor-pointer hover:shadow-md"
                                        >
                                            <Clock className="w-8 h-8 text-warning-600 mb-2" />
                                            <h3 className="font-semibold text-gray-800 mb-1">First 48 Hours</h3>
                                            <p className="text-sm text-gray-600">Essential arrival checklist</p>
                                        </div>

                                        <div
                                            onClick={() => setActiveTab('accommodation')}
                                            className="p-4 bg-accent-50 rounded-xl border border-accent-200 hover:border-accent-400 transition-all cursor-pointer hover:shadow-md"
                                        >
                                            <Home className="w-8 h-8 text-accent-600 mb-2" />
                                            <h3 className="font-semibold text-gray-800 mb-1">Find Housing</h3>
                                            <p className="text-sm text-gray-600">Cultural compatibility matching</p>
                                        </div>

                                        <div
                                            onClick={() => setActiveTab('itinerary')}
                                            className="p-4 bg-info-50 rounded-xl border border-info-200 hover:border-info-400 transition-all cursor-pointer hover:shadow-md"
                                        >
                                            <Map className="w-8 h-8 text-info-600 mb-2" />
                                            <h3 className="font-semibold text-gray-800 mb-1">Travel Planner</h3>
                                            <p className="text-sm text-gray-600">Budget-aware itineraries</p>
                                        </div>


                                        <div
                                            onClick={() => setActiveTab('voice')}
                                            className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-200 hover:border-accent-400 transition-all cursor-pointer hover:shadow-md"
                                        >
                                            <MessageSquare className="w-8 h-8 text-primary-600 mb-2" />
                                            <h3 className="font-semibold text-gray-800 mb-1">Voice AI Assistant</h3>
                                            <p className="text-sm text-gray-600">Ask anything, anytime</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'voice' && <VoiceChat relocationData={relocationData} />}
                        {activeTab === 'relocation' && <RelocationChecklist relocationData={relocationData} />}
                        {activeTab === 'survival' && <SurvivalPlan relocationData={relocationData} />}
                        {activeTab === 'first-hours' && <FirstHoursChecklist relocationData={relocationData} />}
                        {activeTab === 'arrival' && <ArrivalTasks relocationData={relocationData} />}
                        {activeTab === 'accommodation' && <AccommodationFinder relocationData={relocationData} />}
                        {activeTab === 'rental' && <RentalGuide relocationData={relocationData} />}
                        {activeTab === 'itinerary' && <TravelItinerary relocationData={relocationData} />}
                        {activeTab === 'flights' && <FlightDeals />}
                        {activeTab === 'calendar' && <SmartCalendar />}
                        {activeTab === 'translator' && <Translator relocationData={relocationData} />}
                        {activeTab === 'language' && <LanguageLearning relocationData={relocationData} />}
                        {activeTab === 'currency' && <CurrencyConverter relocationData={relocationData} />}
                        {activeTab === 'documents' && <PDFUploader />}
                        {activeTab === 'packing' && <PackingList relocationData={relocationData} />}
                    </div>
                </div>
            </main>
        </div>
    );
}
