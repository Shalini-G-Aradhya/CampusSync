"use client";

import { Club } from "@/lib/data/clubs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";

interface ClubDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    club: Club | null;
}

export function ClubDetailsModal({ isOpen, onClose, club }: ClubDetailsModalProps) {
    if (!club) return null;

    const approvedMembersCount = club.members.filter(m => m.status === 'approved').length;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                {/* Poster Header */}
                <div className="relative h-64 w-full">
                    <img
                        src={club.posterUrl}
                        alt={club.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-md border-white/30">
                                {club.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-white/80">
                                <Users className="h-3 w-3" />
                                <span>{approvedMembersCount} Members</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{club.name}</h2>
                    </div>
                </div>

                <div className="p-8 bg-card">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Message from the Club</span>
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap italic">
                            "{club.description}"
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border flex justify-between items-center bg-muted/30 -mx-8 -mb-8 px-8 py-4">
                        <p className="text-xs text-muted-foreground italic">
                            Created by Student ID: {club.creatorId}
                        </p>
                        <button
                            onClick={onClose}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
