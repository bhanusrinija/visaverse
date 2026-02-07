'use client';

import { useState, useEffect } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { packingAPI } from '@/lib/api';

export default function PackingList({ relocationData }) {
    const [packingList, setPackingList] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [checkedItems, setCheckedItems] = useState({});

    useEffect(() => {
        loadPackingList();
    }, []);

    const loadPackingList = async () => {
        setIsLoading(true);
        try {
            const listData = await packingAPI.getList(
                relocationData?.homeCountry || 'Unknown',
                relocationData?.destinationCountry || 'Unknown',
                30,
                (relocationData?.purpose || 'general').toLowerCase()
            );
            setPackingList(listData);
        } catch (error) {
            console.error('Error loading packing list:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleItem = (categoryIdx, itemIdx) => {
        const key = `${categoryIdx}-${itemIdx}`;
        setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (isLoading) {
        return (
            <div className="glass-card p-12 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!packingList) {
        return (
            <div className="glass-card p-6">
                <p className="text-gray-700">Failed to load packing list. Please try again.</p>
                <button onClick={loadPackingList} className="glass-button mt-4">Retry</button>
            </div>
        );
    }

    const priorityColors = {
        essential: 'border-red-500 bg-red-100',
        recommended: 'border-yellow-500 bg-yellow-100',
        optional: 'border-blue-500 bg-blue-100'
    };

    const priorityBadges = {
        essential: 'bg-red-500 text-white',
        recommended: 'bg-yellow-500 text-black',
        optional: 'bg-blue-500 text-white'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Package className="w-8 h-8 text-primary-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Smart Packing List</h2>
                </div>
                <p className="text-gray-700">
                    Customized for {packingList.home_country} → {packingList.destination_country}
                </p>
            </div>

            {/* Categories */}
            {packingList.categories.map((category, catIdx) => (
                <div key={catIdx} className={`glass-card p-6 border-2 ${priorityColors[category.priority]}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">{category.category}</h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${priorityBadges[category.priority]}`}>
                            {category.priority.toUpperCase()}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {category.items.map((item, itemIdx) => {
                            const key = `${catIdx}-${itemIdx}`;
                            return (
                                <div
                                    key={itemIdx}
                                    className="flex items-start gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-all border border-gray-300"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checkedItems[key] || false}
                                        onChange={() => toggleItem(catIdx, itemIdx)}
                                        className="mt-1 cursor-pointer"
                                    />
                                    <span className={`text-sm flex-1 ${checkedItems[key] ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                        {item}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* General Tips */}
            <div className="glass-card p-6 bg-gradient-to-r from-primary-100 to-accent-100 border border-primary-300">
                <h3 className="text-lg font-semibold mb-4 text-accent-700">💡 Packing Tips</h3>
                <ul className="space-y-2">
                    {packingList.general_tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                            <span className="text-primary-600">•</span>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Priority Legend */}
            <div className="glass-card p-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-800">Priority Legend:</h4>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="text-xs text-gray-700">Essential - Must have</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        <span className="text-xs text-gray-700">Recommended - Highly useful</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        <span className="text-xs text-gray-700">Optional - Nice to have</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
