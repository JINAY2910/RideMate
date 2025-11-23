require('dotenv').config();

console.log('--- Environment Variable Check ---');
console.log('GEOCODING_PROVIDER:', process.env.GEOCODING_PROVIDER);
console.log('GOOGLE_MAPS_API_KEY:', process.env.GOOGLE_MAPS_API_KEY ? 'Present (' + process.env.GOOGLE_MAPS_API_KEY.substring(0, 5) + '...)' : 'Missing');
console.log('MAPBOX_ACCESS_TOKEN:', process.env.MAPBOX_ACCESS_TOKEN ? 'Present' : 'Missing');
console.log('GEOAPIFY_API_KEY:', process.env.GEOAPIFY_API_KEY ? 'Present' : 'Missing');
console.log('POSITIONSTACK_API_KEY:', process.env.POSITIONSTACK_API_KEY ? 'Present' : 'Missing');
console.log('PORT:', process.env.PORT);
console.log('----------------------------------');
