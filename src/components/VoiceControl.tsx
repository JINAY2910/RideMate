import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VoiceControl() {
    const { navigateTo } = useApp();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [supported, setSupported] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setSupported(false);
        }
    }, []);

    const toggleListening = () => {
        if (!supported) {
            alert('Voice control is not supported in this browser.');
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.toLowerCase().trim();
            setTranscript(command);
            processCommand(command);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.start();
    };

    const processCommand = (command: string) => {
        console.log('Voice Command:', command);

        if (command.includes('dashboard') || command.includes('home')) {
            navigateTo('dashboard');
        } else if (command.includes('find') || command.includes('search')) {
            navigateTo('search-ride');
        } else if (command.includes('create') || command.includes('offer') || command.includes('post')) {
            navigateTo('create-ride');
        } else if (command.includes('history') || command.includes('rides')) {
            navigateTo('ride-history'); // Or whatever the history route is
        } else if (command.includes('profile') || command.includes('account')) {
            navigateTo('profile');
        } else if (command.includes('chat') || command.includes('message')) {
            navigateTo('chat');
        } else {
            // Optional: Feedback for unknown command
            // alert(`Unknown command: ${command}`);
        }
    };

    if (!supported) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isListening && (
                <div className="absolute bottom-full mb-2 right-0 bg-black text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap animate-pulse">
                    Listening...
                </div>
            )}
            <button
                onClick={toggleListening}
                className={`p-4 rounded-full shadow-lg transition-all transform hover:scale-105 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-black text-white'
                    }`}
                title="Voice Control"
            >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
        </div>
    );
}
