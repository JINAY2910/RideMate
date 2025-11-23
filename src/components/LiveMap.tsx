import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { initSocket, joinRide, subscribeToLocationUpdates, unsubscribeFromLocationUpdates } from '../services/socket';
import L from 'leaflet';

// Fix for default marker icon issue in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LiveMapProps {
    rideId: string;
}

// Component to update map center when position changes
const MapUpdater = ({ position }: { position: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(position, map.getZoom());
    }, [position, map]);
    return null;
};

const LiveMap: React.FC<LiveMapProps> = ({ rideId }) => {
    const [position, setPosition] = useState<[number, number]>([51.505, -0.09]); // Default position (London)

    useEffect(() => {
        initSocket();
        joinRide(rideId);

        subscribeToLocationUpdates((location) => {
            console.log('Received location update:', location);
            setPosition([location.lat, location.lng]);
        });

        return () => {
            unsubscribeFromLocationUpdates();
        };
    }, [rideId]);

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        Driver is here.
                    </Popup>
                </Marker>
                <MapUpdater position={position} />
            </MapContainer>
        </div>
    );
};

export default LiveMap;
