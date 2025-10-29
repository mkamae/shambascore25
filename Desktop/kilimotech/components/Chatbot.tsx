import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { sendMessage, getChatHistory, ChatMessage } from '../services/chatbotService';
import Spinner from './shared/Spinner';

/**
 * AI Advisory Chatbot Component
 * 
 * Floating chat widget that provides personalized farming and financial advice
 * Accessible on every page with persistent chat history
 */
const Chatbot: React.FC = () => {
    const { selectedFarmer } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load chat history when component mounts or farmer changes
    useEffect(() => {
        if (selectedFarmer && isOpen) {
            loadChatHistory();
        }
    }, [selectedFarmer, isOpen]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const loadChatHistory = async () => {
        if (!selectedFarmer) return;

        try {
            const history = await getChatHistory(selectedFarmer.id);
            setMessages(history.reverse()); // Reverse to show oldest first
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!selectedFarmer || !inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setIsLoading(true);
        setIsTyping(true);

        // Add user message to UI immediately (optimistic update)
        const tempUserMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            farmerId: selectedFarmer.id,
            message: userMessage,
            response: '',
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempUserMessage]);

        try {
            // Get AI response
            const aiResponse = await sendMessage(selectedFarmer, userMessage);

            // Replace temp message with actual message
            setMessages(prev => {
                const updated = [...prev];
                const tempIndex = updated.findIndex(m => m.id === tempUserMessage.id);
                if (tempIndex !== -1) {
                    updated[tempIndex] = {
                        ...tempUserMessage,
                        id: `msg-${Date.now()}`,
                        response: aiResponse
                    };
                }
                return updated;
            });
        } catch (error: any) {
            console.error('Error sending message:', error);
            
            // Show error in chat
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                farmerId: selectedFarmer.id,
                message: userMessage,
                response: 'I apologize, but I encountered an error. Please check your connection and try again.',
                createdAt: new Date().toISOString()
            };
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== tempUserMessage.id);
                return [...filtered, errorMessage];
            });
        } finally {
            setIsLoading(false);
            setIsTyping(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Welcome message shown when chat opens for first time
    const showWelcomeMessage = messages.length === 0;

    if (!selectedFarmer) {
        return null; // Don't show chatbot if no farmer is selected
    }

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-110"
                    aria-label="Open chat"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-xl">🤖</span>
                            </div>
                            <div>
                                <h3 className="font-semibold">Farm Advisor AI</h3>
                                <p className="text-xs text-green-100">How can I help you today?</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                            aria-label="Close chat"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {/* Welcome Message */}
                        {showWelcomeMessage && (
                            <div className="flex justify-start">
                                <div className="bg-green-100 border border-green-200 rounded-lg p-4 max-w-[85%]">
                                    <p className="text-gray-800 text-sm">
                                        👋 <strong>Hello, {selectedFarmer.name}!</strong> I'm your Farm Advisor AI. I can help you with:
                                    </p>
                                    <ul className="mt-2 text-xs text-gray-700 space-y-1 list-disc list-inside">
                                        <li>Improving your crop yield</li>
                                        <li>Understanding your risk score</li>
                                        <li>Financial advice and loan tips</li>
                                        <li>Weather and planting guidance</li>
                                        <li>Market insights and best practices</li>
                                    </ul>
                                    <p className="mt-2 text-xs text-gray-600">
                                        Ask me anything about your farm!
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Chat Messages */}
                        {messages.map((msg) => (
                            <div key={msg.id} className="space-y-2">
                                {/* User Message */}
                                <div className="flex justify-end">
                                    <div className="bg-green-600 text-white rounded-lg px-4 py-2 max-w-[85%]">
                                        <p className="text-sm">{msg.message}</p>
                                    </div>
                                </div>

                                {/* AI Response */}
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 max-w-[85%] shadow-sm">
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.response}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about your farm..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Press Enter to send • Answers are personalized to your profile
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;

