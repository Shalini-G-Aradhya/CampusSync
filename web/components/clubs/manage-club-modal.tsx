"use client";

import { Club } from "@/lib/data/clubs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManageClubModalProps {
    isOpen: boolean;
    onClose: () => void;
    club: Club | null;
    onApprove: (clubId: string, userId: string) => void;
    onReject: (clubId: string, userId: string) => void;
}

export function ManageClubModal({ isOpen, onClose, club, onApprove, onReject }: ManageClubModalProps) {
    if (!club) return null;

    const pendingMembers = club.members.filter(m => m.status === 'pending');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Requests</DialogTitle>
                    <DialogDescription>
                        Approve or reject new membership requests for {club.name}.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[300px] mt-4">
                    <div className="space-y-4 pr-4">
                        {pendingMembers.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-8">No pending requests.</p>
                        ) : (
                            pendingMembers.map((member) => (
                                <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium">{member.name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => onReject(club.id, member.userId)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                                            onClick={() => onApprove(club.id, member.userId)}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={onClose}>Done</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
