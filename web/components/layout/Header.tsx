"use client";

import { Search, Moon, Sun, BookOpen } from "lucide-react";
import ProfileDialog from "../dashboard/ProfileDialog";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-card">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                {mounted && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="h-9 w-9"
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                )}
                <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                    <Link href="/study-planner">
                        <BookOpen className="h-4 w-4 text-purple-500" />
                        <span className="sr-only">Study Planner</span>
                    </Link>
                </Button>
                <ProfileDialog />
            </div>
        </header>
    );
}
