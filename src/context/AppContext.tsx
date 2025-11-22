import { createContext, useContext, useState, ReactNode } from 'react';

export type EmergencyContact = {
  name: string;
  phone: string;
};

export type LocationPoint = {
  lat: number;
  lng: number;
};

export type RideSummaryInput = {
  start: LocationPoint;
  destination: LocationPoint;
};

interface AppContextType {
  currentScreen: string;
  userRole: 'driver' | 'rider' | null;
  userName: string;
  userEmail: string;
  userPhone: string;
  authToken: string | null;
  emergencyContacts: EmergencyContact[];
  activeRideId: string | null;
  rideSummaryInput: RideSummaryInput | null;
  navigateTo: (screen: string) => void;
  setRole: (role: 'driver' | 'rider') => void;
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setUserPhone: (phone: string) => void;
  setAuthToken: (token: string | null) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  setActiveRideId: (rideId: string | null) => void;
  setRideSummaryInput: (input: RideSummaryInput | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [userRole, setUserRole] = useState<'driver' | 'rider' | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(() => {
    // Load token from localStorage on init
    return localStorage.getItem('authToken');
  });
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [rideSummaryInput, setRideSummaryInput] = useState<RideSummaryInput | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: 'Priya Verma', phone: '+1 (555) 123-4567' },
    { name: 'Michael Chen', phone: '+1 (555) 987-6543' },
    { name: 'David Lee', phone: '+1 (555) 222-8899' },
  ]);

  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
  };

  const setRole = (role: 'driver' | 'rider') => {
    setUserRole(role);
  };

  const logout = () => {
    setAuthToken(null);
    setUserRole(null);
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    localStorage.removeItem('authToken');
    navigateTo('landing');
  };

  // Update localStorage when token changes
  const handleSetAuthToken = (token: string | null) => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        userRole,
        userName,
        userEmail,
        userPhone,
        authToken,
        emergencyContacts,
        activeRideId,
        rideSummaryInput,
        navigateTo,
        setRole,
        setUserName,
        setUserEmail,
        setUserPhone,
        setAuthToken: handleSetAuthToken,
        setEmergencyContacts,
        setActiveRideId,
        setRideSummaryInput,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
