"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
const createIcon = () => {
    if (typeof window === 'undefined') return null;
    return L.divIcon({
        html: '<div style="background:#3b82f6;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;">📍</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
};

interface Location {
    id: number;
    name: string;
    type: string;
    lat: number;
    lng: number;
    description: string;
}

interface CampusMapProps {
    locations: Location[];
    center?: [number, number];
    zoom?: number;
}

export default function CampusMap({ locations, center = [13.1170, 77.6345], zoom = 16 }: CampusMapProps) {
    const [mounted, setMounted] = useState(false);
    const [icon, setIcon] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        setIcon(createIcon());
    }, []);

    if (!mounted || !icon) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                Loading Map...
            </div>
        );
    }

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[13.1170, 77.6345]} icon={icon}>
                <Popup>
                    <div style={{ padding: '8px' }}>
                        <h3 style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Reva University</h3>
                        <p style={{ fontSize: '11px', margin: 0 }}>Campus Location</p>
                    </div>
                </Popup>
            </Marker>
        </MapContainer>
    );
}
