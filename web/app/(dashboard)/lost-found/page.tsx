"use client";

import { useEffect, useState } from "react";
import { LostItem } from "@/types";
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Search, Sparkles, Phone, MessageSquare, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { findMatchesV2 } from "@/lib/gemini";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function LostFoundPage() {
    const [items, setItems] = useState<LostItem[]>([]);
    const [filter, setFilter] = useState("all");
    const { userData } = useAuth();

    // Matching State
    const [matchingItem, setMatchingItem] = useState<LostItem | null>(null);
    const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
    const [matches, setMatches] = useState<LostItem[]>([]);
    const [isMatching, setIsMatching] = useState(false);
    const [showMatchDialog, setShowMatchDialog] = useState(false);

    // Reply State
    const [replyingToItem, setReplyingToItem] = useState<LostItem | null>(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [showReplyDialog, setShowReplyDialog] = useState(false);

    // ... existing useEffect ...

    const handleSubmitReply = async () => {
        if (!replyingToItem || !replyMessage.trim() || !userData) return;

        try {
            await addDoc(collection(db, "claims"), { // Keeping collection name 'claims' for simplicity or could rename to 'replies'
                itemId: replyingToItem.id,
                itemTitle: replyingToItem.title,
                finderId: replyingToItem.authorId,
                senderId: userData.uid,
                senderEmail: userData.email,
                message: replyMessage,
                type: "reply",
                status: "unread",
                createdAt: new Date()
            });
            alert("Your message has been sent to the reporter!");
            setShowReplyDialog(false);
            setReplyMessage("");
        } catch (error) {
            console.error("Error sending reply:", error);
            alert("Failed to send message.");
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            await deleteDoc(doc(db, "lost-items", itemId));
            setItems(prev => prev.filter(item => item.id !== itemId));
            alert("Item deleted successfully!");
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Failed to delete item.");
        }
    };

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const q = query(collection(db, "lost-items"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => {
                    const d = doc.data();
                    return {
                        id: doc.id,
                        ...d,
                        date: d.date.toDate ? d.date.toDate() : new Date(d.date),
                        createdAt: d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt)
                    }
                }) as LostItem[];
                setItems(data);
            } catch (error) {
                console.error("Failed to fetch items", error);
            }
        };
        fetchItems();
    }, []);

    const filteredItems = items.filter(item => filter === "all" || item.type === filter);

    const handleFindMatches = async (item: LostItem) => {
        setMatchingItem(item);
        setIsMatching(true);
        setShowMatchDialog(true);
        setMatches([]);

        try {
            // Filter candidates: opposite type
            const oppositeType = item.type === 'lost' ? 'found' : 'lost';
            const candidates = items.filter(i => i.type === oppositeType);

            if (candidates.length === 0) {
                setMatches([]);
                setIsMatching(false);
                return;
            }

            // Try AI matching, fall back to basic matching if AI fails
            try {
                const matchIds = await findMatchesV2(item, candidates);
                const matchedItems = items.filter(i => matchIds.includes(i.id));
                setMatches(matchedItems);
            } catch (aiError) {
                console.log("AI matching failed, using fallback:", aiError);
                // Fallback: simple keyword matching
                const itemWords = item.title.toLowerCase().split(' ');
                const matchedItems = candidates.filter(candidate => 
                    itemWords.some(word => 
                        candidate.title.toLowerCase().includes(word) && word.length > 2
                    )
                );
                setMatches(matchedItems.slice(0, 5)); // Limit to top 5 matches
            }
        } catch (error) {
            console.error("Matching failed", error);
            setMatches([]);
        } finally {
            setIsMatching(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Lost & Found</h1>
                    <p className="text-muted-foreground">Report lost items or find what you've missing.</p>
                </div>
                <Button asChild>
                    <Link href="/lost-found/report">
                        <Plus className="mr-2 h-4 w-4" /> Report Item
                    </Link>
                </Button>
            </div>

            <div className="flex gap-2">
                <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
                <Button variant={filter === "lost" ? "default" : "outline"} onClick={() => setFilter("lost")}>Lost</Button>
                <Button variant={filter === "found" ? "default" : "outline"} onClick={() => setFilter("found")}>Found</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/50 flex flex-col transition-all"
                    >
                        <div className="aspect-video w-full bg-muted object-cover relative">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                                {(userData?.role === 'admin' || userData?.role === 'faculty' || item.authorId === userData?.uid) && (
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="rounded-full bg-white/90 p-1.5 text-red-600 shadow-sm hover:bg-red-50"
                                        title="Delete Item"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                                <span className={`rounded-full px-2 py-1 text-xs font-semibold shadow-sm ${item.type === 'lost' ? 'bg-red-100/90 text-red-700' : 'bg-green-100/90 text-green-700'}`}>
                                    {item.type.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    {new Date(item.date).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{item.description}</p>

                            <div className="space-y-3 mt-auto">
                                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                    <div className="flex items-center justify-between">
                                        <span>{item.location}</span>
                                        <div className="flex gap-2">
                                            {item.contactPhone && (
                                                <>
                                                    <Link href={`tel:${item.contactPhone}`} className="text-green-600 hover:underline flex items-center gap-1">
                                                        <Phone className="h-3 w-3" /> Call
                                                    </Link>
                                                    <Link
                                                        href={`https://wa.me/${item.contactPhone.replace(/\D/g, '')}?text=Hi, I am contacting you regarding your ${item.type} item: ${item.title} on CampusSync.`}
                                                        target="_blank"
                                                        className="text-emerald-600 hover:underline flex items-center gap-1"
                                                    >
                                                        <MessageSquare className="h-3 w-3" /> WhatsApp
                                                    </Link>
                                                </>
                                            )}
                                            <Link href={`mailto:${item.contactEmail}`} className="text-blue-500 hover:underline">Email</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        size="sm"
                                        onClick={() => handleFindMatches(item)}
                                    >
                                        <Sparkles className="mr-2 h-3 w-3" /> Match
                                    </Button>
                                    {item.type === 'found' && (
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => {
                                                setReplyingToItem(item);
                                                setShowReplyDialog(true);
                                            }}
                                        >
                                            Reply
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Item Detail Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                    {selectedItem && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${selectedItem.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {selectedItem.type}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Reported on {new Date(selectedItem.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <DialogTitle className="text-2xl font-bold text-primary">{selectedItem.title}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {selectedItem.imageUrl && (
                                    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border">
                                        <img src={selectedItem.imageUrl} alt={selectedItem.title} className="h-full w-full object-cover" />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Location</p>
                                        <p className="text-sm font-medium">{selectedItem.location}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Contact Information</p>
                                        <div className="flex flex-col gap-1 items-end">
                                            {selectedItem.contactPhone && (
                                                <Link href={`tel:${selectedItem.contactPhone}`} className="text-sm font-medium text-green-600 hover:underline flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {selectedItem.contactPhone}
                                                </Link>
                                            )}
                                            <Link href={`mailto:${selectedItem.contactEmail}`} className="text-sm font-medium text-blue-500 hover:underline">
                                                {selectedItem.contactEmail}
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Description</h4>
                                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{selectedItem.description}</p>
                                </div>

                                <div className="pt-6 border-t flex gap-3">
                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => {
                                            handleFindMatches(selectedItem);
                                            setSelectedItem(null);
                                        }}
                                    >
                                        <Sparkles className="mr-2 h-4 w-4" /> Find AI Matches
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={() => {
                                            setReplyingToItem(selectedItem);
                                            setShowReplyDialog(true);
                                            setSelectedItem(null);
                                        }}
                                    >
                                        Contact Reporter
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Match Dialog */}
            <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>AI Match Results</DialogTitle>
                        <DialogDescription>
                            We looked for {matchingItem?.type === 'lost' ? 'Found' : 'Lost'} items that match "{matchingItem?.title}".
                        </DialogDescription>
                    </DialogHeader>

                    {isMatching ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
                            <p className="text-muted-foreground animate-pulse">Analyzing descriptions, locations, and dates...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {matches.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {matches.map(match => (
                                        <div key={match.id} className="border rounded-lg p-4 flex gap-4">
                                            <div className="h-20 w-20 bg-muted rounded flex-shrink-0 overflow-hidden">
                                                {match.imageUrl ? (
                                                    <img src={match.imageUrl} className="h-full w-full object-cover" />
                                                ) : <div className="h-full w-full flex items-center justify-center text-xs">No Img</div>}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{match.title}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{match.description}</p>
                                                <div className="mt-2 text-xs flex gap-2">
                                                    <span className="bg-muted px-2 py-0.5 rounded">{match.location}</span>
                                                    <Link href={`mailto:${match.contactEmail}`} className="text-blue-600 hover:underline">Contact</Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No high-confidence matches found.</p>
                                    <p className="text-sm">Try checking back later!</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reply Dialog */}
            <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reply to Finder</DialogTitle>
                        <DialogDescription>
                            Send a message to the reporter of "{replyingToItem?.title}".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <textarea
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            rows={4}
                            placeholder="Type your message here... (e.g. proof of ownership or a question)"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button onClick={handleSubmitReply}>Send Message</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
