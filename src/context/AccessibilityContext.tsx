import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
    isSeniorMode: boolean;
    toggleSeniorMode: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isSeniorMode, setIsSeniorMode] = useState<boolean>(() => {
        const savedMode = localStorage.getItem('seniorMode');
        return savedMode === 'true';
    });

    useEffect(() => {
        localStorage.setItem('seniorMode', String(isSeniorMode));
        if (isSeniorMode) {
            document.documentElement.classList.add('senior-mode');
        } else {
            document.documentElement.classList.remove('senior-mode');
        }
    }, [isSeniorMode]);

    const toggleSeniorMode = () => {
        setIsSeniorMode((prev) => !prev);
    };

    return (
        <AccessibilityContext.Provider value={{ isSeniorMode, toggleSeniorMode }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = (): AccessibilityContextType => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};
