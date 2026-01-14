"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Club,
    ClubEvent,
    CURRENT_USER_ID,
    getClubsData,
    getEventsData,
    createClubData,
    updateClubMembersData
} from "@/lib/data/clubs";
import { ClubCard } from "@/components/clubs/club-card";
import { EventCard } from "@/components/clubs/event-card";
import { CreateClubModal } from "@/components/clubs/create-club-modal";
import { ManageClubModal } from "@/components/clubs/manage-club-modal";
import { ClubDetailsModal } from "@/components/clubs/club-details-modal";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

export default function ClubsPage() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [events, setEvents] = useState<ClubEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [manageClub, setManageClub] = useState<Club | null>(null);
    const [viewClub, setViewClub] = useState<Club | null>(null);
    const { toast } = useToast();

    // FETCH DATA
    const loadData = async () => {
        setLoading(true);
        try {
            const [clubsData, eventsData] = await Promise.all([
                getClubsData(),
                getEventsData()
            ]);
            setClubs(clubsData);
            setEvents(eventsData);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load club data.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ACTIONS
    const handleCreateClub = async (newClubData: Omit<Club, 'id'>) => {
        try {
            await createClubData(newClubData);
            toast({
                title: "Club Created!",
                description: `${newClubData.name} is live. You are the admin.`
            });
            loadData(); // Refresh list
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create club.",
                variant: "destructive"
            });
        }
    };

    const handleJoinClub = async (clubId: string) => {
        const club = clubs.find(c => c.id === clubId);
        if (!club) return;

        const newMembers = [...club.members, { userId: CURRENT_USER_ID, name: 'Current User', status: 'pending' as const }];

        try {
            await updateClubMembersData(clubId, newMembers);
            setClubs(clubs.map(c => c.id === clubId ? { ...c, members: newMembers } : c));
            toast({
                title: "Request Sent",
                description: "Your membership is pending approval from the club creator."
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send join request.",
                variant: "destructive"
            });
        }
    };

    const handleApproveMember = async (clubId: string, userId: string) => {
        const club = clubs.find(c => c.id === clubId);
        if (!club) return;

        const newMembers = club.members.map(m => m.userId === userId ? { ...m, status: 'approved' as const } : m);

        try {
            await updateClubMembersData(clubId, newMembers);
            const updatedClubs = clubs.map(c => c.id === clubId ? { ...c, members: newMembers } : c);
            setClubs(updatedClubs);

            if (manageClub && manageClub.id === clubId) {
                setManageClub(updatedClubs.find(c => c.id === clubId) || null);
            }

            toast({ title: "Member Approved", className: "bg-green-50 border-green-200 text-green-800" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to approve member.", variant: "destructive" });
        }
    };

    const handleRejectMember = async (clubId: string, userId: string) => {
        const club = clubs.find(c => c.id === clubId);
        if (!club) return;

        const newMembers = club.members.filter(m => m.userId !== userId);

        try {
            await updateClubMembersData(clubId, newMembers);
            const updatedClubs = clubs.map(c => c.id === clubId ? { ...c, members: newMembers } : c);
            setClubs(updatedClubs);

            if (manageClub && manageClub.id === clubId) {
                setManageClub(updatedClubs.find(c => c.id === clubId) || null);
            }
            toast({ title: "Request Rejected" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to reject request.", variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading campus societies...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Student Societies</h1>
                    <p className="text-muted-foreground">Join a community or start your own.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg hover:shadow-xl transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Start a Club
                </Button>
            </div>

            {/* Events Section */}
            {events.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Happening Now</h2>
                    </div>
                    <ScrollArea className="w-full whitespace-nowrap rounded-xl">
                        <div className="flex w-max space-x-4 pb-4">
                            {events.map(event => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    clubName={clubs.find(c => c.id === event.clubId)?.name || "Unknown Club"}
                                />
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </section>
            )}

            {/* Clubs Grid */}
            {clubs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl bg-muted/50 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Info className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">No clubs found</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Be the first to start a society at CampusSync! Click the button above to begin.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {clubs.map(club => (
                        <ClubCard
                            key={club.id}
                            club={club}
                            onJoin={handleJoinClub}
                            onManage={(c) => setManageClub(c)}
                            onView={(c) => setViewClub(c)}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <CreateClubModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreate={handleCreateClub}
            />

            <ManageClubModal
                isOpen={!!manageClub}
                onClose={() => setManageClub(null)}
                club={manageClub}
                onApprove={handleApproveMember}
                onReject={handleRejectMember}
            />

            <ClubDetailsModal
                isOpen={!!viewClub}
                onClose={() => setViewClub(null)}
                club={viewClub}
            />
        </div>
    );
}
