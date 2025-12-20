'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2 } from 'lucide-react';
import { voiceAPI } from '@/lib/api';
import speechService from '@/lib/speech';

export default function VoiceChat({ relocationData }) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleVoiceInput = () => {
        if (isListening) {
            speechService.stopListening();
            setIsListening(false);
        } else {
            setIsListening(true);
            speechService.startListening(
                (transcript) => {
                    setInputText(transcript);
                    setIsListening(false);
                    handleSendMessage(transcript);
                },
                (error) => {
                    console.error('Speech recognition error:', error);
                    setIsListening(false);
                    alert('Voice input not available. Please type your message or use Chrome browser.');
                }
            );
        }
    };

    const handleSendMessage = async (text = inputText) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await voiceAPI.query(text, 'user123', relocationData);
            const assistantMessage = { role: 'assistant', content: response.response_text, suggestions: response.suggestions };
            setMessages(prev => [...prev, assistantMessage]);

            // Speak the response
            if (response.response_text) {
                setIsSpeaking(true);
                speechService.speak(response.response_text, {
                    onEnd: () => setIsSpeaking(false),
                    onError: () => setIsSpeaking(false)
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please make sure the backend server is running.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSpeech = () => {
        if (isSpeaking) {
            speechService.stopSpeaking();
            setIsSpeaking(false);
        }
    };

    return (
        <div className="glass-card p-6 h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                    Voice AI Assistant
                </h2>
                <button
                    onClick={toggleSpeech}
                    className={`p-2 rounded-lg ${isSpeaking ? 'bg-accent-500' : 'bg-white/10'} hover:bg-white/20 transition-all`}
                >
                    {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                {messages.length === 0 && (
                    <div className="text-center text-white/60 mt-20">
                        <Mic className="w-16 h-16 mx-auto mb-4 text-primary-400 opacity-50" />
                        <p>Ask me anything about your relocation!</p>
                        <p className="text-sm mt-2">Try: "What documents do I need?" or "Tell me about local customs"</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-lg ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-primary-500 to-accent-500'
                                : 'bg-white/10 backdrop-blur-sm'
                            }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            {msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs text-white/70">Suggestions:</p>
                                    {msg.suggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(suggestion)}
                                            className="block w-full text-left text-xs p-2 bg-white/10 hover:bg-white/20 rounded transition-all"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 p-4 rounded-lg">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message or use voice..."
                    className="input-glass flex-1"
                    disabled={isLoading}
                />
                <button
                    onClick={handleVoiceInput}
                    className={`p-3 rounded-lg transition-all ${isListening
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-gradient-to-r from-primary-500 to-accent-500 hover:shadow-lg'
                        }`}
                    disabled={isLoading}
                >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                    onClick={() => handleSendMessage()}
                    className="glass-button p-3"
                    disabled={isLoading || !inputText.trim()}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
