"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, BookOpen, Clock, Download } from "lucide-react";
import { generateStudyPlanV2 } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";
import { AIStatus } from "@/components/ai-status";

export default function StudyPlannerPage() {
    const [subjects, setSubjects] = useState("");
    const [freeTime, setFreeTime] = useState("");
    const [plan, setPlan] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!subjects || !freeTime) {
            alert("Please enter both subjects and your available time.");
            return;
        }

        setLoading(true);
        try {
            const result = await generateStudyPlanV2(subjects, freeTime);
            if (result.includes("AI Error") || result.includes("Failed to generate") || result.includes("quota") || result.includes("RESOURCE_EXHAUSTED")) {
                throw new Error("AI service unavailable");
            }
            setPlan(result);
        } catch (error) {
            console.error("Failed to generate plan:", error);
            // Fallback to a basic template when AI is unavailable
            const fallbackPlan = `# Study Schedule

## Subjects: ${subjects}
## Available Time: ${freeTime}

### Study Blocks:
- **Block 1**: Focus on most challenging topic
- **Break**: 15 minutes
- **Block 2**: Practice problems
- **Break**: 10 minutes  
- **Block 3**: Review and summarize

### Tips:
- Stay hydrated and take regular breaks
- Use active recall techniques
- Review material before sleep

*Note: AI features are currently unavailable due to API quota limits. This is a basic template that will be enhanced when AI services are restored.*`;
            setPlan(fallbackPlan);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([plan], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "My_Study_Plan.md";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                    AI Study Planner
                </h1>
                <p className="text-muted-foreground">
                    Get a personalized, high-efficiency study schedule powered by Gemini 2.0.
                </p>
                <AIStatus />
            </div>

            <div className="grid gap-6 md:grid-cols-5">
                <Card className="md:col-span-2 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Plan Your Session</CardTitle>
                        <CardDescription>Tell us what you need to study today.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                Subjects / Topics
                            </label>
                            <Textarea
                                placeholder="e.g. Data Structures (Graphs), Engineering Math (Integrals)..."
                                value={subjects}
                                onChange={(e) => setSubjects(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Available Time
                            </label>
                            <Input
                                placeholder="e.g. 5 PM to 9 PM, or 4 hours total"
                                value={freeTime}
                                onChange={(e) => setFreeTime(e.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full gap-2"
                            size="lg"
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="h-4 w-4" />
                            )}
                            Generate Plan
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 min-h-[500px] flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="text-lg">Your Schedule</CardTitle>
                            <CardDescription>Your AI-generated roadmap to success.</CardDescription>
                        </div>
                        {plan && (
                            <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
                                <Download className="h-4 w-4" />
                                Save as MD
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1 pb-6">
                        {plan ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none border rounded-lg p-6 bg-muted/30">
                                <ReactMarkdown>{plan}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-muted/10 border border-dashed rounded-lg border-muted-foreground/20">
                                <Sparkles className="h-12 w-12 text-muted-foreground/20 mb-4" />
                                <p className="text-muted-foreground italic">
                                    Fill in the details on the left and click "Generate Plan" to see your AI schedule.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
