"use client";

import { ClubEvent } from "@/lib/data/clubs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

interface EventCardProps {
    event: ClubEvent;
    clubName: string;
}

export function EventCard({ event, clubName }: EventCardProps) {
    const date = new Date(event.date);

    return (
        <Card className="min-w-[300px] overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
                <div className="flex h-24">
                    {/* Date Block */}
                    <div className="w-20 bg-primary/10 flex flex-col items-center justify-center border-r">
                        <span className="text-xs font-bold text-primary uppercase">
                            {date.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-2xl font-black text-primary">
                            {date.getDate()}
                        </span>
                    </div>
                    {/* Info Block */}
                    <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                            <h4 className="font-bold text-sm line-clamp-1">{event.title}</h4>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{clubName}</p>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="line-clamp-1">{event.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
