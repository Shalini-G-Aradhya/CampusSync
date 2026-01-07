export async function callInternalAI(prompt: any, type: 'text' | 'image' = 'text', imageUrl?: string): Promise<string> {
    try {
        console.log(`[CampusSync AI] Routing request through server bridge...`);
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, type, imageUrl })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("AI Bridge Detailed Log:", data.details);
            throw new Error(data.details || data.error || "Internal Server Error");
        }
        return data.text;
    } catch (error: any) {
        console.error("AI Bridge Error:", error);
        // Return offline AI response
        return getOfflineAIResponse(prompt);
    }
}

// Simple offline AI responses
function getOfflineAIResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Study planner responses
    if (lowerPrompt.includes('study') || lowerPrompt.includes('subjects')) {
        return `I'll help you create a study plan! Based on your subjects and available time, here's a structured approach:

## Study Schedule
- **Focus Sessions**: 45-50 minutes each
- **Breaks**: 10-15 minutes between sessions
- **Review**: End with 15-minute review

## Recommended Techniques
- Active recall and spaced repetition
- Practice problems after each topic
- Regular breaks to maintain focus

This plan will help you study efficiently and retain information better!`;
    }
    
    // Help desk responses
    if (lowerPrompt.includes('help') || lowerPrompt.includes('issue') || lowerPrompt.includes('problem')) {
        return `I understand you need help! Here's how I can assist:

## Available Options:
1. **Create a Support Ticket** - Use the Tickets tab for formal requests
2. **Check Status** - Track existing tickets and issues
3. **Common Solutions** - Try refreshing the page or checking your connection

## Quick Help:
- For technical issues: Try clearing browser cache
- For account problems: Use the Help Desk ticket system
- For urgent matters: Contact campus support directly

I'm here to help with any questions you have!`;
    }
    
    // Lost & found responses
    if (lowerPrompt.includes('lost') || lowerPrompt.includes('found')) {
        return `I can help with lost and found items!

## What I Can Do:
- **Match Items**: Find potential matches between lost and found items
- **Search**: Look through existing reports
- **Guidance**: Help you report items effectively

## Tips:
- Be specific in descriptions (color, brand, location)
- Include clear photos if possible
- Check regularly for new matches

Would you like me to help you find matches or report an item?`;
    }
    
    // Default response
    return `I'm here to help with CampusSync! I can assist you with:

## My Capabilities:
- 📚 **Study Planning** - Create personalized study schedules
- 🎫 **Lost & Found** - Help find lost items or report found ones
- 🛠️ **Issue Reporting** - Track maintenance and facility issues
- 📍 **Campus Navigation** - Help you find locations
- 💬 **General Support** - Answer questions about campus services

## How to Use:
1. Tell me what you need help with
2. Be specific about your request
3. I'll guide you through the solution

What can I help you with today?`;
}

// Helper to ensure we only send the base64 data
const cleanBase64 = (base64: string) => {
    if (base64 && base64.includes(",")) return base64.split(",")[1];
    return base64;
};

export async function chatWithGeminiV2(message: string): Promise<string> {
    try {
        const systemKnowledge = `
        You are the "CampusSync Pro" Official Digital Assistant. 
        
        IDENTITY:
        - You are the AI core of the "CampusSync" Integrated Campus Management System.
        - You are trained on the latest Gemini 2.0 Flash architecture, optimized for campus life.

        CORE MODULES & USER GUIDANCE:
        1. [Issues]: If users mention physical problems (e.g. leaking tap, broken fan, garbage), tell them to use the "Issues" tab. We use automated routing to get maintenance there instantly.
        2. [Help Desk]: For administrative help (Scholarships, Admissions, ID cards), tell them to open a ticket in the "Help Desk" tab.
        3. [Lost & Found]: We use Computer Vision to match lost items. If a user lost something, they should report it in the "Lost & Found" module.
        4. [Notices]: You help summarize official dean notices and university announcements for efficiency.
        5. [Campus Map]: We have a high-precision interactive map for finding lecture halls, labs, and cafeteria.

        TONE:
        - Professional, helpful, and concise. 
        - Use "we" to refer to the CampusSync team.
        - Always pivot the conversation toward how the CampusSync platform can solve their problem.
        `;

        const fullPrompt = `${systemKnowledge}\n\nUser: ${message}\nAssistant:`;
        return await callInternalAI(fullPrompt);
    } catch (error: any) {
        return `AI Error (Server): ${error.message}`;
    }
}

export async function generateSummaryV2(text: string): Promise<string> {
    try {
        return await callInternalAI(`Summarize this in one sentence: ${text}`);
    } catch (e) { return "Summary unavailable."; }
}

export async function findMatchesV2(targetItem: any, candidates: any[]): Promise<string[]> {
    try {
        const prompt = `Match this item: ${targetItem.title}. Candidates: ${JSON.stringify(candidates)}. Return JSON array of IDs only.`;
        const text = await callInternalAI(prompt);
        const match = text.match(/\[[\s\S]*\]/);
        return JSON.parse(match ? match[0] : "[]");
    } catch (e) { return []; }
}

export async function analyzeImageV2(base64Image: string): Promise<string> {
    try {
        return await callInternalAI("Identify this item (2-3 words).", 'image', cleanBase64(base64Image));
    } catch (e) { return "Unknown Item"; }
}

export async function classifyNoticeV2(content: string): Promise<{ priority: string, category: string }> {
    try {
        const text = await callInternalAI(`Classify notice: "${content}". Return JSON {priority, category}.`);
        const match = text.match(/\{[\s\S]*\}/);
        return JSON.parse(match ? match[0] : '{"priority":"medium","category":"general"}');
    } catch (e) { return { priority: "medium", category: "general" }; }
}

export async function classifyTicketV2(content: string, imageUrl?: string): Promise<{ priority: string, category: string, summary: string }> {
    try {
        const prompt = `Classify ticket: "${content}". Return JSON {priority, category, summary}.`;
        const text = await callInternalAI(prompt, imageUrl ? 'image' : 'text', imageUrl ? cleanBase64(imageUrl) : undefined);
        const match = text.match(/\{[\s\S]*\}/);
        return JSON.parse(match ? match[0] : '{"priority":"low","category":"general","summary":"Issue reported"}');
    } catch (e) { return { priority: "low", category: "general", summary: "Issue reported" }; }
}
export async function translateTextV2(text: string, targetLanguage: string): Promise<string> {
    try {
        const prompt = `Translate the following text into ${targetLanguage}. Maintain the original tone and format. Only return the translated text:\n\n${text}`;
        return await callInternalAI(prompt);
    } catch (error: any) {
        console.error("Translation Error:", error);
        return text; // Fallback to original text
    }
}

export async function generateStudyPlanV2(subjects: string, freeTime: string): Promise<string> {
    try {
        const prompt = `Act as an expert academic advisor. Create a highly structured, realistic study plan. 
        Subjects: ${subjects}
        Available Time: ${freeTime}
        Format the response in clear Markdown with headings, bullet points, and specific time blocks. Focus on efficiency and active recall.`;
        return await callInternalAI(prompt);
    } catch (error: any) {
        return "Failed to generate study plan. Please try again with more details.";
    }
}
