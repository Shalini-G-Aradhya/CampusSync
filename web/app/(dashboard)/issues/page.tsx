"use client";

import { useEffect, useState } from "react";
import { Issue } from "@/types";
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function IssuesPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("infrastructure");
    const [priority, setPriority] = useState("medium");
    const [loading, setLoading] = useState(false);

    const { user, userData } = useAuth();

    const fetchIssues = async () => {
        if (!userData) return;

        try {
            let q;
            const isStaff = userData.role === 'admin' || userData.role === 'faculty';

            if (isStaff) {
                // Admins/Faculty see all issues
                const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => {
                    const d = doc.data();
                    return {
                        id: doc.id,
                        ...d,
                        createdAt: d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt),
                        updatedAt: d.updatedAt.toDate ? d.updatedAt.toDate() : new Date(d.updatedAt),
                    }
                }) as Issue[];
                setIssues(data);
            } else {
                // Students only see issues they reported
                // Removed orderBy from query to avoid composite index requirement
                const q = query(
                    collection(db, "issues"),
                    where("reportedBy", "==", userData.uid)
                );
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => {
                    const d = doc.data();
                    return {
                        id: doc.id,
                        ...d,
                        createdAt: d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt),
                        updatedAt: d.updatedAt.toDate ? d.updatedAt.toDate() : new Date(d.updatedAt),
                    }
                }) as Issue[];

                // Sort in memory instead
                const sortedData = data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                setIssues(sortedData);
            }
        } catch (error) {
            console.error("Error fetching issues:", error);
            // If it's an index error, suggest simple local filtering for the hackathon
            if ((error as any).code === 'failed-precondition') {
                console.log("Fallback to local filtering due to missing index...");
                const qFull = query(collection(db, "issues"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(qFull);
                const allData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: (doc.data() as any).createdAt.toDate ? (doc.data() as any).createdAt.toDate() : new Date((doc.data() as any).createdAt)
                })) as Issue[];

                const isStaff = userData.role === 'admin' || userData.role === 'faculty';
                setIssues(isStaff ? allData : allData.filter(i => i.reportedBy === userData.uid));
            }
        }
    };

    useEffect(() => {
        if (userData) {
            fetchIssues();
        }
    }, [userData]);

    const handleDelete = async (issueId: string) => {
        if (!confirm("Are you sure you want to delete this issue?")) return;

        try {
            await deleteDoc(doc(db, "issues", issueId));
            setIssues(prev => prev.filter(i => i.id !== issueId));
            alert("Issue deleted successfully!");
        } catch (error) {
            console.error("Error deleting issue:", error);
            alert("Failed to delete issue.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submit Issue clicked", { userData });
        if (!userData) {
            alert("Please wait for your profile to load or refresh the page.");
            return;
        }
        
        // Prevent multiple submissions
        if (loading) return;
        setLoading(true);

        try {
            const issueData = {
                title: title.trim(),
                description: description.trim(),
                category,
                priority,
                status: "open",
                reportedBy: userData.uid,
                reportedByEmail: userData.email,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            console.log("Attempting to add issue to Firestore:", issueData);
            
            // Add small delay to prevent concurrent writes
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await addDoc(collection(db, "issues"), issueData);
            console.log("Issue added successfully");
            setShowForm(false);
            setTitle("");
            setDescription("");
            setCategory("infrastructure");
            setPriority("medium");
            
            // Refresh data with delay
            setTimeout(() => {
                fetchIssues();
            }, 500);
            
            alert("Issue reported successfully!");
        } catch (error: any) {
            console.error("Detailed Error creating issue:", error);
            if (error.message?.includes("already active")) {
                alert("Please wait a moment and try again.");
            } else {
                alert("Failed to report issue: " + (error.message || "Unknown error"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Issue Tracking</h1>
                    <p className="text-muted-foreground">Report and track campus issues.</p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Report Issue
                    </Button>
                )}
            </div>

            {showForm && (
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">New Issue Report</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="infrastructure">Infrastructure</option>
                                    <option value="academic">Academic</option>
                                    <option value="hostel">Hostel</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Report"}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {issues.map((issue) => (
                    <div
                        key={issue.id}
                        onClick={() => setSelectedIssue(issue)}
                        className="group cursor-pointer rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex gap-2 items-center">
                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${issue.status === 'open' ? 'bg-red-100 text-red-700' :
                                    issue.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {issue.status.toUpperCase()}
                                </span>
                                {(userData?.role === 'admin' || userData?.role === 'faculty' || issue.reportedBy === userData?.uid) && (
                                    <button
                                        onClick={() => handleDelete(issue.id)}
                                        className="text-muted-foreground hover:text-red-600 transition-colors"
                                        title="Delete Issue"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">{issue.createdAt.toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-semibold text-primary">{issue.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                        <div className="mt-3 text-xs text-muted-foreground">
                            Category: <span className="capitalize">{issue.category}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Issue Detail Dialog */}
            <Dialog open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
                <DialogContent className="max-w-2xl overflow-y-auto max-h-[85vh]">
                    {selectedIssue && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider">
                                    <span className={`rounded-full px-2 py-0.5 ${selectedIssue.status === 'open' ? 'bg-red-100 text-red-700' :
                                        selectedIssue.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'}`}>
                                        {selectedIssue.status}
                                    </span>
                                    <span className={`rounded-full px-2 py-0.5 ${selectedIssue.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {selectedIssue.priority} Priority
                                    </span>
                                    <span className="text-muted-foreground italic normal-case font-normal">
                                        Reported on {selectedIssue.createdAt.toLocaleDateString()}
                                    </span>
                                </div>
                                <DialogTitle className="text-2xl font-bold leading-tight text-primary">
                                    {selectedIssue.title}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Category</p>
                                        <p className="text-sm font-medium capitalize">{selectedIssue.category}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Reported By</p>
                                        <p className="text-sm font-medium">{selectedIssue.reportedByEmail}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Description</h4>
                                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
                                        {selectedIssue.description}
                                    </div>
                                </div>

                                <div className="pt-6 border-t flex justify-end">
                                    <Button variant="outline" onClick={() => setSelectedIssue(null)}>
                                        Close Details
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
