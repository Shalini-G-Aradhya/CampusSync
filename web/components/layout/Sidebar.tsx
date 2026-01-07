import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
    const { logout, userData } = useAuth();
    const isFacultyOrAdmin = userData?.role === 'admin' || userData?.role === 'faculty';

    return (
        <div className="h-screen w-64 bg-card border-r border-border p-4 flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-primary">CampusSync</h1>
                <p className="text-xs text-muted-foreground mt-1 capitalize">Role: {userData?.role || 'Guest'}</p>
            </div>
            <nav className="flex-1 space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </Button>
                {isFacultyOrAdmin && (
                    <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/analytics">Analytics</Link>
                    </Button>
                )}
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/notices">Notices</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/lost-found">Lost & Found</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/issues">Issues</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/help-desk">Help Desk</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/study-planner">Study Planner</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/map">Campus Map</Link>
                </Button>
            </nav>
            <div className="mt-auto">
                <Button variant="outline" className="w-full" onClick={logout}>
                    Logout
                </Button>
            </div>
        </div>
    );
}
