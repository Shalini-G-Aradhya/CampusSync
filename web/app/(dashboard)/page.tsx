"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, FileText, HelpCircle, MapPin, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";

export default function DashboardPage() {
    const { userData } = useAuth();
    const role = userData?.role || "student";

    const [stats, setStats] = useState({
        notices: 0,
        issues: 0,
        lostItems: 0,
        tickets: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!userData) return;
            try {
                // Determine scope based on role
                const isStaff = userData.role === 'admin' || userData.role === 'faculty';

                // 1. Notices (Global)
                const noticesSnap = await getDocs(collection(db, "notices"));

                // 2. Issues (Role-based)
                const issuesQuery = isStaff
                    ? query(collection(db, "issues"))
                    : query(collection(db, "issues"), where("reportedBy", "==", userData.uid));
                const issuesSnap = await getDocs(issuesQuery);

                // 3. Lost Items (Global)
                const lostSnap = await getDocs(collection(db, "lost-items"));

                // 4. Help Tickets (Role-based)
                const ticketsQuery = isStaff
                    ? query(collection(db, "tickets"))
                    : query(collection(db, "tickets"), where("userId", "==", userData.uid));
                const ticketsSnap = await getDocs(ticketsQuery);

                setStats({
                    notices: noticesSnap.size,
                    issues: issuesSnap.size,
                    lostItems: lostSnap.size,
                    tickets: ticketsSnap.size
                });
            } catch (err) {
                console.error("Dashboard stats error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userData]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {userData?.name || userData?.email || "User"}. Here's what's happening on campus.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow cursor-default">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Notices</CardTitle>
                        <Bell className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.notices}</div>
                        <p className="text-xs text-muted-foreground">Campus-wide alerts</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-default">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Study Planner</CardTitle>
                        <BookOpen className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">AI</div>
                        <p className="text-xs text-muted-foreground">Smart scheduling</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-default">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Issue Reports</CardTitle>
                        <FileText className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.issues}</div>
                        <p className="text-xs text-muted-foreground">
                            {role === 'student' ? 'Your reports' : 'Total active'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-default">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lost & Found</CardTitle>
                        <MapPin className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lostItems}</div>
                        <p className="text-xs text-muted-foreground">Items logged</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Campus Health Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-2 rounded-lg bg-accent/30">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm flex-1">Systems are functioning normally.</span>
                            </div>
                            <div className="p-4 rounded-lg border border-border bg-card">
                                <p className="text-sm font-medium mb-1">Hackathon Demo Notice</p>
                                <p className="text-xs text-muted-foreground">All data is being fetched live from Firestore. Images are stored as Base64 clusters for zero-config deployment.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Role based actions */}
                            {role === "student" && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 flex flex-col items-start gap-1" asChild>
                                        <Link href="/lost-found/report">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-green-500" />
                                                <span className="font-semibold">Lost Item?</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">Report something lost</span>
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 flex flex-col items-start gap-1" asChild>
                                        <Link href="/issues">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-red-500" />
                                                <span className="font-semibold">Found a Bug?</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">Report campus issue</span>
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 flex flex-col items-start gap-1" asChild>
                                        <Link href="/study-planner">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-purple-500" />
                                                <span className="font-semibold">Study Plan</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">Create schedule</span>
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 flex flex-col items-start gap-1" asChild>
                                        <Link href="/help-desk">
                                            <div className="flex items-center gap-2">
                                                <HelpCircle className="h-4 w-4 text-blue-500" />
                                                <span className="font-semibold">Support</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">Get AI assistance</span>
                                        </Link>
                                    </Button>
                                </div>
                            )}

                            {role === "faculty" && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="default" className="w-full justify-start" asChild>
                                        <Link href="/notices/create">
                                            <Bell className="mr-2 h-4 w-4" /> Post Notice
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/help-desk">
                                            <FileText className="mr-2 h-4 w-4" /> View Tickets
                                        </Link>
                                    </Button>
                                </div>
                            )}

                            {role === "admin" && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="default" className="w-full justify-start shadow-md" asChild>
                                        <Link href="/notices/create">
                                            <Bell className="mr-2 h-4 w-4" /> Post Notice
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50" asChild>
                                        <Link href="/issues">
                                            <FileText className="mr-2 h-4 w-4" /> Review Issues
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

