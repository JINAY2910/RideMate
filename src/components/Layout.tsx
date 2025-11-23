import { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    className?: string;
    fullWidth?: boolean;
}

export default function Layout({ children, className = '', fullWidth = false }: LayoutProps) {
    if (fullWidth) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div className={`min-h-screen w-full ${className}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </div>
    );
}
