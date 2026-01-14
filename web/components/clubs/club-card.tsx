"use client";

import { Club, CURRENT_USER_ID } from "@/lib/data/clubs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Settings, Clock, CheckCircle2 } from "lucide-react";

interface ClubCardProps {
    club: Club;
    onJoin: (clubId: string) => void;
    onManage: (club: Club) => void;
    onView: (club: Club) => void;
}

export function ClubCard({ club, onJoin, onManage, onView }: ClubCardProps) {
    const isCreator = club.creatorId === CURRENT_USER_ID;
    const membership = club.members.find(m => m.userId === CURRENT_USER_ID);
    const isPending = membership?.status === 'pending';
    const isMember = membership?.status === 'approved';

    return (
        <Card className="overflow-hidden flex flex-col hover:shadow-lg transition-all h-full group cursor-pointer" onClick={() => onView(club)}>
            {/* Poster Image Area */}
            <div className="relative h-48 w-full bg-muted overflow-hidden">
                <img
                    src={club.posterUrl}
                    alt={club.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="backdrop-blur-md bg-white/80 text-black">
                        {club.category}
                    </Badge>
                </div>
            </div>

            <CardContent className="flex-1 p-4">
                <h3 className="font-bold text-lg mb-1 truncate">{club.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
                    {club.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{club.members.filter(m => m.status === 'approved').length} Members</span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0" onClick={(e) => e.stopPropagation()}>
                {isCreator ? (
                    <Button className="w-full" variant="outline" onClick={() => onManage(club)}>
                        <Settings className="mr-2 h-4 w-4" /> Manage Club
                    </Button>
                ) : isMember ? (
                    <Button className="w-full" variant="ghost" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Member
                    </Button>
                ) : isPending ? (
                    <Button className="w-full" variant="secondary" disabled>
                        <Clock className="mr-2 h-4 w-4" /> Pending Approval
                    </Button>
                ) : (
                    <Button className="w-full" onClick={() => onJoin(club.id)}>
                        Join Club
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
