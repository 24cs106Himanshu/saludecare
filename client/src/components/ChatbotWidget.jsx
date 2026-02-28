import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, AlertCircle } from 'lucide-react';
import './ChatbotWidget.css';

const QUICK_QUESTIONS = [
    'What are common side effects of Ibuprofen?',
    'How to book an appointment?',
    'What is the dosage for Paracetamol?',
    'Can I take Aspirin with blood thinners?',
];

const BOT_RESPONSES = {
    default: "I'm your Medicare AI assistant. I can help with medicine queries, dosage information, and appointment guidance. Please note that this is for informational purposes only and not a substitute for professional medical advice.",
    ibuprofen: "**Ibuprofen common side effects include:**\n• Stomach upset or pain\n• Nausea or vomiting\n• Headache\n• Dizziness\n\n⚠️ *Always consult your doctor before taking any medication.*",
    paracetamol: "**Paracetamol (Acetaminophen) dosage:**\n• Adults: 500mg–1000mg every 4–6 hours\n• Maximum: 4000mg per day\n• Children: Based on weight (consult doctor)\n\n⚠️ *Do not exceed recommended dose.*",
    appointment: "**To book an appointment:**\n1. Go to 'Appointments' in your dashboard\n2. Select a doctor and specialty\n3. Choose your preferred date and time\n4. Confirm your booking\n\nYou'll receive a confirmation notification!",
    aspirin: "**Aspirin with blood thinners:**\n⚠️ This combination can significantly increase bleeding risk.\n\nPlease consult your doctor or cardiologist before combining these medications. This is a serious drug interaction that requires medical supervision.",
};

function getBotResponse(message) {
    const lower = message.toLowerCase();
    if (lower.includes('ibuprofen')) return BOT_RESPONSES.ibuprofen;
    if (lower.includes('paracetamol') || lower.includes('acetaminophen')) return BOT_RESPONSES.paracetamol;
    if (lower.includes('appointment') || lower.includes('book')) return BOT_RESPONSES.appointment;
    if (lower.includes('aspirin') || lower.includes('blood thinner')) return BOT_RESPONSES.aspirin;
    return BOT_RESPONSES.default;
}

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
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isMinimized]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;
        const userMsg = { id: Date.now(), type: 'user', text, time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

        const botMsg = {
            id: Date.now() + 1,
            type: 'bot',
            text: getBotResponse(text),
            time: new Date(),
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
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
