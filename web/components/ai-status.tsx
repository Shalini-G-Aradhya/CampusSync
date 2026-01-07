"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

export function AIStatus() {
    const [isAIOnline, setIsAIOnline] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Simple check - we know AI is offline due to quota
        const checkAIStatus = async () => {
            setChecking(true);
            try {
                // Try a simple AI call - this will fail due to quota
                const response = await fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: 'test' })
                });
                setIsAIOnline(response.ok);
            } catch (error) {
                setIsAIOnline(false);
            } finally {
                setChecking(false);
            }
        };

        // Check immediately and then every 30 seconds
        checkAIStatus();
        const interval = setInterval(checkAIStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    if (checking) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
                Checking AI status...
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isAIOnline ? (
                <>
                    <Wifi className="h-3 w-3 text-green-500" />
                    AI Online
                </>
            ) : (
                <>
                    <WifiOff className="h-3 w-3 text-red-500" />
                    AI Offline (Quota Exceeded)
                </>
            )}
        </div>
    );
}
