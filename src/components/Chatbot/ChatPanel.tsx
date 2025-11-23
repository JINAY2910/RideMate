import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { askGemini } from '../../utils/geminiChat';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: "Hello! I'm your RideMate AI assistant. How can I help you today?",
            sender: 'ai',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const responseText = await askGemini(inputValue);
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Failed to get response', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I encountered an error. Please try again.",
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                height: '100vh',
                width: '320px',
                backgroundColor: '#fff',
                boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)',
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: '20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#000',
                    color: '#fff',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bot size={20} />
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>RideMate AI</h2>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    aria-label="Close chat"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    backgroundColor: '#f9f9f9',
                }}
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        }}
                    >
                        <div
                            style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                backgroundColor: msg.sender === 'user' ? '#000' : '#fff',
                                color: msg.sender === 'user' ? '#fff' : '#000',
                                border: msg.sender === 'ai' ? '1px solid #e0e0e0' : 'none',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                borderTopLeftRadius: msg.sender === 'ai' ? '2px' : '12px',
                            }}
                        >
                            {msg.text}
                        </div>
                        <span
                            style={{
                                fontSize: '10px',
                                color: '#888',
                                marginTop: '4px',
                                marginLeft: '4px',
                                marginRight: '4px',
                            }}
                        >
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', padding: '10px', color: '#666', fontSize: '12px', fontStyle: 'italic' }}>
                        AI is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
                style={{
                    padding: '16px',
                    borderTop: '1px solid #eee',
                    backgroundColor: '#fff',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                }}
            >
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about safety, routes..."
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '24px',
                        border: '1px solid #ddd',
                        outline: 'none',
                        fontSize: '14px',
                        backgroundColor: '#f5f5f5',
                    }}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: inputValue.trim() ? '#000' : '#ccc',
                        color: '#fff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: inputValue.trim() ? 'pointer' : 'default',
                        transition: 'background-color 0.2s',
                    }}
                    aria-label="Send message"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatPanel;
