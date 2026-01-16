/**
 * OpenRouter API Client for AI-powered flight search
 * Using free models for natural language understanding
 */

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface OpenRouterResponse {
    id: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
            reasoning_details?: any;
        };
        finish_reason: string;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export interface FlightSearchIntent {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    adults?: number;
    travelClass?: string;
    intent?: 'search' | 'explore' | 'recommend';
    preferences?: string[];
}

// Free models available on OpenRouter
export const FREE_MODELS = {
    GPT_OSS: 'openai/gpt-oss-120b:free', // OpenAI's free OSS model with reasoning
    GEMINI_FLASH: 'google/gemini-2.0-flash-exp:free', // Google's latest free model
    GEMMA_2B: 'google/gemma-2-9b-it:free', // Google's open model
    LLAMA_3_8B: 'meta-llama/llama-3.2-3b-instruct:free', // Meta's free model
    MYTHOMAX: 'gryphe/mythomax-l2-13b:free', // Creative responses
} as const;

export class OpenRouterClient {
    private apiKey: string;
    private baseURL = 'https://openrouter.ai/api/v1';
    private defaultModel = FREE_MODELS.GPT_OSS;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async chat(
        messages: ChatMessage[],
        model: string = this.defaultModel,
        temperature: number = 0.7,
        enableReasoning: boolean = true
    ): Promise<OpenRouterResponse> {
        const body: any = {
            model,
            messages,
            temperature,
            max_tokens: 1000,
        };

        // Enable reasoning for GPT-OSS model
        if (model === FREE_MODELS.GPT_OSS && enableReasoning) {
            body.reasoning = { enabled: true };
        }

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                'X-Title': 'Flight Search Assistant'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
        }

        return response.json();
    }

    /**
     * Extract flight search intent from natural language query
     */
    async extractFlightIntent(userQuery: string): Promise<FlightSearchIntent> {
        const systemPrompt = `You are a flight search assistant. Extract structured flight search parameters from natural language queries.

Current date: ${new Date().toISOString().split('T')[0]}

Respond ONLY with a valid JSON object (no markdown, no code blocks) with these fields:
- origin: departure city/airport code (if mentioned)
- destination: arrival city/airport code (if mentioned)  
- departureDate: YYYY-MM-DD format (if mentioned, convert relative dates like "next week" to actual dates)
- returnDate: YYYY-MM-DD format (if mentioned)
- adults: number of passengers (default 1)
- travelClass: "ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", or "FIRST" (if mentioned)
- intent: "search" (specific search), "explore" (general browsing), or "recommend" (asking for suggestions)
- preferences: array of strings like ["direct flights", "cheapest", "fastest", "morning departure"]

Examples:
Query: "I want to fly from New York to London next Friday"
Response: {"origin":"NYC","destination":"LON","departureDate":"2026-01-23","adults":1,"travelClass":"ECONOMY","intent":"search","preferences":[]}

Query: "Cheapest round trip to Tokyo in March"
Response: {"destination":"TYO","departureDate":"2026-03-01","adults":1,"travelClass":"ECONOMY","intent":"search","preferences":["cheapest","round trip"]}

Query: "Where can I travel in Europe for under $500?"
Response: {"destination":"Europe","adults":1,"travelClass":"ECONOMY","intent":"recommend","preferences":["budget friendly","under $500"]}`;

        const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuery }
        ];

        const response = await this.chat(messages, FREE_MODELS.GPT_OSS, 0.3, true);
        const content = response.choices[0]?.message?.content || '{}';
        
        // Clean up response - remove markdown code blocks if present
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        try {
            return JSON.parse(cleanContent);
        } catch (error) {
            console.error('Failed to parse AI response:', cleanContent);
            return { intent: 'search' };
        }
    }

    /**
     * Generate conversational response for flight search
     */
    async generateResponse(userQuery: string, context?: string): Promise<string> {
        const systemPrompt = `You are a helpful flight search assistant. Help users find flights naturally and conversationally.
Be concise, friendly, and guide them through their search. If they ask vague questions, help them narrow down options.
Current date: ${new Date().toISOString().split('T')[0]}`;

        const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
        ];

        if (context) {
            messages.push({ role: 'assistant', content: context });
        }

        messages.push({ role: 'user', content: userQuery });

        const response = await this.chat(messages, FREE_MODELS.GPT_OSS, 0.8, true);
        return response.choices[0]?.message?.content || 'I can help you search for flights. Where would you like to go?';
    }
}

// Singleton instance
let openRouterClient: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
    if (!openRouterClient) {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENROUTER_API_KEY is not set in environment variables');
        }
        openRouterClient = new OpenRouterClient(apiKey);
    }
    return openRouterClient;
}
