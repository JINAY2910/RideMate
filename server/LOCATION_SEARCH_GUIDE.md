# Location Search Feature - Implementation Guide

## 🎯 Overview

The RideMate backend now supports Google Maps-style location search with autocomplete and geocoding. Users can search for locations by name (e.g., "Delhi Airport", "Connaught Place", "Sector 62 Noida") without manually providing coordinates.

## 🏗️ Architecture

### Backend Components

1. **Geocoding Service** (`server/utils/geocoding.js`)
   - Supports multiple providers: OpenStreetMap Nominatim (free), Google Maps, Mapbox
   - Automatic fallback to Nominatim if primary provider fails
   - Handles both geocoding (name → coordinates) and search (autocomplete)

2. **Location Controller** (`server/controllers/locationController.js`)
   - `GET /api/locations/search` - Autocomplete search
   - `GET /api/locations/geocode` - Geocode a location name

3. **Updated Ride Model** (`server/models/Ride.js`)
   - Uses GeoJSON format for coordinates
   - 2dsphere indexes for efficient geo-queries
   - Stores both place names and coordinates

4. **Updated Ride Controller** (`server/controllers/rideController.js`)
   - Automatically geocodes location names when creating rides
   - Supports geo-based search using `$near` queries
   - Falls back to text search if geocoding fails

### Frontend Components

1. **Location Service** (`src/services/locations.ts`)
   - `locationApi.search()` - Autocomplete search
   - `locationApi.geocode()` - Get coordinates from place name

2. **LocationAutocomplete Component** (`src/components/LocationAutocomplete.tsx`)
   - Google Maps-style autocomplete input
   - Keyboard navigation (arrow keys, enter, escape)
   - Loading states and error handling
   - Debounced search (300ms)

3. **Updated Screens**
   - `SearchRide.tsx` - Uses LocationAutocomplete for search
   - `CreateRide.tsx` - Uses LocationAutocomplete for ride creation

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Geocoding Provider (nominatim, google, or mapbox)
GEOCODING_PROVIDER=nominatim

# Optional: Google Maps API Key (if using google provider)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional: Mapbox Access Token (if using mapbox provider)
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

### Provider Options

1. **Nominatim (Default - Free)**
   - No API key required
   - Free and open-source
   - Rate limit: 1 request/second (recommended)
   - Good for development and small-scale applications

2. **Google Maps**
   - Requires API key from Google Cloud Console
   - More accurate results
   - Higher rate limits
   - Requires billing account (free tier available)

3. **Mapbox**
   - Requires access token from Mapbox account
   - Good balance of accuracy and cost
   - Generous free tier

## 📡 API Endpoints

### Search Locations (Autocomplete)

```http
GET /api/locations/search?q=delhi
```

**Response:**
```json
[
  {
    "name": "Delhi Airport, New Delhi, Delhi, India",
    "lat": 28.5562,
    "lng": 77.1000,
    "address": "Delhi Airport, New Delhi, Delhi, India",
    "placeId": "123456"
  },
  ...
]
```

### Geocode Location

```http
GET /api/locations/geocode?q=Delhi Airport
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Delhi Airport, New Delhi, Delhi, India",
    "lat": 28.5562,
    "lng": 77.1000,
    "address": "Delhi Airport, New Delhi, Delhi, India",
    "placeId": "123456"
  }
}
```

### Create Ride (with location names)

```http
POST /api/rides
Authorization: Bearer <token>
Content-Type: application/json

{
  "start": {
    "name": "Delhi Airport"
  },
  "destination": {
    "name": "Connaught Place"
  },
  "date": "2024-01-15",
  "time": "10:00 AM",
  "price": 500,
  "seatsAvailable": 3
}
```

The backend will automatically:
1. Geocode "Delhi Airport" → get coordinates
2. Geocode "Connaught Place" → get coordinates
3. Store both names and coordinates in database

### Search Rides (Geo-based)

```http
GET /api/rides?nearStart=Delhi Airport&nearDest=Connaught Place&radius=50000
```

**Query Parameters:**
- `nearStart` - Location name for start point (uses geo-query)
- `nearDest` - Location name for destination (uses geo-query)
- `radius` - Search radius in meters (default: 50000 = 50km)
- `date` - Filter by date
- `isActive` - Filter by active status

The backend will:
1. Geocode the location names
2. Use MongoDB `$near` query with 2dsphere index
3. Find rides within the specified radius

## 🗄️ Database Schema

### Ride Model (GeoJSON Format)

```javascript
{
  from: "Delhi Airport",  // Place name
  to: "Connaught Place",  // Place name
  startCoordinates: {
    type: "Point",
    coordinates: [77.1000, 28.5562]  // [lng, lat] - GeoJSON format
  },
  destCoordinates: {
    type: "Point",
    coordinates: [77.2185, 28.6304]  // [lng, lat]
  },
  // ... other fields
}
```

### Indexes

- `startCoordinates: '2dsphere'` - For geo-queries on start location
- `destCoordinates: '2dsphere'` - For geo-queries on destination
- Text indexes on `from` and `to` for fallback text search

## 🎨 Frontend Usage

### Using LocationAutocomplete Component

```tsx
import LocationAutocomplete from '../components/LocationAutocomplete';
import { Location } from '../services/locations';

const [location, setLocation] = useState<Location | null>(null);

<LocationAutocomplete
  label="From"
  value={location?.name || ''}
  onChange={setLocation}
  placeholder="Search location..."
/>
```

### Using Location Service

```tsx
import { locationApi } from '../services/locations';

// Search for locations (autocomplete)
const results = await locationApi.search('delhi');

// Geocode a location
const location = await locationApi.geocode('Delhi Airport');
console.log(location.lat, location.lng);
```

## 🔍 How It Works

### Creating a Ride

1. User types location name in autocomplete
2. Frontend calls `/api/locations/search` for suggestions
3. User selects a location
4. Frontend sends location name to `/api/rides`
5. Backend geocodes the location name → gets coordinates
6. Backend stores both name and coordinates in MongoDB

### Finding Rides

1. User searches "Delhi Airport" → "Connaught Place"
2. Frontend calls `/api/rides?nearStart=Delhi Airport&nearDest=Connaught Place`
3. Backend geocodes both locations
4. Backend uses MongoDB `$near` query with 2dsphere index
5. Returns rides within specified radius (default 50km)

## ⚠️ Error Handling

- **Geocoding fails**: Falls back to text-based search
- **API rate limits**: Automatic retry with exponential backoff
- **Invalid location**: Returns 400 error with helpful message
- **Network errors**: Graceful degradation, shows user-friendly error

## 🚀 Performance

- **Debounced search**: 300ms delay to reduce API calls
- **2dsphere indexes**: Fast geo-queries (sub-millisecond)
- **Caching**: Consider adding Redis cache for frequently searched locations
- **Rate limiting**: Nominatim recommends 1 req/sec (add rate limiting middleware)

## 📝 Best Practices

1. **Always store both name and coordinates** - Names for display, coordinates for queries
2. **Use geo-queries for proximity search** - More accurate than text search
3. **Handle geocoding failures gracefully** - Fallback to text search
4. **Respect API rate limits** - Add rate limiting for production
5. **Cache frequent searches** - Reduce API calls and improve performance

## 🔐 Security

- API keys stored in environment variables (never commit to git)
- Input validation on all location queries
- Rate limiting to prevent abuse
- Sanitize user input before geocoding

## 🧪 Testing

Test the endpoints:

```bash
# Search locations
curl "http://localhost:5001/api/locations/search?q=delhi"

# Geocode location
curl "http://localhost:5001/api/locations/geocode?q=Delhi Airport"

# Search rides by location
curl "http://localhost:5001/api/rides?nearStart=Delhi Airport&nearDest=Connaught Place"
```

## 📚 Additional Resources

- [MongoDB GeoJSON Documentation](https://docs.mongodb.com/manual/geospatial-queries/)
- [OpenStreetMap Nominatim](https://nominatim.org/)
- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)


