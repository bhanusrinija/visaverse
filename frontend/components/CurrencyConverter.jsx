'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { currencyAPI } from '@/lib/api';
import { getCurrencyForCountry, formatDuration } from '@/lib/countryUtils';

export default function CurrencyConverter({ relocationData }) {
    const [amount, setAmount] = useState('100');

    // Auto-detect currencies from countries
    const homeCurrency = getCurrencyForCountry(relocationData.homeCountry);
    const destCurrency = getCurrencyForCountry(relocationData.destinationCountry);

    const [fromCurrency, setFromCurrency] = useState(homeCurrency.code);
    const [toCurrency, setToCurrency] = useState(destCurrency.code);
    const [result, setResult] = useState(null);
    const [advice, setAdvice] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Update currencies when countries change
    useEffect(() => {
        const home = getCurrencyForCountry(relocationData.homeCountry);
        const dest = getCurrencyForCountry(relocationData.destinationCountry);
        setFromCurrency(home.code);
        setToCurrency(dest.code);
    }, [relocationData.homeCountry, relocationData.destinationCountry]);

    const handleConvert = async () => {
        if (!amount || parseFloat(amount) <= 0) return;

        setIsLoading(true);
        try {
            const conversion = await currencyAPI.convert(parseFloat(amount), fromCurrency, toCurrency);
            setResult(conversion);
        } catch (error) {
            console.error('Conversion error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoneyAdvice = async () => {
        setIsLoading(true);
        try {
            const duration = relocationData.durationDays || 30;
            const adviceData = await currencyAPI.getAdvice(relocationData.destinationCountry, duration);
            setAdvice(adviceData);
        } catch (error) {
            console.error('Advice error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Converter */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <DollarSign className="w-8 h-8 text-primary-400" />
                    <div>
                        <h2 className="text-2xl font-bold">Currency Converter</h2>
                        <p className="text-xs text-white/60 mt-1">
                            {homeCurrency.name} → {destCurrency.name}
                        </p>
                    </div>
                </div>

                {relocationData.durationDays && (
                    <div className="mb-4 p-3 bg-primary-500/10 rounded-lg">
                        <p className="text-sm text-black/80">
                            💡 For {formatDuration(relocationData.durationDays)}, budget planning is essential!
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-glass w-full"
                            placeholder="100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">From</label>
                        <select
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className="input-glass w-full"
                        >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">To</label>
                        <select
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                            className="input-glass w-full"
                        >
                            <option value="EUR">EUR - Euro</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleConvert}
                    className="glass-button w-full mb-4"
                    disabled={isLoading}
                >
                    {isLoading ? 'Converting...' : 'Convert'}
                </button>

                {result && (
                    <div className="bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-lg p-6 text-center">
                        <p className="text-black/70 text-sm mb-2">
                            {result.amount} {result.from_currency} =
                        </p>
                        <p className="text-4xl font-bold text-black mb-2">
                            {result.converted_amount} {result.to_currency}
                        </p>
                        <p className="text-black/60 text-sm">
                            Exchange Rate: 1 {result.from_currency} = {result.exchange_rate} {result.to_currency}
                        </p>
                        {result.advice && (
                            <div className="mt-4 p-4 bg-white/10 rounded-lg text-left">
                                <p className="text-sm text-black/80">{result.advice}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Money Advice */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-8 h-8 text-accent-400" />
                    <h2 className="text-2xl font-bold">Money Tips for {relocationData.destinationCountry}</h2>
                </div>

                {!advice ? (
                    <button onClick={loadMoneyAdvice} className="glass-button w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Get Money Advice'}
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="font-semibold text-primary-400 mb-2">💳 Cash vs Card</h3>
                            <p className="text-sm text-black/80">{advice.cash_vs_card_advice}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="font-semibold text-accent-400 mb-2">🏧 ATM Availability</h3>
                            <p className="text-sm text-black/80">{advice.atm_availability}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="font-semibold text-primary-400 mb-2">💱 Exchange Tips</h3>
                            <p className="text-sm text-black/80">{advice.exchange_tips}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="font-semibold text-accent-400 mb-2">🛍️ Local Money Habits</h3>
                            <p className="text-sm text-black/80">{advice.local_money_habits}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="font-semibold text-primary-400 mb-2">💰 Daily Budget</h3>
                            <p className="text-sm text-black/80">{advice.estimated_daily_budget}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
