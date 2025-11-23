import { useState, useEffect } from 'react';
import { bookingApi, Booking } from '../services/bookings';
import Card from './Card';
import { Clock, User, Car, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function RiderDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Pending' | 'Accepted' | 'Rejected' | 'Completed'>('Pending');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const data = await bookingApi.getMyBookings();
                setBookings(data);
            } catch (err) {
                console.error('Failed to fetch bookings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(b => {
        if (!b.ride) return false; // Skip if ride is null (e.g. deleted)

        // Parse date safely
        const rideDate = new Date(`${b.ride.date}T${b.ride.time}`);
        const now = new Date();
        // Check if ride is in the past (Completed)
        const isPast = rideDate < now;

        if (activeTab === 'Completed') {
            // Completed = Accepted AND Past
            return b.status === 'Accepted' && isPast;
        }
        if (activeTab === 'Accepted') {
            // Accepted = Accepted AND Future
            return b.status === 'Accepted' && !isPast;
        }
        // Pending/Rejected match status directly
        return b.status === activeTab;
    });

    if (loading) return <div className="text-center py-8">Loading your requests...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-black mb-6">My Ride Requests</h2>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-6 w-full max-w-xl overflow-x-auto">
                    {(['Pending', 'Accepted', 'Rejected', 'Completed'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="flex justify-center mb-4">
                            {activeTab === 'Pending' && <AlertCircle size={48} className="text-yellow-400" />}
                            {activeTab === 'Accepted' && <CheckCircle size={48} className="text-green-400" />}
                            {activeTab === 'Rejected' && <XCircle size={48} className="text-red-400" />}
                            {activeTab === 'Completed' && <CheckCircle size={48} className="text-blue-400" />}
                        </div>
                        <p className="text-gray-500 font-medium">No {activeTab.toLowerCase()} requests found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredBookings.map((booking) => (
                            <Card key={booking._id} className="hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                            <Clock size={14} />
                                            Requested on {new Date(booking.bookingDate).toLocaleDateString()}
                                        </div>
                                        <h3 className="font-bold text-lg text-black">
                                            {booking.ride.from} → {booking.ride.to}
                                        </h3>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${booking.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                        booking.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Clock size={16} className="text-gray-400" />
                                            <span>{booking.ride.date} • {booking.ride.time}</span>
                                        </div>
                                        <div className="font-semibold">
                                            ₹{booking.totalPrice} ({booking.seatsBooked} seats)
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <User size={16} className="text-gray-400" />
                                        <span>Driver: {booking.ride.driver?.name || 'Unknown Driver'}</span>
                                    </div>

                                    {booking.status === 'Accepted' && booking.ride.vehicle && (
                                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                            <p className="text-xs font-bold text-green-800 uppercase mb-2">Ride Details</p>
                                            <div className="flex items-center gap-2 text-sm text-green-900">
                                                <Car size={16} />
                                                <span>{booking.ride.vehicle.make} {booking.ride.vehicle.model} • {booking.ride.vehicle.color}</span>
                                            </div>
                                            <p className="text-sm font-bold mt-1 ml-6">{booking.ride.vehicle.registrationNumber}</p>
                                            {booking.ride.driver?.phone && (
                                                <p className="text-sm mt-2 ml-6">Contact: {booking.ride.driver.phone}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
