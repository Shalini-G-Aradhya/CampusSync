import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt, type = 'text', imageUrl } = await req.json();
        
        // Use gemini-2.0-flash-lite for better quota
        const models = [
            "gemini-2.0-flash-lite",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash",
            "gemini-2.5-flash"
        ];

        for (const model of models) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: type === 'image' && imageUrl ? [
                                { role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: imageUrl } }] }
                            ] : [{ role: "user", parts: [{ text: prompt }] }],
                            generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
                        })
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`Model ${model} failed:`, errorData);
                    continue;
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
                
                return NextResponse.json({ text, model });
            } catch (error) {
                console.error(`Model ${model} error:`, error);
                continue;
            }
        }
        
        return NextResponse.json({ error: "All models failed", details: "API quota exceeded or service unavailable" }, { status: 500 });
    } catch (error: any) {
        console.error("AI API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
