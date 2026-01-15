/**
 * Test your Next.js API routes with Amadeus
 * Run with: npx tsx test-api-routes.ts
 * Make sure dev server is running first: npm run dev
 */

const BASE_URL = 'http://localhost:3000';

console.log('🔧 Testing Next.js API Routes with Amadeus...\n');

/**
 * Test 1: Location Search
 * Your API uses: /api/locations?keyword=London
 */
async function testLocationAPI() {
    console.log('📝 Test 1: Location Search API');
    console.log('   GET /api/locations?keyword=London');
    
    const response = await fetch(`${BASE_URL}/api/locations?keyword=London`);
    
    if (!response.ok) {
        throw new Error(`Location API failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Response received');
    console.log(`   Found ${data.locations?.length || 0} locations`);
    
    if (data.locations && data.locations.length > 0) {
        console.log('   Sample locations:');
        data.locations.slice(0, 3).forEach((loc: any) => {
            console.log(`   - ${loc.code}: ${loc.name} (${loc.city}, ${loc.country})`);
        });
    }
    
    return data;
}

/**
 * Test 2: Flight Search
 * Your API uses: /api/flights?origin=NYC&destination=LON&date=2026-02-15
 */
async function testFlightSearchAPI() {
    console.log('\n📝 Test 2: Flight Search API');
    
    const params = new URLSearchParams({
        origin: 'JFK',
        destination: 'LHR',
        date: '2026-02-15',
    });
    
    console.log(`   GET /api/flights?${params}`);
    
    const response = await fetch(`${BASE_URL}/api/flights?${params}`);
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Flight API failed: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    console.log('✅ Response received');
    
    if (data.error) {
        console.log(`   ⚠️ API returned error: ${data.error}`);
        return data;
    }
    
    console.log(`   Found ${data.flights?.length || 0} flight offers`);
    
    if (data.flights && data.flights.length > 0) {
        console.log('   Sample offers:');
        data.flights.slice(0, 3).forEach((flight: any) => {
            console.log(`   - Flight ID: ${flight.id}`);
            console.log(`     Airline: ${flight.airline?.name || 'N/A'}`);
            console.log(`     Price: $${flight.price}`);
            console.log(`     Duration: ${flight.duration} mins`);
            console.log(`     Stops: ${flight.stops}`);
        });
    }
    
    return data;
}

/**
 * Main test function
 */
async function main() {
    try {
        console.log('─'.repeat(60));
        
        // Test Location API
        await testLocationAPI();
        
        // Test Flight Search API
        await testFlightSearchAPI();
        
        console.log('\n' + '─'.repeat(60));
        console.log('✅ All API route tests completed successfully! 🎉');
        console.log('─'.repeat(60));
        
    } catch (error) {
        console.error('\n❌ Error:', error);
        console.log('\n💡 Make sure the dev server is running: npm run dev');
        process.exit(1);
    }
}

main();
