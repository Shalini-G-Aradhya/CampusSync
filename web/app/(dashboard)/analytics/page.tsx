"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { FileText, AlertCircle, Package, TrendingUp, Users, Calendar } from "lucide-react";

interface Stats {
    totalNotices: number;
    totalIssues: number;
    totalLostItems: number;
    totalFoundItems: number;
    activeIssues: number;
    highPriorityNotices: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
    const { userData } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalNotices: 0,
        totalIssues: 0,
        totalLostItems: 0,
        totalFoundItems: 0,
        activeIssues: 0,
        highPriorityNotices: 0,
    });
    const [loading, setLoading] = useState(true);
    const [categoryData, setCategoryData] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Fetch notices
                const noticesSnap = await getDocs(collection(db, "notices"));
                const notices = noticesSnap.docs.map(d => d.data());

                // Fetch issues
                const issuesSnap = await getDocs(collection(db, "issues"));
                const issues = issuesSnap.docs.map(d => d.data());

                // Fetch lost items
                const lostSnap = await getDocs(collection(db, "lostItems"));
                const lostItems = lostSnap.docs.map(d => d.data());

                // Fetch found items
                const foundSnap = await getDocs(collection(db, "foundItems"));
                const foundItems = foundSnap.docs.map(d => d.data());

                // Calculate stats
                setStats({
                    totalNotices: notices.length,
                    totalIssues: issues.length,
                    totalLostItems: lostItems.length,
                    totalFoundItems: foundItems.length,
                    activeIssues: issues.filter((i: any) => i.status === "pending").length,
                    highPriorityNotices: notices.filter((n: any) => n.priority === "high").length,
                });

                // Category breakdown for notices
                const categories: any = {};
                notices.forEach((n: any) => {
                    categories[n.category] = (categories[n.category] || 0) + 1;
                });

                const catData = Object.entries(categories).map(([name, value]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    value
                }));
                setCategoryData(catData);

            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const activityData = [
        { name: 'Notices', count: stats.totalNotices },
        { name: 'Issues', count: stats.totalIssues },
        { name: 'Lost', count: stats.totalLostItems },
        { name: 'Found', count: stats.totalFoundItems },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                    {userData?.role === 'admin' ? 'Campus-wide statistics and insights' : 'Your activity overview'}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalNotices}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.highPriorityNotices} high priority
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeIssues}</div>
                        <p className="text-xs text-muted-foreground">
                            of {stats.totalIssues} total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lost Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLostItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting recovery
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Found Items</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalFoundItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Ready to claim
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Activity Overview</CardTitle>
                        <CardDescription>Total submissions across all modules</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notice Categories</CardTitle>
                        <CardDescription>Distribution by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Insights</CardTitle>
                    <CardDescription>Key metrics at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Most Active Category</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {categoryData.length > 0 ? categoryData.reduce((a, b) => a.value > b.value ? a : b).name : 'N/A'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Issue Resolution Rate</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {stats.totalIssues > 0 ? Math.round(((stats.totalIssues - stats.activeIssues) / stats.totalIssues) * 100) : 0}%
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">Lost Item Recovery Rate</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {stats.totalLostItems > 0 ? Math.round((stats.totalFoundItems / (stats.totalLostItems + stats.totalFoundItems)) * 100) : 0}%
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
