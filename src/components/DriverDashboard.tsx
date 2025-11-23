import { useState, useEffect } from 'react';
import { rideApi, Ride, RideRequest } from '../services/rides';
import Card from './Card';
import Button from './Button';
import { Clock, Users, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import RiderProfileModal from './RiderProfileModal';

export default function DriverDashboard({ userName }: { userName: string }) {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRideId, setExpandedRideId] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<{ rideId: string; request: RideRequest } | null>(null);
    const [activeTab, setActiveTab] = useState<'Active' | 'Completed'>('Active');

    const fetchRides = async () => {
        try {
            setLoading(true);
            const data = await rideApi.list({ driver: userName });
            setRides(data);
        } catch (err) {
            console.error('Failed to fetch rides:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRides();
    }, [userName]);

    const toggleRide = (rideId: string) => {
        setExpandedRideId(expandedRideId === rideId ? null : rideId);
    };

    const handleRequestAction = async (rideId: string, requestId: string, status: 'Approved' | 'Rejected') => {
        try {
            await rideApi.updateRequestStatus(rideId, requestId, status);
            fetchRides(); // Refresh data
            setSelectedRequest(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update request');
        }
    };

    const filteredRides = rides.filter(ride => {
        if (activeTab === 'Active') return ride.status === 'Active' || ride.status === 'Pending' || ride.status === 'Confirmed';
        return ride.status === 'Completed';
    });

    if (loading) return <div className="text-center py-8">Loading your rides...</div>;

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-black">My Rides</h2>
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                        {(['Active', 'Completed'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === tab
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredRides.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                        <p className="text-gray-500">No {activeTab.toLowerCase()} rides found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRides.map((ride) => (
                            <Card key={ride._id} className="transition-all duration-300">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${ride.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {ride.status}
                                            </span>
                                            <span className="text-sm text-gray-500">{new Date(ride.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 font-semibold text-lg">
                                            <span>{ride.start.label}</span>
                                            <span className="text-gray-400">→</span>
                                            <span>{ride.destination.label}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Clock size={16} />
                                                {ride.date} • {ride.time}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users size={16} />
                                                {ride.seats.available} seats left
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <Button
                                            variant="outline"
                                            onClick={() => toggleRide(ride._id)}
                                            className="flex items-center gap-2"
                                        >
                                            {ride.requests.length > 0 ? `View Requests (${ride.requests.length})` : 'No Requests'}
                                            {expandedRideId === ride._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded Requests Section */}
                                {expandedRideId === ride._id && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4">Ride Requests</h3>
                                        {ride.requests.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">No requests received yet.</p>
                                        ) : (
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {ride.requests.map((request) => (
                                                    <div key={request._id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                                                        <div>
                                                            <p className="font-bold text-black">{request.name}</p>
                                                            <p className="text-xs text-gray-500">Requested {request.seatsRequested} seat(s)</p>
                                                            <div className="mt-1">
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                                        request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                                            'bg-yellow-100 text-yellow-700'
                                                                    }`}>
                                                                    {request.status}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {request.status === 'Pending' && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleRequestAction(ride._id, request._id, 'Approved')}
                                                                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                                    title="Accept"
                                                                >
                                                                    <Check size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRequestAction(ride._id, request._id, 'Rejected')}
                                                                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                                    title="Reject"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setSelectedRequest({ rideId: ride._id, request })}
                                                                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                                                    title="View Profile"
                                                                >
                                                                    <Users size={18} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {selectedRequest && (
                <RiderProfileModal
                    rider={selectedRequest.request.rider}
                    rating={selectedRequest.request.rating}
                    onAccept={() => handleRequestAction(selectedRequest.rideId, selectedRequest.request._id, 'Approved')}
                    onReject={() => handleRequestAction(selectedRequest.rideId, selectedRequest.request._id, 'Rejected')}
                    onClose={() => setSelectedRequest(null)}
                />
            )}
        </div>
    );
}
