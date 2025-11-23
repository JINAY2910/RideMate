import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { vehicleApi } from '../services/vehicles';

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
  userId: string | null;
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
  setUserId: (id: string | null) => void;
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setUserPhone: (phone: string) => void;
  setAuthToken: (token: string | null) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  setActiveRideId: (rideId: string | null) => void;
  setRideSummaryInput: (input: RideSummaryInput | null) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Omit<Vehicle, '_id' | 'createdAt'>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  setRideVehicle: (rideId: string, vehicleId: string) => void;
  addRideSchedule: (schedule: RideSchedule) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [userRole, setUserRole] = useState<'driver' | 'rider' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
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

  // Fetch vehicles when user is a driver and has a token
  useEffect(() => {
    if (userRole === 'driver' && authToken) {
      vehicleApi.list()
        .then(response => {
          if (response.success) {
            setVehicles(response.vehicles);
          }
        })
        .catch(err => console.error('Failed to fetch vehicles:', err));
    } else if (!authToken) {
      setVehicles([]);
    }
  }, [userRole, authToken]);

  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
  };

  const setRole = (role: 'driver' | 'rider') => {
    setUserRole(role);
  };

  const logout = () => {
    setAuthToken(null);
    setUserRole(null);
    setUserId(null);
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setVehicles([]);
    setRideVehicles({});
    setRideSchedules([]);
    localStorage.removeItem('authToken');
    navigateTo('landing');
  };

  const addVehicle = async (vehicle: Omit<Vehicle, '_id' | 'createdAt'>) => {
    try {
      const response = await vehicleApi.create(vehicle);
      if (response.success) {
        setVehicles([...vehicles, response.vehicle]);
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    try {
      const response = await vehicleApi.update(id, updates);
      if (response.success) {
        setVehicles(vehicles.map(v => v._id === id ? response.vehicle : v));
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await vehicleApi.delete(id);
      setVehicles(vehicles.filter(v => v._id !== id));
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
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
        userId,
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
        setUserId,
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
