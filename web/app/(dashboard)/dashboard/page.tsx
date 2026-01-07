"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bell, MapPin, Search, AlertTriangle, MessageSquare } from "lucide-react";

export default function DashboardPage() {
    const { userData } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {userData?.firstName || "User"}! Here's an overview of your campus.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Notices</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Latest Updates</div>
                        <p className="text-xs text-muted-foreground">Check official announcements</p>
                        <Button asChild className="mt-4 w-full" variant="secondary">
                            <Link href="/notices">View Notices</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lost & Found</CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Find Items</div>
                        <p className="text-xs text-muted-foreground">Report or find lost belongings</p>
                        <Button asChild className="mt-4 w-full" variant="secondary">
                            <Link href="/lost-found">Go to Gallery</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Issues</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Report</div>
                        <p className="text-xs text-muted-foreground">Track and report campus issues</p>
                        <Button asChild className="mt-4 w-full" variant="secondary">
                            <Link href="/issues">Track Issues</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Help Desk</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">AI Assistant</div>
                        <p className="text-xs text-muted-foreground">Get instant answers 24/7</p>
                        <Button asChild className="mt-4 w-full" variant="secondary">
                            <Link href="/help-desk">Ask AI</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Campus Map</CardTitle>
                        <CardDescription>
                            Quick navigation to important locations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="flex h-[200px] items-center justify-center rounded-md bg-muted">
                            <Button variant="link" asChild><Link href="/map" className="flex items-center gap-2"><MapPin /> Open Interactive Map</Link></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
