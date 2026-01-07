"use client";

import { useEffect, useState } from "react";
import { Notice } from "@/types";
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Trash2, Eye, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function NoticesPage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
    const [loading, setLoading] = useState(true);
    const { userData } = useAuth();
    const canCreateNotice = userData?.role === "admin" || userData?.role === "faculty";

    useEffect(() => {
        const fetchNotices = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const noticesData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
                    };
                }) as Notice[];

                // Multi-tier sorting: Priority (High > Medium > Low) then Date (Newest first)
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                const sortedNotices = noticesData.sort((a, b) => {
                    const pA = priorityWeight[a.priority] || 0;
                    const pB = priorityWeight[b.priority] || 0;

                    if (pA !== pB) return pB - pA; // Higher priority first
                    return b.createdAt.getTime() - a.createdAt.getTime(); // Newer date first
                });

                setNotices(sortedNotices);
            } catch (error) {
                console.error("Error fetching notices:", error);
                toast.error("Failed to load notices");
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this notice?")) return;

        try {
            await deleteDoc(doc(db, "notices", id));
            setNotices(prev => prev.filter(n => n.id !== id));
            toast.success("Notice deleted successfully!");
        } catch (error) {
            console.error("Error deleting notice:", error);
            toast.error("Failed to delete notice");
        }
    };

    const getCalendarLink = (notice: Notice) => {
        const title = encodeURIComponent(notice.title);
        const details = encodeURIComponent(notice.summary || notice.content);
        const now = new Date();
        const start = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
        const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Notices Board</h1>
                    <p className="text-muted-foreground">Stay updated with latest campus announcements</p>
                </div>
                {canCreateNotice && (
                    <Button asChild>
                        <Link href="/notices/create">
                            <Plus className="mr-2 h-4 w-4" /> Create Notice
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    // Skeleton loaders
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ))
                ) : (
                    notices.map((notice) => (
                        <div
                            key={notice.id}
                            onClick={() => setSelectedNotice(notice)}
                            className="group relative cursor-pointer rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
                        >
                            <div className="mb-2 flex items-start justify-between">
                                <div className="flex gap-2 items-center">
                                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${notice.priority === 'high' ? 'bg-red-100 text-red-700' :
                                        notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {notice.category.toUpperCase()}
                                    </span>
                                    {(userData?.role === 'admin' || userData?.role === 'faculty') && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(notice.id);
                                            }}
                                            className="text-muted-foreground hover:text-red-600 transition-colors"
                                            title="Delete Notice"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {notice.createdAt.toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-primary group-hover:text-primary/80 transition-colors line-clamp-2">{notice.title}</h3>
                            {notice.summary && (
                                <div className="mb-2 rounded-md bg-accent/50 p-2 text-sm text-accent-foreground">
                                    <strong>AI Summary:</strong> {notice.summary}
                                </div>
                            )}
                            <p className="line-clamp-4 text-sm text-muted-foreground">
                                {notice.content}
                            </p>
                            <div className="mt-4 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="mr-1 h-3.5 w-3.5" /> Read Full Notice
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Full Notice Dialog */}
            <Dialog open={!!selectedNotice} onOpenChange={(open) => !open && setSelectedNotice(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    {selectedNotice && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wider ${selectedNotice.priority === 'high' ? 'bg-red-100 text-red-700' :
                                        selectedNotice.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {selectedNotice.category}
                                    </span>
                                    <span className="text-sm text-muted-foreground italic">
                                        Published on {selectedNotice.createdAt.toLocaleDateString()}
                                    </span>
                                </div>
                                <DialogTitle className="text-2xl font-bold leading-tight text-primary">
                                    {selectedNotice.title}
                                </DialogTitle>
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1.5"
                                        onClick={() => window.open(getCalendarLink(selectedNotice), '_blank')}
                                    >
                                        <Calendar className="h-3.5 w-3.5" />
                                        Add to Calendar
                                    </Button>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {selectedNotice.summary && (
                                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                                        <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold">
                                            <Eye className="h-4 w-4" />
                                            <span>Quick Summary</span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {selectedNotice.summary}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Detailed Content</h4>
                                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
                                        {selectedNotice.content}
                                    </div>
                                </div>

                                <div className="pt-6 border-t flex justify-end">
                                    <Button variant="outline" onClick={() => setSelectedNotice(null)}>
                                        Close Notice
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
