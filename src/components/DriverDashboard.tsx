import { useState } from 'react';
import { MapPin, Calendar, Clock, User, CheckCircle, XCircle, ChevronDown, ChevronUp, Car, Plus } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { useApp } from '../context/AppContext';

interface RideRequest {
    id: string;
    riderName: string;
    riderRating: number;
    pickup: string;
    dropoff: string;
    date: string;
    time: string;
    seats: number;
    price: number;
    status: 'pending' | 'accepted' | 'rejected';
}

interface DriverDashboardProps {
    userName: string;
}

export default function DriverDashboard({ userName }: DriverDashboardProps) {
    const { navigateTo } = useApp();
    const [activeTab, setActiveTab] = useState<'requests' | 'upcoming' | 'completed'>('requests');
    const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

    // Mock data - replace with API calls
    const requests: RideRequest[] = [
        {
            id: '1',
            riderName: 'Sarah Jenkins',
            riderRating: 4.8,
            pickup: 'Central Station',
            dropoff: 'Tech Park, Sector 4',
            date: 'Today',
            time: '09:30 AM',
            seats: 1,
            price: 150,
            status: 'pending',
        },
        {
            id: '2',
            riderName: 'Mike Chen',
            riderRating: 4.5,
            pickup: 'Green Valley Apts',
            dropoff: 'City Mall',
            date: 'Today',
            time: '10:15 AM',
            seats: 2,
            price: 280,
            status: 'pending',
        },
    ];

    const upcomingRides = [
        {
            id: '3',
            riderName: 'Priya Sharma',
            pickup: 'University Campus',
            dropoff: 'Airport Terminal 2',
            date: 'Tomorrow',
            time: '06:00 AM',
            seats: 1,
            price: 450,
            status: 'accepted',
        }
    ];

    const toggleRequest = (id: string) => {
        setExpandedRequest(expandedRequest === id ? null : id);
    };

    const handleAccept = (id: string) => {
        console.log('Accepted request:', id);
        // Add API call
    };

    const handleReject = (id: string) => {
        console.log('Rejected request:', id);
        // Add API call
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black">My Rides</h2>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigateTo('vehicles')}
                    className="flex items-center gap-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                >
                    <Plus size={16} />
                    Add Vehicle
                </Button>
            </div>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit border-2 border-transparent">
                {(['requests', 'upcoming', 'completed'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab
                                ? 'bg-white text-black shadow-sm border-2 border-black'
                                : 'text-gray-500 hover:text-black'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {activeTab === 'requests' && (
                    <>
                        {requests.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500">No new ride requests</p>
                            </div>
                        ) : (
                            requests.map((request) => (
                                <Card key={request.id} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 cursor-pointer" onClick={() => toggleRequest(request.id)}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg text-black">{request.riderName}</h3>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <User size={14} className="mr-1" />
                                                        <span>{request.riderRating} ★</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg text-black">₹{request.price}</p>
                                                    <p className="text-xs text-gray-500">{request.seats} seat{request.seats > 1 ? 's' : ''}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                <div className="flex items-center">
                                                    <Calendar size={14} className="mr-1" />
                                                    {request.date}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock size={14} className="mr-1" />
                                                    {request.time}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-black" />
                                                    <p className="text-sm font-medium text-gray-900">{request.pickup}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                                                    <p className="text-sm text-gray-600">{request.dropoff}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-4 flex flex-col gap-2">
                                            <button
                                                onClick={() => handleAccept(request.id)}
                                                className="p-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                                                title="Accept"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.id)}
                                                className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                                                title="Reject"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </>
                )}

                {activeTab === 'upcoming' && (
                    <div className="space-y-4">
                        {upcomingRides.map((ride) => (
                            <Card key={ride.id} className="border-2 border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Confirmed
                                    </span>
                                    <p className="font-bold">₹{ride.price}</p>
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold">{ride.riderName}</p>
                                        <p className="text-xs text-gray-500">Passenger</p>
                                    </div>
                                </div>
                                <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Pickup</p>
                                        <p className="font-medium">{ride.pickup}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Dropoff</p>
                                        <p className="font-medium">{ride.dropoff}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'completed' && (
                    <div className="text-center py-12">
                        <Button variant="outline" onClick={() => navigateTo('ride-history')}>
                            View Full Ride History
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
