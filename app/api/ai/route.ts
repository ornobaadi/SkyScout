import { NextResponse } from 'next/server';
import { getOpenRouterClient } from '@/lib/openrouter-client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query, action = 'extract' } = body;

        if (!query || typeof query !== 'string') {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        const client = getOpenRouterClient();

        if (action === 'extract') {
            // Extract flight search intent from natural language
            const intent = await client.extractFlightIntent(query);
            return NextResponse.json({ intent });
        } else if (action === 'chat') {
            // Generate conversational response
            const response = await client.generateResponse(query, body.context);
            return NextResponse.json({ response });
        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "extract" or "chat"' },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('AI API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process AI request' },
            { status: 500 }
        );
    }
}
