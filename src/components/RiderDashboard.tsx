import { useState, useEffect } from 'react';
import { bookingApi, Booking } from '../services/bookings';
import Card from './Card';
import { User, Car } from 'lucide-react';
import { useApp } from '../context/AppContext';


const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return null;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return <span className="text-red-600 font-bold">Ride Started</span>;

    return (
        <div className="flex gap-2 text-center">
            {Object.entries(timeLeft).map(([unit, value]) => {
                if (unit === 'days' && value === 0) return null;
                return (
                    <div key={unit} className="bg-black text-white px-2 py-1 rounded-md min-w-[3rem]">
                        <div className="text-lg font-bold leading-none">{value}</div>
                        <div className="text-[10px] uppercase opacity-75">{unit}</div>
                    </div>
                );
            })}
        </div>
    );
};



export default function RiderDashboard() {
    const { navigateTo } = useApp();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Requests' | 'History'>('Requests');

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

    const upcomingRides = bookings.filter(b => {
        if (!b.ride) return false;
        const rideDate = new Date(`${b.ride.date}T${b.ride.time}`);
        return (b.status === 'Accepted' || b.status === 'Approved') && rideDate > new Date();
    });

    const otherBookings = bookings.filter(b => {
        if (!b.ride) return false;
        const rideDate = new Date(`${b.ride.date}T${b.ride.time}`);
        // Calculate end time based on duration (default 2 hours if not specified)
        const durationHours = b.ride.duration || 2;
        const rideEndTime = new Date(rideDate.getTime() + durationHours * 60 * 60 * 1000);

        const isPast = rideEndTime <= new Date();

        if (activeTab === 'History') {
            return isPast;
        }
        // Requests tab shows Pending and Rejected
        return !isPast && (b.status === 'Pending' || b.status === 'Rejected');
    });

    if (loading) return <div className="text-center py-8">Loading your rides...</div>;

    return (
        <div className="space-y-8 relative">
            {/* Upcoming Trips Section - Always Visible at Top */}
            <div>
                <button
                    onClick={() => navigateTo('my-rides')}
                    className="text-2xl font-bold text-black mb-4 flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
                >
                    <Car size={24} />
                    My Rides
                </button>
                {upcomingRides.length === 0 ? (
                    <button
                        onClick={() => navigateTo('my-rides')}
                        className="w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-black p-8 text-center transition-all hover:bg-gray-100"
                    >
                        <p className="text-gray-600 mb-3 font-medium">View all your rides, requests, and history</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-semibold">
                            <Car size={18} />
                            Go to My Rides
                        </div>
                    </button>
                ) : (
                    <div className="grid gap-4 md:grid-cols-1">
                        {upcomingRides.map((booking) => (
                            <Card key={booking._id} className="border-2 border-green-500 bg-green-50/30 shadow-md">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                                Confirmed
                                            </span>
                                            <span className="text-sm text-gray-600 font-medium">
                                                {booking.ride.date} • {booking.ride.time}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-black mb-1">
                                            {booking.ride.from} → {booking.ride.to}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-700 mt-3">
                                            <div className="flex items-center gap-1">
                                                <User size={16} />
                                                <span className="font-semibold">{booking.ride.driver?.name}</span>
                                            </div>
                                            {booking.ride.vehicle && (
                                                <div className="flex items-center gap-1">
                                                    <Car size={16} />
                                                    <span>{booking.ride.vehicle.model} ({booking.ride.vehicle.color})</span>
                                                    <span className="font-mono bg-white px-1 rounded border border-gray-200 text-xs">
                                                        {booking.ride.vehicle.registrationNumber}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="mb-2">
                                            <p className="text-xs text-gray-500 mb-1 text-right">Starts in:</p>
                                            <CountdownTimer targetDate={new Date(`${booking.ride.date}T${booking.ride.time}`)} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-black">₹{booking.totalPrice}</p>
                                            <p className="text-xs text-gray-500">{booking.seatsBooked} seat(s)</p>
                                        </div>
                                        {/* Add Track Ride / View Details button here if needed */}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Tabs for Requests & History */}
            <div>
                <div className="flex items-center gap-6 border-b-2 border-gray-100 mb-6">
                    {(['Requests', 'History'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-2 text-lg font-bold transition-colors relative ${activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-[-2px] left-0 w-full h-0.5 bg-black rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {otherBookings.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            No {activeTab.toLowerCase()} found.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {otherBookings.map((booking) => (
                                <Card key={booking._id} className="hover:border-black transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-black">
                                                {booking.ride.from} → {booking.ride.to}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {booking.ride.date} • {booking.ride.time}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${booking.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end text-sm">
                                        <div className="text-gray-600">
                                            {booking.seatsBooked} seat(s) • ₹{booking.totalPrice}
                                        </div>
                                        <div className="text-gray-500 text-xs">
                                            {new Date(booking.bookingDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
