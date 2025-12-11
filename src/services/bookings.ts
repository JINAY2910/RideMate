import { API_BASE_URL } from '../config/api';

const API_BASE = `${API_BASE_URL}/api`;

const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        let errorText = '';
        try {
            errorText = await response.text();
        } catch {
            errorText = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorText || `Request failed with status ${response.status}`);
    }
    try {
        return await response.json() as Promise<T>;
    } catch {
        throw new Error('Invalid JSON response from server');
    }
};

export type Booking = {
    _id: string;
    ride: {
        _id: string;
        from: string;
        to: string;
        date: string;
        time: string;
        duration?: number;
        isActive?: boolean;
        driver: {
            name: string;
            phone?: string;
            email?: string;
            verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
        };
        vehicle?: {
            registrationNumber: string;
            model: string;
            make: string;
            color: string;
        };
        rideStatus?: 'upcoming' | 'started' | 'completed' | 'cancelled';
    };
    rider: {
        _id: string;
        name: string;
    };
    seatsBooked: number;
    totalPrice: number;
    status: 'Pending' | 'Accepted' | 'Approved' | 'Rejected' | 'Cancelled';
    bookingDate: string;
};

export const bookingApi = {
    async getMyBookings() {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication required.');
        }
        const response = await fetch(`${API_BASE}/bookings/me`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        const result = await handleResponse<{ success: true; data: Booking[] }>(response);
        return result.data;
    },
};
