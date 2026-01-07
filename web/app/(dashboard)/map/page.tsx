"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { Bus, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Dynamically import map with no SSR
const CampusMap = dynamic(() => import("@/components/CampusMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">Loading Map...</div>
});

const LOCATIONS = [
    { id: 1, name: "Main Gate (Entrance)", type: "gate", lat: 13.1170, lng: 77.6335, description: "Primary entry and exit point for the campus." },
    { id: 2, name: "Administrative Block", type: "academic", lat: 13.1172, lng: 77.6345, description: "Main administrative offices and entrance." },
    { id: 3, name: "Central Library", type: "academic", lat: 13.1178, lng: 77.6350, description: "Three-story digital library and quiet study zone." },
    { id: 4, name: "School of Computing", type: "academic", lat: 13.1165, lng: 77.6358, description: "Laboratories and smart classrooms for CS & IT." },
    { id: 5, name: "Reva Food Court", type: "food", lat: 13.1160, lng: 77.6340, description: "Multi-cuisine cafeteria and student hangout." },
    { id: 6, name: "Sports Complex", type: "sports", lat: 13.1150, lng: 77.6330, description: "Outdoor stadium, cricket ground, and basketball courts." },
    { id: 7, name: "Kalpana Chawla Hostel", type: "hostel", lat: 13.1185, lng: 77.6365, description: "Girls' residential block with modern amenities." },
];

export default function MapPage() {
    const [filter, setFilter] = useState("all");

    const filteredLocations = LOCATIONS.filter(
        (loc) => filter === "all" || loc.type === filter
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Campus Map</h1>
                    <p className="text-muted-foreground">Navigate the campus easily.</p>
                </div>
                <div className="space-x-2">
                    <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
                    <Button variant={filter === "academic" ? "default" : "outline"} onClick={() => setFilter("academic")}>Academic</Button>
                    <Button variant={filter === "sports" ? "default" : "outline"} onClick={() => setFilter("sports")}>Sports</Button>
                    <Button variant={filter === "food" ? "default" : "outline"} onClick={() => setFilter("food")}>Food</Button>
                </div>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-card shadow-md z-0">
                <CampusMap locations={filteredLocations} />
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-primary flex items-center gap-2 text-lg">
                    <Bus className="h-5 w-5" /> Transit & Connectivity
                </h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                    Reva Circle Stop
                                </p>
                                <div className="pl-3 border-l-2 border-blue-100">
                                    <p className="text-sm font-medium">To Yelahanka / Majestic</p>
                                    <p className="text-[11px] text-muted-foreground italic">Via Bagalur Cross</p>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {["289A", "289M", "289G", "298M"].map(bus => (
                                            <span key={bus} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-bold">#{bus}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                    Bellahalli Cross Stop
                                </p>
                                <div className="pl-3 border-l-2 border-green-100">
                                    <p className="text-sm font-medium">To KR Puram / Shivajinagar</p>
                                    <p className="text-[11px] text-muted-foreground italic">Via Nagawara</p>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {["290E", "507"].map(bus => (
                                            <span key={bus} className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded text-xs font-bold">#{bus}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4 border border-dashed border-border h-fit">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" /> Major Commute Hubs
                        </p>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-bold">Yelahanka Old Town</p>
                                <p className="text-[11px] text-muted-foreground">5.2 km away • Major Hub</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold">Hebbal Flyover</p>
                                <p className="text-[11px] text-muted-foreground italic">Connects to ORR & City Center</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed pt-3 border-t border-border/50">
                                💡 <strong>Tip:</strong> Auto-rickshaws are readily available at both Circle and Cross for quick city transit.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

