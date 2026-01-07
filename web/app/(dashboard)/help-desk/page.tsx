"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Plus, Disc, Sparkles, Camera, Image as ImageIcon, Trash2 } from "lucide-react";
import { chatWithGeminiV2, classifyTicketV2 } from "@/lib/gemini";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AIStatus } from "@/components/ai-status";

interface Message {
    role: "user" | "model";
    content: string;
}

export default function HelpDeskPage() {
    const [activeTab, setActiveTab] = useState<"chat" | "tickets">("chat");
    const { userData } = useAuth(); // Using userData for profile info if needed

    // Chat State
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", content: "Hi! I'm the Campus Digital Assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Ticket State
    const [tickets, setTickets] = useState<any[]>([]);
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [ticketTitle, setTicketTitle] = useState("");
    const [ticketDesc, setTicketDesc] = useState("");
    const [ticketPriority, setTicketPriority] = useState<"low" | "medium" | "high">("medium");
    const [ticketCategory, setTicketCategory] = useState("general");
    const [ticketImage, setTicketImage] = useState<File | null>(null);
    const [ticketLoading, setTicketLoading] = useState(false);
    const [suggesting, setSuggesting] = useState(false);

    // Initial Scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeTab]);

    // Fetch Tickets
    useEffect(() => {
        if (!userData || activeTab !== "tickets") return;

        const isStaff = userData.role === 'admin' || userData.role === 'faculty';
        let q;

        if (isStaff) {
            // Staff see all tickets
            q = query(
                collection(db, "tickets"),
                orderBy("createdAt", "desc")
            );
        } else {
            // Students see only their own
            // Removed orderBy to avoid composite index requirement
            q = query(
                collection(db, "tickets"),
                where("userId", "==", userData.uid)
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ticketData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort in memory for students if needed (or for everyone to be safe)
            const sortedData = ticketData.sort((a: any, b: any) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
            });

            setTickets(sortedData);
        }, (error) => {
            console.error("Ticket Snapshot Error:", error);
        });

        return () => unsubscribe();
    }, [userData, activeTab]);

    const handleDeleteTicket = async (id: string) => {
        if (!confirm("Delete this ticket?")) return;
        try {
            await deleteDoc(doc(db, "tickets", id));
            alert("Ticket deleted");
        } catch (error) {
            alert("Failed to delete ticket");
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleAISuggest = async () => {
        if (!ticketDesc && !ticketImage) {
            alert("Please provide a description or an image for AI to analyze.");
            return;
        }
        setSuggesting(true);
        try {
            let base64 = "";
            if (ticketImage) {
                const b64Full = await fileToBase64(ticketImage);
                base64 = b64Full.split(',')[1]; // Just send pixels for AI analysis
            }
            const result = await classifyTicketV2(ticketDesc, base64);
            if (result.priority && result.category) {
                setTicketPriority(result.priority as any);
                setTicketCategory(result.category);
                if (!ticketTitle) setTicketTitle(result.summary);
            }
        } catch (error) {
            console.error("AI Ticket suggestion failed:", error);
            // Fallback to default values when AI is unavailable
            setTicketPriority("medium");
            setTicketCategory("general");
            if (!ticketTitle && ticketDesc) {
                // Create a simple title from the first 50 characters of description
                const simpleTitle = ticketDesc.substring(0, 50).trim() + (ticketDesc.length > 50 ? "..." : "");
                setTicketTitle(simpleTitle);
            }
            alert("AI suggestions are currently unavailable. Default values have been applied.");
        } finally {
            setSuggesting(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const response = await chatWithGeminiV2(userMsg);
            if (response.includes("AI Error") || response.includes("quota") || response.includes("RESOURCE_EXHAUSTED")) {
                throw new Error("AI service unavailable");
            }
            setMessages(prev => [...prev, { role: "model", content: response }]);
        } catch (error) {
            // Fallback responses when AI is unavailable
            const fallbackResponses = [
                "I'm currently experiencing technical difficulties with my AI services. Please try again later or use the ticket system for formal requests.",
                "My AI capabilities are temporarily unavailable. For immediate assistance, please create a support ticket using the Tickets tab.",
                "I'm unable to process your request right now due to service limitations. The help desk team is available through the ticket system."
            ];
            const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            setMessages(prev => [...prev, { role: "model", content: randomResponse }]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData) return;
        setTicketLoading(true);

        try {
            let imageUrl = "";
            if (ticketImage) {
                console.log("Saving ticket image as Base64...");
                imageUrl = await fileToBase64(ticketImage);
            }

            await addDoc(collection(db, "tickets"), {
                userId: userData.uid,
                email: userData.email,
                title: ticketTitle.trim(),
                description: ticketDesc.trim(),
                priority: ticketPriority,
                category: ticketCategory,
                status: "open",
                imageUrl, // Now Base64
                createdAt: new Date()
            });
            setShowTicketForm(false);
            setTicketTitle("");
            setTicketDesc("");
            setTicketPriority("medium");
            setTicketCategory("general");
            setTicketImage(null);
            alert("Ticket created successfully!");
        } catch (error: any) {
            console.error("Error creating ticket:", error);
            alert("Failed to create ticket: " + (error.message || "Unknown error"));
        } finally {
            setTicketLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
            <div className="flex gap-2 border-b border-border pb-2">
                <Button
                    variant={activeTab === "chat" ? "default" : "ghost"}
                    onClick={() => setActiveTab("chat")}
                >
                    AI Chat Assistant
                </Button>
                <Button
                    variant={activeTab === "tickets" ? "default" : "ghost"}
                    onClick={() => setActiveTab("tickets")}
                >
                    My Tickets
                </Button>
            </div>

            {activeTab === "chat" ? (
                <div className="flex flex-1 flex-col rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                    <div className="border-b border-border bg-muted/30 px-4 py-2">
                        <AIStatus />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-foreground'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2 text-foreground">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSend} className="border-t border-border p-4 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question..."
                            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <Button type="submit" size="icon" disabled={loading}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Support Tickets</h2>
                        <Button onClick={() => setShowTicketForm(!showTicketForm)}>
                            {showTicketForm ? "Cancel" : "New Ticket"}
                        </Button>
                    </div>

                    {showTicketForm && (
                        <div className="rounded-lg border border-border bg-card p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium">Create New Ticket</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAISuggest}
                                    disabled={suggesting || (!ticketDesc && !ticketImage)}
                                    className="gap-2"
                                >
                                    {suggesting ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    ) : (
                                        <Sparkles className="h-4 w-4 text-primary" />
                                    )}
                                    AI Analyze Issue
                                </Button>
                            </div>
                            <form onSubmit={handleCreateTicket} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-sm font-medium">Title</label>
                                        <input
                                            type="text"
                                            value={ticketTitle}
                                            onChange={e => setTicketTitle(e.target.value)}
                                            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="Brief issue name"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-sm font-medium">Category</label>
                                        <select
                                            value={ticketCategory}
                                            onChange={(e) => setTicketCategory(e.target.value)}
                                            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
                                        >
                                            <option value="general">General</option>
                                            <option value="infrastructure">Infrastructure</option>
                                            <option value="academic">Academic</option>
                                            <option value="technical">Technical</option>
                                            <option value="sanitation">Sanitation</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-sm font-medium">Priority</label>
                                        <select
                                            value={ticketPriority}
                                            onChange={(e: any) => setTicketPriority(e.target.value)}
                                            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-sm font-medium">Attach Photo</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setTicketImage(e.target.files?.[0] || null)}
                                                className="hidden"
                                                id="ticket-image"
                                            />
                                            <label
                                                htmlFor="ticket-image"
                                                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-dashed border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                                            >
                                                {ticketImage ? (
                                                    <span className="text-primary font-medium truncate">{ticketImage.name}</span>
                                                ) : (
                                                    <>
                                                        <Camera className="h-4 w-4 text-muted-foreground" />
                                                        <span>Select Image</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        value={ticketDesc}
                                        onChange={e => setTicketDesc(e.target.value)}
                                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        rows={3}
                                        placeholder="Describe the problem in detail..."
                                        required
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" disabled={ticketLoading} className="w-full sm:w-32">
                                        {ticketLoading ? "Submitting..." : "Submit Ticket"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {tickets.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No tickets found. Need help? Create a new ticket above.
                            </div>
                        ) : (
                            tickets.map(ticket => (
                                <div key={ticket.id} className="rounded-lg border border-border bg-card p-4 flex gap-4 items-start hover:shadow-md transition-shadow">
                                    {ticket.imageUrl && (
                                        <div className="h-16 w-16 overflow-hidden rounded bg-muted flex-shrink-0">
                                            <img src={ticket.imageUrl} className="h-full w-full object-cover" alt="Issue" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="font-semibold truncate">{ticket.title}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold 
                                                ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {ticket.status}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold 
                                                ${ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'}`}>
                                                {ticket.priority}
                                            </span>
                                            {ticket.category && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold bg-muted text-muted-foreground">
                                                    {ticket.category}
                                                </span>
                                            )}
                                            {userData?.role === 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteTicket(ticket.id)}
                                                    className="text-muted-foreground hover:text-red-600 ml-auto"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                                        <div className="mt-2 text-[10px] text-muted-foreground">
                                            {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
