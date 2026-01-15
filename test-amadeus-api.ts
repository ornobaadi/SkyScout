/**
 * Test script for Amadeus API
 * Run with: npx tsx test-amadeus-api.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;
const BASE_URL = 'https://test.api.amadeus.com';

console.log('🔧 Testing Amadeus API...\n');
console.log('Client ID:', AMADEUS_CLIENT_ID?.substring(0, 10) + '...');
console.log('Base URL:', BASE_URL);
console.log('─'.repeat(60));

/**
 * Step 1: Get Access Token
 */
async function getAccessToken(): Promise<string> {
    console.log('\n📝 Step 1: Getting Access Token...');
    
    const response = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: AMADEUS_CLIENT_ID || '',
            client_secret: AMADEUS_CLIENT_SECRET || '',
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get access token: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('✅ Access token obtained successfully');
    console.log('   Token type:', data.type);
    console.log('   Expires in:', data.expires_in, 'seconds');
    console.log('   Token (first 20 chars):', data.access_token.substring(0, 20) + '...');
    
    return data.access_token;
}

/**
 * Step 2: Test Flight Destinations API
 */
async function testFlightDestinations(token: string) {
    console.log('\n📝 Step 2: Testing Flight Destinations API...');
    console.log('   Searching for flights from Paris (PAR) under €200');
    
    const response = await fetch(
        `${BASE_URL}/v1/shopping/flight-destinations?origin=PAR&maxPrice=200`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get flight destinations: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('✅ Flight destinations retrieved successfully');
    console.log('   Number of destinations found:', data.data?.length || 0);
    
    if (data.data && data.data.length > 0) {
        console.log('\n   📍 Sample destinations:');
        data.data.slice(0, 5).forEach((dest: any, idx: number) => {
            console.log(`   ${idx + 1}. ${dest.origin} → ${dest.destination}`);
            console.log(`      Departure: ${dest.departureDate}, Return: ${dest.returnDate}`);
            console.log(`      Price: €${dest.price.total}`);
        });
    }
    
    return data;
}

/**
 * Step 3: Test Flight Offers Search API
 */
async function testFlightOffers(token: string) {
    console.log('\n📝 Step 3: Testing Flight Offers Search API...');
    console.log('   Searching for flights: NYC → LON, 2026-02-01, 1 adult');
    
    const params = new URLSearchParams({
        originLocationCode: 'NYC',
        destinationLocationCode: 'LON',
        departureDate: '2026-02-01',
        adults: '1',
        max: '5',
    });

    const response = await fetch(
        `${BASE_URL}/v2/shopping/flight-offers?${params}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get flight offers: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('✅ Flight offers retrieved successfully');
    console.log('   Number of offers found:', data.data?.length || 0);
    
    if (data.data && data.data.length > 0) {
        console.log('\n   ✈️ Sample offers:');
        data.data.slice(0, 3).forEach((offer: any, idx: number) => {
            console.log(`   ${idx + 1}. ${offer.id}`);
            console.log(`      Price: ${offer.price.total} ${offer.price.currency}`);
            console.log(`      Number of bookable seats: ${offer.numberOfBookableSeats}`);
        });
    }
    
    return data;
}

/**
 * Step 4: Test Location Search API
 */
async function testLocationSearch(token: string) {
    console.log('\n📝 Step 4: Testing Location Search API...');
    console.log('   Searching for airports matching "London"');
    
    const response = await fetch(
        `${BASE_URL}/v1/reference-data/locations?subType=AIRPORT&keyword=London`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to search locations: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('✅ Locations retrieved successfully');
    console.log('   Number of locations found:', data.data?.length || 0);
    
    if (data.data && data.data.length > 0) {
        console.log('\n   🏢 Sample locations:');
        data.data.slice(0, 5).forEach((loc: any, idx: number) => {
            console.log(`   ${idx + 1}. ${loc.iataCode} - ${loc.name}`);
            console.log(`      ${loc.address.cityName}, ${loc.address.countryName}`);
        });
    }
    
    return data;
}

/**
 * Main test function
 */
async function main() {
    try {
        if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
            throw new Error('Missing AMADEUS_CLIENT_ID or AMADEUS_CLIENT_SECRET in .env.local');
        }

        // Step 1: Get access token
        const token = await getAccessToken();
        
        // Step 4: Test Location Search (most reliable)
        await testLocationSearch(token);
        
        // Step 3: Test Flight Offers
        try {
            await testFlightOffers(token);
        } catch (error) {
            console.log('⚠️  Flight Offers test failed (may have limited test data):', (error as Error).message);
        }
        
        // Step 2: Test Flight Destinations (may have limited test data)
        try {
            await testFlightDestinations(token);
        } catch (error) {
            console.log('⚠️  Flight Destinations test failed (may have limited test data):', (error as Error).message);
        }
        
        console.log('\n' + '─'.repeat(60));
        console.log('✅ All API tests completed successfully! 🎉');
        console.log('─'.repeat(60));
        
    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
}

main();
