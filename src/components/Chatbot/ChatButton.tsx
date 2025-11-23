import React from 'react';
import { MessageSquare } from 'lucide-react';

interface ChatButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick, isOpen }) => {
    if (isOpen) return null; // Hide button when panel is open

    return (
        <button
            onClick={onClick}
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                width: '60px',
                height: '60px',
                borderRadius: '30px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 9999,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            aria-label="Open AI Assistant"
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>AI</span>
            </div>
        </button>
    );
};

export default ChatButton;
