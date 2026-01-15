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
        if (process.env.NODE_ENV === 'development') {
            console.error('Location API Error:', error.message);
        }
        return NextResponse.json({ locations: [] });
    }
}
