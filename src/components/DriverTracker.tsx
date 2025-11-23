import React, { useEffect, useState } from 'react';
import { initSocket, joinRide, updateLocation } from '../services/socket';

interface DriverTrackerProps {
    rideId: string;
}

const DriverTracker: React.FC<DriverTrackerProps> = ({ rideId }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: 51.505, lng: -0.09 });

    useEffect(() => {
        initSocket();
        joinRide(rideId);
    }, [rideId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isTracking) {
            interval = setInterval(() => {
                // Simulate movement
                setPosition((prev) => {
                    const newLat = prev.lat + (Math.random() - 0.5) * 0.001;
                    const newLng = prev.lng + (Math.random() - 0.5) * 0.001;
                    const newPos = { lat: newLat, lng: newLng };

                    updateLocation(rideId, newPos);
                    console.log('Sent location update:', newPos);
                    return newPos;
                });
            }, 3000); // Send update every 3 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTracking, rideId]);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Driver Tracker Simulation</h3>
            <div className="mb-4">
                <p className="text-sm text-gray-600">Current Position:</p>
                <p className="font-mono text-xs">Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}</p>
            </div>
            <button
                onClick={() => setIsTracking(!isTracking)}
                className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
            >
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>
        </div>
    );
};

export default DriverTracker;
