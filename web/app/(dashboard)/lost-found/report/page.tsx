"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { analyzeImageV2, findMatchesV2 } from "@/lib/gemini";
import { getDocs, query, orderBy } from "firebase/firestore";
import { Sparkles, Phone, AlertCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function ReportItemPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("lost");
    const [category, setCategory] = useState("electronics");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [suggestedMatches, setSuggestedMatches] = useState<any[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
    const [showMatchDetails, setShowMatchDetails] = useState(false);

    const router = useRouter();
    const { userData } = useAuth();

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleAIScan = async () => {
        if (!image) {
            alert("Please upload an image first.");
            return;
        }
        setScanning(true);
        setSuggestedMatches([]);
        try {
            const base64 = await fileToBase64(image);
            const suggestedTitle = await analyzeImageV2(base64);
            if (suggestedTitle && suggestedTitle !== "Unknown Item") {
                setTitle(suggestedTitle);

                // Proactive Match Search
                const oppositeType = type === 'lost' ? 'found' : 'lost';
                const q = query(collection(db, "lost-items"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const candidates = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter((item: any) => item.type === oppositeType);

                if (candidates.length > 0) {
                    const matchIds = await findMatchesV2({ title: suggestedTitle, type }, candidates);
                    const matchedItems = candidates.filter((c: any) => matchIds.includes(c.id));
                    setSuggestedMatches(matchedItems);
                }
            } else {
                alert("AI could not identify the item clearly. Please enter title manually.");
            }
        } catch (error) {
            console.error("AI Scan failed:", error);
        } finally {
            setScanning(false);
        }
    };

    const handleReport = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submit button clicked");

        if (!userData) {
            console.log("Submission blocked: No userData");
            alert("You must be logged in to report an item.");
            return;
        }

        // Prevent multiple submissions
        if (loading) return;

        if (!date) {
            alert("Please select a valid date.");
            return;
        }

        setLoading(true);
        console.log("Starting submission process...");

        try {
            let imageUrl = "";
            if (image) {
                console.log("Converting image to Base64 for Firestore storage...");
                try {
                    // Convert image to Base64 string
                    const base64String = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(image);
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = error => reject(error);
                    });

                    // Note: Firestore has a 1MB limit. For hackathon demo, we assume small-ish images.
                    imageUrl = base64String;
                    console.log("Image conversion successful");
                } catch (err) {
                    console.error("Image conversion failed:", err);
                    alert("Failed to process image. Try a smaller file or report without an image.");
                    setLoading(false);
                    return;
                }
            }

            const itemDate = new Date(date);
            console.log("Preparing Firestore document...");

            const itemData = {
                title: title.trim(),
                description: description.trim(),
                type,
                category,
                location: location.trim(),
                date: itemDate,
                contactEmail: userData.email,
                contactPhone: contactPhone.trim(),
                status: "open",
                createdAt: new Date(),
                imageUrl, // Now contains the data URL string
                authorId: userData.uid
            };

            console.log("Adding document to Firestore...");

            // Add small delay to prevent concurrent writes
            await new Promise(resolve => setTimeout(resolve, 100));

            const docRef = await addDoc(collection(db, "lost-items"), itemData);
            console.log("Firestore write successful! Document ID:", docRef.id);

            alert("Success! Your item has been reported.");
            router.push("/lost-found");
        } catch (error: any) {
            console.error("Error reporting item:", error);
            if (error.message?.includes("already active")) {
                alert("Please wait a moment and try again.");
            } else {
                alert("Failed to report item: " + (error.message || "Unknown error"));
            }
        } finally {
            setLoading(false);
            console.log("Submission process finished.");
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-primary">Report {type === "lost" ? "Lost" : "Found"} Item</h1>
                <p className="text-muted-foreground">Help return items to their owners.</p>
            </div>

            <form onSubmit={handleReport} className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant={type === "lost" ? "default" : "outline"}
                        onClick={() => setType("lost")}
                        className="flex-1"
                    >
                        I Lost Something
                    </Button>
                    <Button
                        type="button"
                        variant={type === "found" ? "default" : "outline"}
                        onClick={() => setType("found")}
                        className="flex-1"
                    >
                        I Found Something
                    </Button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="electronics">Electronics</option>
                            <option value="clothing">Clothing</option>
                            <option value="books">Books</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone Number (Optional)</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="+91 XXXXX XXXXX"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="e.g. Library, Room 302"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Upload Image</label>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                setImage(e.target.files?.[0] || null);
                                setSuggestedMatches([]);
                            }}
                            className="flex-1 text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        {image && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleAIScan}
                                disabled={scanning}
                            >
                                {scanning ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" /> Scanning...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" /> AI Scan & Match
                                    </span>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {suggestedMatches.length > 0 && (
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-blue-700 font-semibold">
                            <AlertCircle className="h-5 w-5" />
                            <span>AI Found {suggestedMatches.length} Similar {type === 'lost' ? 'Found' : 'Lost'} Items!</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {suggestedMatches.map((match: any) => (
                                <div
                                    key={match.id}
                                    className="bg-white rounded border border-blue-100 p-2 flex gap-2 cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all shadow-none"
                                    onClick={() => {
                                        setSelectedMatch(match);
                                        setShowMatchDetails(true);
                                    }}
                                >
                                    {match.imageUrl && <img src={match.imageUrl} className="h-10 w-10 rounded object-cover" />}
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold truncate">{match.title}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{match.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-blue-600 italic">Click an item to view details or contact the reporter.</p>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                        placeholder="Add details (e.g. where you found it, specific marks, etc.)"
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="w-32">
                        {loading ? "Submitting..." : "Submit Report"}
                    </Button>
                </div>
            </form>

            <Dialog open={showMatchDetails} onOpenChange={setShowMatchDetails}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedMatch?.title}</DialogTitle>
                        <DialogDescription>
                            Reported on {selectedMatch?.date instanceof Date ? selectedMatch.date.toLocaleDateString() :
                                selectedMatch?.date?.toDate ? selectedMatch.date.toDate().toLocaleDateString() : 'Unknown Date'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedMatch?.imageUrl && (
                            <img
                                src={selectedMatch.imageUrl}
                                alt={selectedMatch.title}
                                className="w-full h-48 object-cover rounded-lg border"
                            />
                        )}

                        <div>
                            <p className="text-sm font-semibold">Description</p>
                            <p className="text-sm text-muted-foreground">{selectedMatch?.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-semibold">Location</p>
                                <p className="text-muted-foreground">{selectedMatch?.location}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Category</p>
                                <p className="text-muted-foreground capitalize">{selectedMatch?.category}</p>
                            </div>
                        </div>

                        <div className="pt-4 space-y-2">
                            <p className="text-xs font-bold text-primary uppercase">Contact Reporter</p>
                            <div className="grid grid-cols-1 gap-2">
                                {selectedMatch?.contactPhone && (
                                    <>
                                        <Button variant="outline" className="w-full justify-start text-green-600" asChild>
                                            <Link href={`tel:${selectedMatch.contactPhone}`}>
                                                <Phone className="mr-2 h-4 w-4" /> Call {selectedMatch.contactPhone}
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start text-emerald-600" asChild>
                                            <Link
                                                href={`https://wa.me/${selectedMatch.contactPhone.replace(/\D/g, '')}?text=Hi, I found your match on CampusSync!`}
                                                target="_blank"
                                            >
                                                <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
                                            </Link>
                                        </Button>
                                    </>
                                )}
                                <Button variant="outline" className="w-full justify-start text-blue-600" asChild>
                                    <Link href={`mailto:${selectedMatch?.contactEmail}`}>
                                        <AlertCircle className="mr-2 h-4 w-4" /> Email Reporter
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
