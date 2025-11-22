const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

// Log API base URL in development (helps debug configuration issues)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE);
}

const buildQueryString = (params?: Record<string, string | number | undefined | null>) => {
  if (!params) return '';
  const query = Object.entries(params).reduce<string[]>((acc, [key, value]) => {
    if (value === undefined || value === null || value === '') return acc;
    acc.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    return acc;
  }, []);
  return query.length ? `?${query.join('&')}` : '';
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch (e) {
      errorText = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }
  try {
    return await response.json() as Promise<T>;
  } catch (e) {
    throw new Error('Invalid JSON response from server');
  }
};

export type RideRequest = {
  _id: string;
  name: string;
  rating: number;
  status: 'Approved' | 'Pending';
};

export type Ride = {
  _id: string;
  id: string;
  driver: {
    name: string;
    rating: number;
  };
  start: {
    label: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  destination: {
    label: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  date: string;
  time: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Confirmed';
  seats: {
    total: number;
    available: number;
  };
  notes?: string;
  requests: RideRequest[];
  participants?: Array<{
    name: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type RideCreatePayload = {
  driverName: string;
  driverRating?: number;
  start: {
    label: string;
    lat: number;
    lng: number;
  };
  destination: {
    label: string;
    lat: number;
    lng: number;
  };
  date: string;
  time: string;
  seats: number;
  notes?: string;
};

export type RideQueryParams = {
  from?: string;
  to?: string;
  nearStart?: string; // Location name for geo-search
  nearDest?: string; // Location name for geo-search
  radius?: number; // Search radius in meters (default: 50000)
  date?: string;
  status?: string;
  driver?: string;
  participant?: string;
  limit?: number;
};

export const rideApi = {
  async list(params?: RideQueryParams) {
    try {
      const response = await fetch(`${API_BASE}/rides${buildQueryString(params)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return handleResponse<Ride[]>(response);
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Failed to fetch: Unable to connect to the server. Please check if the server is running.');
      }
      throw error;
    }
  },

  async create(payload: RideCreatePayload) {
    const response = await fetch(`${API_BASE}/rides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Ride>(response);
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE}/rides/${id}`);
    return handleResponse<Ride>(response);
  },

  async updateStatus(id: string, status: Ride['status']) {
    const response = await fetch(`${API_BASE}/rides/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<Ride>(response);
  },

  async addRequest(id: string, payload: { name: string; rating?: number; status?: 'Approved' | 'Pending' }) {
    const response = await fetch(`${API_BASE}/rides/${id}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Ride>(response);
  },
};

