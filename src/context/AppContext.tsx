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

export type Vehicle = {
  _id: string;
  registrationNumber: string;
  seatingLimit: number;
  vehicleType: '2-wheeler' | '3-wheeler' | '4-wheeler';
  make?: string;
  model?: string;
  color?: string;
  createdAt: string;
};

export type RideSchedule = {
  rideId: string;
  days: string[];
  time: string;
  startLocation: LocationPoint;
  destinationLocation: LocationPoint;
  vehicleId: string;
  seats: number;
  notes?: string;
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
  vehicles: Vehicle[];
  rideVehicles: Record<string, string>; // Maps rideId to vehicleId
  rideSchedules: RideSchedule[]; // Weekly schedules
  navigateTo: (screen: string) => void;
  setRole: (role: 'driver' | 'rider') => void;
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setUserPhone: (phone: string) => void;
  setAuthToken: (token: string | null) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  setActiveRideId: (rideId: string | null) => void;
  setRideSummaryInput: (input: RideSummaryInput | null) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Omit<Vehicle, '_id' | 'createdAt'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  setRideVehicle: (rideId: string, vehicleId: string) => void;
  addRideSchedule: (schedule: RideSchedule) => void;
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rideVehicles, setRideVehicles] = useState<Record<string, string>>({});
  const [rideSchedules, setRideSchedules] = useState<RideSchedule[]>([]);

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
    setVehicles([]);
    setRideVehicles({});
    setRideSchedules([]);
    localStorage.removeItem('authToken');
    navigateTo('landing');
  };

  const addVehicle = (vehicle: Omit<Vehicle, '_id' | 'createdAt'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      _id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setVehicles([...vehicles, newVehicle]);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(vehicles.map(v => v._id === id ? { ...v, ...updates } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v._id !== id));
  };

  const setRideVehicle = (rideId: string, vehicleId: string) => {
    setRideVehicles(prev => ({ ...prev, [rideId]: vehicleId }));
  };

  const addRideSchedule = (schedule: RideSchedule) => {
    setRideSchedules(prev => [...prev, schedule]);
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
        vehicles,
        navigateTo,
        setRole,
        setUserName,
        setUserEmail,
        setUserPhone,
        setAuthToken: handleSetAuthToken,
        setEmergencyContacts,
        setActiveRideId,
        setRideSummaryInput,
        setVehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        rideVehicles,
        setRideVehicle,
        rideSchedules,
        addRideSchedule,
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
