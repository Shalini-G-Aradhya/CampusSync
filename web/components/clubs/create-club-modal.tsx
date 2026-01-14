"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Club, CURRENT_USER_ID } from "@/lib/data/clubs";

interface CreateClubModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (club: Omit<Club, 'id'>) => void;
}

export function CreateClubModal({ isOpen, onClose, onCreate }: CreateClubModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Tech");
    const [posterUri, setPosterUri] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPosterUri(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description) return;

        const newClub: Omit<Club, 'id'> = {
            name,
            description,
            posterUrl: posterUri || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop",
            category: category as any,
            creatorId: CURRENT_USER_ID,
            members: [{ userId: CURRENT_USER_ID, name: 'Current User', status: 'approved' }]
        };

        onCreate(newClub);
        onClose();
        setName("");
        setDescription("");
        setPosterUri(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Start a New Club</DialogTitle>
                    <DialogDescription>
                        Create a hub for your community.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Club Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., AI Research Group"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="poster">Club Poster (Optional)</Label>
                        <Input
                            id="poster"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                        />
                        {posterUri && (
                            <div className="mt-2 relative h-24 w-full rounded-md overflow-hidden bg-muted border">
                                <img src={posterUri} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <select
                            id="category"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="Tech">Tech</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Sports">Sports</option>
                            <option value="Academic">Academic</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Max 150 chars)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is your club about?"
                            maxLength={150}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Club</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
