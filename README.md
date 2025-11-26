# 🚗 RideMate

**Mobility, Reimagined.**

RideMate is a modern, full-stack carpooling and ride-sharing platform built with React, TypeScript, Node.js, and MongoDB. It provides a seamless experience for both drivers and riders to connect, share rides, and contribute to sustainable urban transportation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb)

---

## ✨ Features

### 🎯 Core Functionality
- **Dual Role System**: Users can register as drivers or riders
- **Smart Ride Matching**: Advanced algorithm matches riders with drivers based on route similarity, time, and available seats
- **Real-Time GPS Tracking**: Live driver location tracking with Socket.IO
- **Interactive Maps**: Leaflet-based maps with route visualization and location picking
- **Ride Booking System**: Request rides, approve/reject requests, manage bookings
- **Price Calculation**: Automatic fare calculation based on distance (₹10/km)
- **Ride History**: Complete history of past rides with ratings and reviews

### 👥 User Features
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Two-Step Signup**: Enhanced registration process with email/password first, then profile details
- **Profile Management**: Update profile, add emergency contacts, upload profile photos
- **Vehicle Management**: Drivers can add and manage multiple vehicles
- **Rating System**: Mutual rating system for drivers and riders
- **Emergency Contacts**: Store up to 3 emergency contacts for safety
- **SOS Emergency Button**: Quick access emergency alert system during rides
- **GreenMiles Tracking**: Track CO₂ saved and earn green points for eco-friendly travel

### 🚀 Advanced Features
- **AI Chatbot**: Google Gemini-powered chatbot for ride assistance
- **Voice Assistant**: Voice-enabled ride booking and navigation
- **Real-Time Chat**: In-ride messaging between drivers and riders
- **Live Ride Updates**: Real-time ride status updates via WebSocket
- **PDF Ticket Generation**: One-tap download for a clean, structured PDF ticket of your ride
- **Accessibility Mode**: Senior-friendly UI with larger fonts and simplified navigation
- **Weather Integration**: Real-time weather information for ride planning
- **Location Autocomplete**: Smart location search with geocoding support
- **Notification System**: Real-time notification panel for ride updates and alerts
- **Rider Profile Modal**: View detailed rider information before accepting requests

### 💰 Pricing & Add-ons
- **Dynamic Pricing Model**: Advanced fare calculation based on:
  - Fuel costs (₹100/L at 15km/L efficiency)
  - Wear-and-tear (₹5/km)
  - Driver time compensation (₹2/min)
  - Profit margin (20% standard, 10% for trips >500km)
  - Platform fee (10%)
  - Minimum fare per rider (₹50)
- **Optional Add-ons**:
  - Door-to-Door Service (+₹25)
  - First Aid Kit (+₹20)
- **Scheduled Price Updates**: Automated script to recalculate prices for existing rides

### 🎨 UI/UX Features
- **Modern Design**: Clean, minimalist interface with smooth animations
- **Responsive Layout**: Fully responsive design for all device sizes
- **Dark Mode Support**: (Configurable)
- **Custom Components**:
  - Clock Picker for time selection
  - Roller Picker for scrollable options
  - Mini Map for ride previews
- **Custom Cursor**: Enhanced cursor interactions
- **Scroll Progress Bar**: Visual feedback for page scrolling
- **Animated Sections**: Smooth fade-in animations for better UX
- **Rolling Reviews**: Animated testimonial carousel

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.5.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 3.4.1
- **Maps**: Leaflet 1.9.4 + React Leaflet 4.0.0
- **Icons**: Lucide React 0.344.0
- **PDF Generation**: jsPDF 3.0.4
- **Real-Time**: Socket.IO Client 4.8.1
- **AI**: Google Generative AI 0.24.1

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4.18.2
- **Database**: MongoDB 8.0 with Mongoose 8.0.3
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcrypt 5.1.1
- **Real-Time**: Socket.IO 4.8.1
- **Geocoding**: Nominatim (OpenStreetMap) / Google Maps / Mapbox
- **Routing**: OSRM (Open Source Routing Machine)
- **Scheduled Tasks**: node-cron 4.2.1
- **AI**: Google Generative AI 0.24.1

---

## 📁 Project Structure

```
RideMate/
├── src/                       # Frontend (React + TypeScript)
│   ├── components/            # Reusable UI components
│   ├── context/               # React Context (state management)
│   ├── hooks/                 # Custom React hooks
│   ├── screens/               # Page components (15 screens)
│   ├── services/              # API client services
│   ├── styles/                # CSS modules
│   ├── utils/                 # Helper functions
│   └── App.tsx                # Root component
│
├── server/                    # Backend (Node.js + Express)
│   ├── config/                # Database configuration
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Auth & error handling
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API endpoints
│   ├── services/              # Business logic
│   ├── utils/                 # Helper functions
│   ├── index.js               # Server entry point
│   └── socketHandler.js       # WebSocket handler
│
├── public/                    # Static assets
├── .env                       # Environment variables
├── package.json               # Dependencies
└── README.md                  # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **pnpm**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/RideMate.git
   cd RideMate
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**

   **Frontend** - Create `.env` in the root directory:
   ```env
   VITE_API_URL=http://localhost:5001/api
   VITE_SOCKET_URL=http://localhost:5001
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **Backend** - Create `server/.env` (use `server/.env.example` as template):
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/ridemate
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   
   # Geocoding Provider (nominatim, google, or mapbox)
   GEOCODING_PROVIDER=nominatim
   
   # Optional: Google Maps API Key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   
   # Optional: Mapbox Access Token
   MAPBOX_ACCESS_TOKEN=your_mapbox_token
   ```

5. **Start MongoDB**
   ```bash
   # If using MongoDB locally
   mongod
   
   # Or if using MongoDB as a service
   brew services start mongodb-community
   ```

6. **Seed the database (optional)**
   ```bash
   cd server
   npm run seed
   cd ..
   ```

7. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm start
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

8. **Open the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

---

## 📖 Usage

### For Riders

1. **Sign Up** as a rider
2. **Search for Rides** by entering pickup and drop locations
3. **View Matches** - See perfect, good, and nearby ride matches
4. **Request a Ride** - Select seats and add-ons (if available)
5. **Track Your Ride** - View real-time driver location
6. **Rate & Review** - After the ride, rate your driver

### For Drivers

1. **Sign Up** as a driver
2. **Add Vehicle** - Register your vehicle details
3. **Create a Ride** - Set route, date, time, and available seats
4. **Manage Requests** - Approve or reject rider requests
5. **Start Ride** - Activate GPS tracking when starting
6. **Complete Ride** - Mark ride as completed and rate riders

---

## 🔑 Key Features Explained

### Smart Ride Matching Algorithm
The platform uses a sophisticated matching algorithm that considers:
- **Route Similarity**: Calculates pickup/drop distance from driver's route
- **Time Compatibility**: Matches rides within a reasonable time window
- **Seat Availability**: Ensures sufficient seats for the request
- **Match Quality**: Categorizes matches as Perfect (< 2km deviation), Good (2-5km), or Nearby (5-10km)

### Real-Time Features
- **Live GPS Tracking**: Drivers' locations update every 5 seconds
- **WebSocket Communication**: Instant ride updates and notifications
- **In-Ride Chat**: Real-time messaging between drivers and riders

### Price Calculation
- Base rate: ₹10 per kilometer
- Calculated using OSRM (Open Source Routing Machine) for accurate distances
- Fallback to Haversine formula if OSRM is unavailable
- Driver earnings: 90% of fare
- Platform fee: 10% of fare

### Green Miles System
- Tracks CO₂ saved compared to individual car trips
- Earns green points for sustainable travel
- Displayed on user dashboard and profile

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Middleware-based route protection
- **Input Validation**: Server-side validation for all inputs
- **Emergency Contacts**: Store up to 3 emergency contacts
- **CORS Protection**: Configured CORS policies

---

## 🧪 API Endpoints

### Authentication
```
POST   /api/auth/signup          - Register new user
POST   /api/auth/login           - Login user
GET    /api/auth/me              - Get current user
```

### Rides
```
GET    /api/rides                - List all rides
POST   /api/rides                - Create new ride
GET    /api/rides/:id            - Get ride details
PATCH  /api/rides/:id            - Update ride status
DELETE /api/rides/:id            - Delete ride
POST   /api/rides/match          - Find matching rides
POST   /api/rides/:id/requests   - Add ride request
PATCH  /api/rides/:id/requests/:requestId - Update request status
POST   /api/rides/:id/rate       - Rate ride
```

### Bookings
```
GET    /api/bookings/me          - Get user's bookings
```

### Vehicles
```
GET    /api/vehicles             - List user's vehicles
POST   /api/vehicles             - Add new vehicle
PUT    /api/vehicles/:id         - Update vehicle
DELETE /api/vehicles/:id         - Delete vehicle
```

### Chat
```
GET    /api/chat/:rideId         - Get ride chat messages
POST   /api/chat/:rideId         - Send chat message
```

---

## 🎨 Customization

### Tailwind Configuration
Modify `tailwind.config.js` to customize colors, fonts, and spacing.

### Environment Variables
- `VITE_API_URL`: Backend API URL
- `VITE_SOCKET_URL`: WebSocket server URL
- `VITE_GEMINI_API_KEY`: Google Gemini API key for chatbot
- `GEOCODING_PROVIDER`: Choose between nominatim, google, or mapbox

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Restart MongoDB
brew services restart mongodb-community
```

### Port Already in Use
```bash
# Kill process on port 5001 (backend)
lsof -ti:5001 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### CORS Errors
Ensure `VITE_API_URL` in frontend `.env` matches the backend URL.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) for Nominatim geocoding
- [OSRM](http://project-osrm.org/) for route calculation
- [Leaflet](https://leafletjs.com/) for interactive maps
- [Google Gemini](https://ai.google.dev/) for AI chatbot
- [Lucide](https://lucide.dev/) for beautiful icons

---

**Made with ❤️ for sustainable urban mobility**
