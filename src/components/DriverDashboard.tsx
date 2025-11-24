import { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, User, CheckCircle, XCircle, ChevronDown, ChevronUp, Car, Plus, Trash2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { useApp } from '../context/AppContext';
import { rideApi, Ride } from '../services/rides';

interface DriverDashboardProps {
    userName: string;
}

export default function DriverDashboard({ userName }: DriverDashboardProps) {
    const { navigateTo, userId, setActiveRideId, setRideSummaryInput } = useApp();
    const [activeTab, setActiveTab] = useState<'my-rides' | 'requests'>('my-rides');
    const [myRides, setMyRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchMyRides();
        }
    }, [userId]);

    const fetchMyRides = async () => {
        try {
            setLoading(true);
            // Fetch rides where current user is the driver
            const rides = await rideApi.list({ driver: userId || undefined });
            setMyRides(rides);
        } catch (error) {
            console.error('Error fetching my rides:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (rideId: string, requestId: string) => {
        try {
            await rideApi.updateRequestStatus(rideId, requestId, 'Approved');
            // Refresh rides to show updated status
            fetchMyRides();
        } catch (error) {
            console.error('Error accepting request:', error);
            alert('Failed to accept request');
        }
    };

    const handleRejectRequest = async (rideId: string, requestId: string) => {
        if (window.confirm('Are you sure you want to reject this request?')) {
            try {
                await rideApi.updateRequestStatus(rideId, requestId, 'Rejected');
                fetchMyRides();
            } catch (error) {
                console.error('Error rejecting request:', error);
                alert('Failed to reject request');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black">Driver Dashboard</h2>
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
                <button
                    onClick={() => setActiveTab('my-rides')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === 'my-rides'
                        ? 'bg-white text-black shadow-sm border-2 border-black'
                        : 'text-gray-500 hover:text-black'
                        }`}
                >
                    My Rides
                </button>
            </div>

            <div className="space-y-4">
                {activeTab === 'my-rides' && (
                    <>
                        {loading ? (
                            <div className="text-center py-12">Loading rides...</div>
                        ) : myRides.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 mb-4">You haven't created any rides yet.</p>
                                <Button onClick={() => navigateTo('create-ride')}>
                                    Create a Ride
                                </Button>
                            </div>
                        ) : (
                            myRides.map((ride) => (
                                <Card key={ride._id} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg text-black">
                                                        {ride.start.label} → {ride.destination.label}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${ride.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                            ride.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {ride.status}
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            {ride.seats.available} seats left
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <Calendar size={14} className="mr-1" />
                                                            {ride.date}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock size={14} className="mr-1" />
                                                            {ride.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Joined Riders Section */}
                                    {ride.participants && ride.participants.length > 0 && (
                                        <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-100">
                                            <h4 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                                                <User size={16} />
                                                Riders Joined ({ride.participants.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {ride.participants.map((participant, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg border border-green-100">
                                                        <div>
                                                            <span className="font-semibold text-black">{participant.name}</span>
                                                            <span className="text-gray-500 ml-2">({participant.seatsBooked} seat{participant.seatsBooked > 1 ? 's' : ''})</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                            Confirmed
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Pending Requests Section */}
                                    {ride.requests && ride.requests.some(r => r.status === 'Pending') && (
                                        <div className="mb-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                            <h4 className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                                                <User size={16} />
                                                Pending Requests
                                            </h4>
                                            <div className="space-y-3">
                                                {ride.requests.filter(r => r.status === 'Pending').map((request) => (
                                                    <div key={request._id} className="bg-white p-3 rounded-lg border border-yellow-200 shadow-sm">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <p className="font-bold text-black">{request.name}</p>
                                                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                                                    <span>Rating: {request.rating} ★</span>
                                                                    <span className="mx-1">•</span>
                                                                    <span>Requested {request.seatsRequested} seat{request.seatsRequested > 1 ? 's' : ''}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleAcceptRequest(ride._id, request._id)}
                                                                className="flex-1 bg-green-600 text-white py-1.5 px-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <CheckCircle size={14} />
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectRequest(ride._id, request._id)}
                                                                className="flex-1 bg-red-50 text-red-600 border border-red-200 py-1.5 px-3 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <XCircle size={14} />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex gap-2 border-t pt-4 border-gray-100">
                                        <Button size="sm" fullWidth onClick={() => handleViewRide(ride)}>
                                            Manage Ride
                                        </Button>
                                        <button
                                            onClick={() => handleDeleteRide(ride._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Ride"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
