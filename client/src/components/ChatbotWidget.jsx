import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, AlertCircle } from 'lucide-react';
import { chatbotAPI } from '../services/api';
import './ChatbotWidget.css';

const QUICK_QUESTIONS = [
    'What are common side effects of Ibuprofen?',
    'How to book an appointment?',
    'What is the dosage for Paracetamol?',
    'Can I take Aspirin with blood thinners?',
];

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "👋 Hello! I'm **MediBot**, your AI health assistant.\n\nI can help you with medicine information, dosage queries, and appointment guidance.\n\n⚠️ *Disclaimer: I provide general information only. Always consult a qualified healthcare professional for medical advice.*",
            time: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isMinimized]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        setError('');
        const userMsg = { id: Date.now(), type: 'user', text, time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await chatbotAPI.sendMessage(text);

            // Handle response data
            const botText = response.data?.text || response.data?.message || "I couldn't generate a response. Please try again.";

            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: botText,
                time: new Date(),
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error('Chatbot error:', err);
            const errMessage = err.response?.data?.text || err.response?.data?.error || 'Failed to connect to AI. Please try again.';
            setError(errMessage);

            const errorMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: `⚠️ ${errMessage}`,
                time: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const formatText = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br/>');
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chatbot-container">
            {/* Chat Window */}
            {isOpen && (
                <div className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}>
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <Bot size={18} />
                            </div>
                            <div>
                                <div className="chatbot-name">MediBot</div>
                                <div className="chatbot-status">
                                    <span className="status-dot online" />
                                    AI Health Assistant
                                </div>
                            </div>
                        </div>
                        <div className="chatbot-header-actions">
                            <button onClick={() => setIsMinimized(!isMinimized)} className="chatbot-action-btn">
                                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="chatbot-action-btn">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Disclaimer */}
                            <div className="chatbot-disclaimer">
                                <AlertCircle size={12} />
                                <span>For informational purposes only. Not medical advice.</span>
                            </div>

                            {/* Messages */}
                            <div className="chatbot-messages">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`chatbot-message ${msg.type}`}>
                                        {msg.type === 'bot' && (
                                            <div className="chatbot-msg-avatar">
                                                <Bot size={14} />
                                            </div>
                                        )}
                                        <div className="chatbot-msg-content">
                                            <div
                                                className="chatbot-msg-bubble"
                                                dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                                            />
                                            <div className="chatbot-msg-time">{formatTime(msg.time)}</div>
                                        </div>
                                        {msg.type === 'user' && (
                                            <div className="chatbot-msg-avatar user">
                                                <User size={14} />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="chatbot-message bot">
                                        <div className="chatbot-msg-avatar">
                                            <Bot size={14} />
                                        </div>
                                        <div className="chatbot-typing">
                                            <span /><span /><span />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Questions */}
                            <div className="chatbot-quick">
                                {QUICK_QUESTIONS.map((q, i) => (
                                    <button key={i} className="chatbot-quick-btn" onClick={() => sendMessage(q)}>
                                        {q}
                                    </button>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="chatbot-input-area">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                                    placeholder="Ask about medicines, dosage..."
                                    className="chatbot-input"
                                />
                                <button
                                    className="chatbot-send-btn"
                                    onClick={() => sendMessage(input)}
                                    disabled={!input.trim() || isTyping}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            <button
                className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
                title="AI Health Assistant"
            >
                {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
                {!isOpen && <span className="chatbot-toggle-badge">AI</span>}
            </button>
        </div>
    );
}
