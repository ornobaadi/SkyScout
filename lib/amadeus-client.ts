import Amadeus from 'amadeus';

// Initialize the Amadeus client
// This must only be used on the server side to protect client secrets

// Debug: Log credentials status (only shows in server console)
console.log('🔧 Amadeus Client Initialization:');
console.log('CLIENT_ID:', process.env.AMADEUS_CLIENT_ID ? `${process.env.AMADEUS_CLIENT_ID.substring(0, 10)}...` : '❌ MISSING');
console.log('CLIENT_SECRET:', process.env.AMADEUS_CLIENT_SECRET ? `${process.env.AMADEUS_CLIENT_SECRET.substring(0, 5)}...` : '❌ MISSING');
console.log('Environment: TEST');

if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
    console.error('❌ AMADEUS CREDENTIALS MISSING!');
    console.error('Make sure .env.local exists in the root directory with:');
    console.error('AMADEUS_CLIENT_ID=your_client_id');
    console.error('AMADEUS_CLIENT_SECRET=your_client_secret');
}

export const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET,
    hostname: 'test' // Use test environment - for production, use 'production'
});
