import { NextResponse } from 'next/server';
import { amadeus } from '@/lib/amadeus-client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword || keyword.length < 2) {
        return NextResponse.json({ locations: [], searchedCountry: null });
    }

    try {
        // Search for airports and cities
        const response = await amadeus.referenceData.locations.get({
            keyword,
            subType: 'AIRPORT,CITY'
        });

        const locations = response.data.map((loc: any) => ({
            code: loc.iataCode,
            name: loc.name,
            city: loc.address?.cityName || loc.name,
            country: loc.address?.countryName || '',
            countryCode: loc.address?.countryCode || '',
            type: loc.subType // AIRPORT or CITY
        }));

        // Check if the search term matches a country name
        const searchLower = keyword.toLowerCase();
        let searchedCountry: string | null = null;
        const countryMatches: Record<string, number> = {};

        // Calculate relevance score for each country
        locations.forEach((loc: any) => {
            if (loc.country) {
                const countryLower = loc.country.toLowerCase();
                
                // Exact match gets highest score
                if (countryLower === searchLower) {
                    countryMatches[loc.country] = 1000;
                    searchedCountry = loc.country;
                }
                // Starts with gets second priority
                else if (countryLower.startsWith(searchLower)) {
                    countryMatches[loc.country] = Math.max(countryMatches[loc.country] || 0, 500);
                    if (!searchedCountry) searchedCountry = loc.country;
                }
                // Contains gets third priority
                else if (countryLower.includes(searchLower)) {
                    countryMatches[loc.country] = Math.max(countryMatches[loc.country] || 0, 100);
                    if (!searchedCountry) searchedCountry = loc.country;
                }
                // Default score for countries that don't match
                else {
                    countryMatches[loc.country] = Math.max(countryMatches[loc.country] || 0, 1);
                }
            }
        });

        // Sort locations by country relevance, then by city name
        const sortedLocations = locations.sort((a: any, b: any) => {
            const scoreA = countryMatches[a.country] || 0;
            const scoreB = countryMatches[b.country] || 0;
            
            if (scoreB !== scoreA) {
                return scoreB - scoreA; // Higher score first
            }
            
            // Within same country, sort by city name
            return a.city.localeCompare(b.city);
        });

        // Filter to only show top relevant countries (to avoid clutter)
        // If searching for a country, show only that country and maybe 1-2 others
        let filteredLocations = sortedLocations;
        if (searchedCountry && countryMatches[searchedCountry] >= 500) {
            // Strong country match - prioritize that country heavily
            const topCountries = Object.entries(countryMatches)
                .filter(([_, score]) => score >= 100)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([country]) => country);
            
            filteredLocations = sortedLocations.filter((loc: any) => 
                topCountries.includes(loc.country)
            );
        }

        return NextResponse.json({ 
            locations: filteredLocations, 
            searchedCountry,
            relevanceScores: countryMatches
        });
    } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Location API Error:', error.message);
        }
        return NextResponse.json({ locations: [], searchedCountry: null });
    }
}
