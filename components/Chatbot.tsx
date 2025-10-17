import React, { useState, useEffect, useRef, useContext } from 'react';
import { getChatbotResponse } from '../services/geminiService';
import type { ChatMessage, Page } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';

const CHAT_HISTORY_KEY = 'agriYieldChatHistory';

interface ChatbotProps {
    setCurrentPage: (page: Page) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ setCurrentPage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t, locale } = useContext(LanguageContext)!;
    
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
            return savedHistory ? JSON.parse(savedHistory) : [{ sender: 'bot', text: t('chatbot.greeting') }];
        } catch (error) {
            return [{ sender: 'bot', text: t('chatbot.greeting') }];
        }
    });

    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatboxRef = useRef<HTMLDivElement>(null);

    // Effect to scroll to the bottom of the chatbox when messages change
    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [messages]);

    // Effect to save chat history to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error("Failed to save chat history:", error);
        }
    }, [messages]);
    
    // Effect to update initial greeting when language changes
    useEffect(() => {
        setMessages(currentMessages => {
           if(currentMessages.length <= 1) {
             return [{ sender: 'bot', text: t('chatbot.greeting') }];
           }
           return currentMessages;
        });
    }, [t]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const historyForApi = updatedMessages.slice(1); // Exclude initial greeting
            const botResponse = await getChatbotResponse(historyForApi, userInput, locale);
            
            setMessages(prev => [...prev, { sender: 'bot', text: botResponse.response }]);

            if (botResponse.page) {
                setCurrentPage(botResponse.page);
                setIsOpen(false);
            }
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: 'An error occurred.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Window */}
            <div className={`fixed bottom-24 right-4 sm:right-6 md:right-8 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 transition-transform transition-opacity duration-300 ease-in-out z-50 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                {/* Header */}
                <div className="bg-green-700 text-white p-3 flex justify-between items-center rounded-t-xl">
                    <h3 className="font-bold text-lg">{t('chatbot.header')}</h3>
                    <button onClick={() => setIsOpen(false)} className="text-white hover:bg-green-600 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Messages */}
                <div ref={chatboxRef} className="h-96 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="px-4 py-3 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Form */}
                <div className="border-t p-3 bg-white rounded-b-xl">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={t('chatbot.placeholder')}
                            className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* Floating Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-4 sm:right-6 md:right-8 bg-green-700 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-green-800 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 z-50"
                aria-label="Toggle Chat"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                )}
            </button>
        </>
    );
};

export default Chatbot;