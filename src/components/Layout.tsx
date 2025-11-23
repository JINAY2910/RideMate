import { ReactNode } from 'react';
import Footer from './Footer';

interface LayoutProps {
    children: ReactNode;
    fullWidth?: boolean;
    className?: string;
}

export default function Layout({ children, fullWidth = false, className = 'bg-gray-50' }: LayoutProps) {
    return (
        <div className={`min-h-screen flex flex-col font-sans text-gray-900 ${className}`}>
            <div className={`flex-grow ${!fullWidth ? 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8' : ''}`}>
                {children}
            </div>
            <Footer />
        </div>
    );
}
