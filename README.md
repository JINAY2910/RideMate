# RideMate - Smart Ride Sharing Platform

RideMate is a full-stack carpooling and ride-sharing platform designed to connect drivers and riders for sustainable urban transportation. It features a modern, accessible UI, real-time tracking, and AI-powered assistance.

## 🌟 Key Features

*   **Dual Role System:** Seamlessly switch between **Rider** and **Driver** modes within the same app.
*   **Smart Matching:** Intelligent algorithms to match riders with drivers on similar routes.
*   **Real-time Tracking:** Live GPS tracking for active rides using Leaflet maps.
*   **AI Power:**
    *   **Chatbot:** Integrated Google Gemini AI for support, ride queries, and general assistance.
    *   **Voice Assistant:** Hands-free navigation and actions using voice commands.
*   **Safety First:**
    *   **Identity Verification:** Document upload and verification for drivers.
    *   **Emergency Contacts:** SOS features and emergency contact management.
*   **Eco-Friendly:**
    *   **Green Miles:** Track your CO2 savings and environmental impact.
    *   **Stats:** Visual statistics on your sustainable travel contribution.
*   **Ride Management:**
    *   **Recurring Rides:** Schedule daily or weekly commutes.
    *   **Vehicle Management:** Drivers can manage multiple vehicles.
    *   **History & Receipts:** Comprehensive ride history with downloadable PDF tickets.
*   **Interactive Maps:** Visual route selection, location picking, and real-time navigation.

## 🛠️ Tech Stack

### Frontend
*   **Framework:** [React](https://reactjs.org/) (Vite)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Maps:** [Leaflet](https://leafletjs.com/) / React-Leaflet
*   **Real-time:** Socket.io-client
*   **AI:** Google Generative AI (Gemini)

### Backend
*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Framework:** [Express.js](https://expressjs.com/)
*   **Database:** [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
*   **Authentication:** JWT (JSON Web Tokens) & Bcrypt
*   **Real-time:** [Socket.io](https://socket.io/)
*   **Scheduling:** Node-cron

##  Folder Structure

```
RideMate/
├── public/                   # Static assets
├── server/                   # Backend Application
│   ├── config/               # Database & App Config
│   ├── controllers/          # Business Logic (Auth, Rides, Bookings, etc.)
│   ├── middleware/           # Auth & Error Handling
│   ├── models/               # Mongoose Schemas (User, Ride, Vehicle, etc.)
│   ├── routes/               # API Endpoints
│   ├── services/             # External Services (AI, Geocoding)
│   ├── utils/                # Helpers (Distance, Cron, Validation)
│   └── index.js              # Server Entry Point
├── src/                      # Frontend Application
│   ├── components/           # Reusable UI (Chatbot, Maps, Navbar, etc.)
│   ├── context/              # State Management (Auth, App Context)
│   ├── hooks/                # Custom React Hooks
│   ├── screens/              # App Pages (Dashboard, Search, Profile, etc.)
│   ├── services/             # API Client & Socket Connection
│   ├── styles/               # Global & Component Styles
│   ├── utils/                # Frontend Helpers
│   ├── App.tsx               # Routing & Layout
│   └── main.tsx              # Entry Point
└── ...config files           # Vite, TypeScript, Tailwind config
```

*For a detailed breakdown of files and their purposes, please refer to [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).*

## 🚀 Getting Started

### Prerequisites
*   **Node.js** (v18+ recommended)
*   **MongoDB** (Local instance or Atlas connection string)
*   **Google Gemini API Key** (for AI features)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/RideMate.git
    cd RideMate
    ```

3.  **Backend Setup**
    Navigate to the server directory and install dependencies:
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in `server/` with your credentials:
    ```env
    PORT=5001
    MONGO_URI=mongodb://localhost:27017/ridemate
    JWT_SECRET=your_super_secret_key
    GEMINI_API_KEY=your_gemini_api_key

    # Geocoding Provider Configuration (Optional)
    # Options: nominatim (free), geoapify, positionstack, google, mapbox
    GEOCODING_PROVIDER=nominatim
    
    # Provider-specific API Keys (if using paid/key-based providers)
    # GEOAPIFY_API_KEY=your_geoapify_key
    # POSITIONSTACK_API_KEY=your_positionstack_key
    ```
    Start the server:
    ```bash
    npm start
    # OR for development with watch mode
    npm run dev
    ```

4.  **Frontend Setup**
    Navigate back to the root directory and install dependencies:
    ```bash
    cd ..
    npm install
    ```
    Create a `.env` file in the root directory:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key
    ```
    Start the development server:
    ```bash
    npm run dev
    ```

4.  **Access the App**
    Open your browser and navigate to `http://localhost:5173`.

##  API Documentation

The backend provides a RESTful API at `http://localhost:5001/api`. Major endpoints include:

*   **Auth**: `/api/auth` (Login, Signup, Profile)
*   **Rides**: `/api/rides` (Create, Search, Details)
*   **Bookings**: `/api/bookings` (Book, Cancel, Status)
*   **Vehicles**: `/api/vehicles` (Manage driver vehicles)
*   **Locations**: `/api/locations` (Geocoding & Suggestions)
*   **Chat**: `/api/chat` (Message history)
*   **Notifications**: `/api/notifications` (User alerts)
*   **Verification**: `/api/verification` (Identity verification)

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
