"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateSummaryV2, classifyNoticeV2 } from "@/lib/gemini";
import { Sparkles } from "lucide-react";

export default function CreateNoticePage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [summary, setSummary] = useState("");
    const [category, setCategory] = useState("official");
    const [priority, setPriority] = useState("medium");
    const [loading, setLoading] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const router = useRouter();
    const { userData } = useAuth();

    const handleAISuggest = async () => {
        if (!content) return;
        setSuggesting(true);
        try {
            const result = await classifyNoticeV2(content);
            setPriority(result.priority);
            setCategory(result.category);

            // Also generate summary if empty
            if (!summary) {
                const genSummary = await generateSummaryV2(content);
                setSummary(genSummary);
            }
        } catch (error) {
            console.error("AI Suggestion failed:", error);
        } finally {
            setSuggesting(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const canCreate = userData?.role === "admin" || userData?.role === "faculty";
        if (!canCreate) {
            alert("Unauthorized");
            return;
        }

        setLoading(true);
        try {
            const finalSummary = summary || (content ? await generateSummaryV2(content) : "");

            await addDoc(collection(db, "notices"), {
                title,
                content,
                summary: finalSummary,
                category,
                priority,
                createdAt: new Date(),
                authorId: userData.uid,
            });

            router.push("/notices");
        } catch (error) {
            console.error("Failed to create notice", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Create New Notice</h1>
                    <p className="text-muted-foreground">Post announcements for the campus.</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAISuggest}
                    disabled={!content || suggesting}
                    className="flex items-center gap-2"
                >
                    {suggesting ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                        <Sparkles className="h-4 w-4 text-primary" />
                    )}
                    AI Suggest
                </Button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
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
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
                        >
                            <option value="official">Official</option>
                            <option value="event">Event</option>
                            <option value="cultural">Cultural</option>
                            <option value="academic">Academic</option>
                            <option value="administrative">Administrative</option>
                            <option value="emergency">Emergency</option>
                            <option value="sports">Sports</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                        placeholder="Type notice content here. Click 'AI Suggest' to automatically set priority and summary."
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Summary</label>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                                if (!content) return;
                                setSuggesting(true);
                                const genSummary = await generateSummaryV2(content);
                                setSummary(genSummary);
                                setSuggesting(false);
                            }}
                            disabled={!content || suggesting}
                        >
                            ✨ Generate Summary
                        </Button>
                    </div>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        rows={2}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="AI Generated summary will appear here..."
                    />
                    <p className="text-xs text-muted-foreground">
                        You can edit the AI generated summary before publishing.
                    </p>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="w-32">
                        {loading ? "Publishing..." : "Publish Notice"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
