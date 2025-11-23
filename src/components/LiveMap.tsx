import { useEffect, useRef, useState } from 'react';
import L, { Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint } from '../context/AppContext';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LiveMapProps {
  start?: LocationPoint | null;
  destination?: LocationPoint | null;
  driverLocation?: LocationPoint | null;
  height?: number;
  showRoute?: boolean;
}

export default function LiveMap({
  start,
  destination,
  driverLocation,
  height = 500,
  showRoute = true,
}: LiveMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startMarkerRef = useRef<Marker | null>(null);
  const destinationMarkerRef = useRef<Marker | null>(null);
  const driverMarkerRef = useRef<Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Create custom icons
  const startIcon = L.divIcon({
    className: 'live-map-marker live-map-marker--start',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    html: '<div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">S</div>',
  });

  const destinationIcon = L.divIcon({
    className: 'live-map-marker live-map-marker--destination',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    html: '<div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">D</div>',
  });

  const driverIcon = L.divIcon({
    className: 'live-map-marker live-map-marker--driver',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    html: '<div style="background-color: #3b82f6; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><div style="width: 20px; height: 20px; background-color: white; border-radius: 50%;"></div></div>',
  });

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true,
    }).setView([22.5645, 72.9289], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // Update markers and route when locations change
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;
    const bounds: [number, number][] = [];

    // Update start marker
    if (start) {
      if (startMarkerRef.current) {
        startMarkerRef.current.setLatLng([start.lat, start.lng]);
      } else {
        startMarkerRef.current = L.marker([start.lat, start.lng], { icon: startIcon })
          .addTo(map)
          .bindPopup('Start Location');
      }
      bounds.push([start.lat, start.lng]);
    } else if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }

    // Update destination marker
    if (destination) {
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setLatLng([destination.lat, destination.lng]);
      } else {
        destinationMarkerRef.current = L.marker([destination.lat, destination.lng], { icon: destinationIcon })
          .addTo(map)
          .bindPopup('Destination');
      }
      bounds.push([destination.lat, destination.lng]);
    } else if (destinationMarkerRef.current) {
      map.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
    }

    // Update driver marker
    if (driverLocation) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([driverLocation.lat, driverLocation.lng]);
      } else {
        driverMarkerRef.current = L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon })
          .addTo(map)
          .bindPopup('Driver Location');
      }
      bounds.push([driverLocation.lat, driverLocation.lng]);
    } else if (driverMarkerRef.current) {
      map.removeLayer(driverMarkerRef.current);
      driverMarkerRef.current = null;
    }

    // Update route line if both start and destination exist
    if (showRoute && start && destination) {
      const routePoints: [number, number][] = [
        [start.lat, start.lng],
        [destination.lat, destination.lng],
      ];

      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs(routePoints);
      } else {
        routeLineRef.current = L.polyline(routePoints, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.6,
          dashArray: '10, 10',
        }).addTo(map);
      }
    } else if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    // Fit bounds to show all markers
    if (bounds.length > 0) {
      const boundsObj = L.latLngBounds(bounds);
      map.fitBounds(boundsObj.pad(0.1));
    }
  }, [start, destination, driverLocation, isMapReady, showRoute, startIcon, destinationIcon, driverIcon]);

  return (
    <div
      ref={containerRef}
      className="live-map-container rounded-lg border-2 border-black overflow-hidden bg-white"
      style={{ height: `${height}px`, width: '100%' }}
    />
  );
}

