import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const FloatingActionButton: React.FC = () => {
    const { navigateTo } = useApp();

    return (
        <button
            onClick={() => navigateTo('signup')}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-black text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 group cursor-hover"
        >
            <span className="font-bold text-sm uppercase tracking-wider">Get Started</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
    );
};

export default FloatingActionButton;
