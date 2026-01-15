import { NextResponse } from 'next/server';
import { amadeus } from '@/lib/amadeus-client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword || keyword.length < 2) {
        return NextResponse.json({ locations: [] });
    }

    try {
        const response = await amadeus.referenceData.locations.get({
            keyword,
            subType: 'AIRPORT,CITY'
        });

        const locations = response.data.map((loc: any) => ({
            code: loc.iataCode,
            name: loc.name,
            city: loc.address?.cityName || loc.name,
            country: loc.address?.countryName || '',
            type: loc.subType // AIRPORT or CITY
        }));

        return NextResponse.json({ locations });
    } catch (error: any) {
        console.error('Amadeus Location Error:', error.description || error.message || error);
        
        // Log more details for debugging
        if (error.response) {
            console.error('Response Status:', error.response.statusCode);
            console.error('Response Body:', error.response.body);
        }
        
        // Check for auth errors
        if (error.response?.statusCode === 401) {
            console.error('🔐 AUTHENTICATION FAILED!');
            console.error('Your Amadeus API credentials are invalid or expired.');
            console.error('Please check:');
            console.error('1. Your credentials at https://developers.amadeus.com/');
            console.error('2. That .env.local has the correct AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET');
            console.error('3. Restart your dev server after updating .env.local');
        }
        
        return NextResponse.json({ locations: [] }); // Return empty on error to not break UI
    }
}
