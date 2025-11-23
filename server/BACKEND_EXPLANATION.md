# RideMate Backend Architecture Explanation

## 🏗️ Project Structure

```
server/
├── index.js                    # Main entry point
├── config/
│   └── db.js                  # MongoDB connection configuration
├── models/
│   ├── User.js                # User model (Driver/Rider)
│   ├── Ride.js               # Ride model
│   └── Booking.js            # Booking model
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── rideController.js     # Ride CRUD operations
│   └── bookingController.js  # Booking operations
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── rideRoutes.js         # Ride endpoints
│   └── bookingRoutes.js      # Booking endpoints
├── middleware/
│   ├── authMiddleware.js     # JWT authentication & role checking
│   └── errorHandler.js       # Centralized error handling
├── utils/
│   └── validate.js           # Input validation utilities
├── seed.js                    # Database seeding script
└── .env.example              # Environment variables template
```

## 🔄 How the Backend Works

### 1. **Entry Point (index.js)**

The server starts here:
- Loads environment variables using `dotenv`
- Connects to MongoDB database
- Sets up Express app with middleware (CORS, JSON parsing)
- Registers all route handlers
- Starts listening on specified PORT (default: 5001)

**Flow:**
```
index.js → connectDB() → Express App → Routes → Controllers → Models → MongoDB
```

### 2. **Database Connection (config/db.js)**

- Uses Mongoose ODM to connect to MongoDB
- Connection string comes from `MONGO_URI` environment variable
- Handles connection errors gracefully
- Exits process if connection fails

### 3. **Models (Mongoose Schemas)**

#### **User Model**
- Stores user information (name, email, password, phone, role)
- Password is automatically hashed using bcrypt before saving
- Role can be "driver" or "rider"
- Email must be unique
- Indexed for faster email lookups

#### **Ride Model**
- Stores ride information (driver, from, to, date, time, price, seatsAvailable)
- References User model for driver
- Has indexes on: from, to, date, driver, isActive
- Composite index on (from, to, date) for faster searches

#### **Booking Model**
- Stores booking information (ride, rider, seatsBooked, totalPrice)
- References both Ride and User models
- Unique index on (ride, rider) prevents double booking
- Automatically calculates totalPrice = ride.price × seatsBooked

### 4. **Authentication System**

#### **Registration Flow:**
```
POST /api/auth/register
1. Validate input (name, email, password, role)
2. Check if email already exists
3. Hash password using bcrypt
4. Create user in database
5. Generate JWT token
6. Return token + user info (without password)
```

#### **Login Flow:**
```
POST /api/auth/login
1. Validate email and password
2. Find user by email
3. Compare provided password with hashed password
4. Generate JWT token if match
5. Return token + user info
```

#### **JWT Token:**
- Contains user ID
- Signed with `JWT_SECRET` from environment
- Expires in 30 days
- Sent in `Authorization: Bearer <token>` header

### 5. **Middleware**

#### **authMiddleware**
- Extracts JWT token from Authorization header
- Verifies token signature
- Finds user in database
- Attaches user to `req.user` for use in controllers
- Returns 401 if token is invalid/missing

#### **driverMiddleware**
- Checks if `req.user.role === 'driver'`
- Only allows drivers to create/update/delete rides
- Returns 403 if user is not a driver

#### **riderMiddleware**
- Checks if `req.user.role === 'rider'`
- Only allows riders to create bookings
- Returns 403 if user is not a rider

#### **errorHandler**
- Centralized error handling
- Catches all errors from controllers
- Formats error responses consistently
- Handles Mongoose validation errors, duplicate keys, etc.

### 6. **API Endpoints**

#### **Authentication Routes (/api/auth)**
- `POST /api/auth/register` - Register new user (Public)
- `POST /api/auth/login` - Login user (Public)
- `GET /api/auth/me` - Get current user (Private)

#### **Ride Routes (/api/rides)**
- `GET /api/rides` - Get all rides (Public, supports query filters)
- `POST /api/rides` - Create ride (Private, Driver only)
- `GET /api/rides/:id` - Get single ride (Public)
- `PUT /api/rides/:id` - Update ride (Private, Driver only, owner only)
- `DELETE /api/rides/:id` - Delete ride (Private, Driver only, owner only)

**Query Filters for GET /api/rides:**
- `?from=New York` - Filter by origin
- `?to=Boston` - Filter by destination
- `?date=2024-01-15` - Filter by date
- `?isActive=true` - Filter by active status

#### **Booking Routes (/api/bookings)**
- `POST /api/bookings` - Create booking (Private, Rider only)
- `GET /api/bookings/me` - Get my bookings (Private)
- `GET /api/bookings/:id` - Get single booking (Private, rider or driver only)

### 7. **Request Flow Example**

**Example: Creating a Ride**

```
1. Client sends: POST /api/rides
   Headers: { Authorization: "Bearer <jwt_token>" }
   Body: { from: "New York", to: "Boston", date: "2024-01-15", ... }

2. Express routes request to rideRoutes.js

3. rideRoutes.js applies middleware:
   - authMiddleware: Verifies JWT, attaches user to req.user
   - driverMiddleware: Checks if req.user.role === 'driver'

4. rideController.createRide() executes:
   - Validates input using validateRideInput()
   - Creates Ride document with req.user.id as driver
   - Populates driver information
   - Returns created ride

5. Response sent back to client
```

**Example: Booking a Ride**

```
1. Client sends: POST /api/bookings
   Headers: { Authorization: "Bearer <jwt_token>" }
   Body: { ride: "<ride_id>", seatsBooked: 2 }

2. Middleware chain:
   - authMiddleware: Verifies JWT
   - riderMiddleware: Checks if user is rider

3. bookingController.createBooking() executes:
   - Validates input
   - Finds ride by ID
   - Checks if ride is active
   - Checks if enough seats available
   - Prevents double booking (same rider, same ride)
   - Calculates totalPrice = ride.price × seatsBooked
   - Creates Booking document
   - Reduces ride.seatsAvailable
   - Returns booking with populated ride and rider info

4. Response sent back to client
```

### 8. **Data Flow & Relationships**

```
User (Driver) ──creates──> Ride
                              │
                              │ referenced by
                              │
                              ▼
                          Booking ──created by──> User (Rider)
```

- A **Driver** (User with role='driver') can create multiple **Rides**
- A **Rider** (User with role='rider') can create multiple **Bookings**
- Each **Booking** references one **Ride** and one **Rider**
- When a booking is created, the ride's `seatsAvailable` is automatically reduced

### 9. **Security Features**

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **JWT Authentication**: Secure token-based authentication
3. **Role-Based Access Control**: Drivers and riders have different permissions
4. **Input Validation**: All inputs are validated before processing
5. **Double Booking Prevention**: Unique index prevents same rider booking same ride twice
6. **Owner Verification**: Only ride owner (driver) can update/delete their rides

### 10. **Error Handling**

All errors are caught and handled by `errorHandler` middleware:
- **400**: Bad Request (validation errors, missing fields)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (wrong role, not owner)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error (database errors, etc.)

### 11. **Database Seeding**

Run `node seed.js` to populate database with:
- 2 demo drivers
- 2 demo riders
- 5 demo rides
- 3 sample bookings

All demo users have password: `password123`

## 🚀 Starting the Server

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables:**
   Create `.env` file with:
   ```
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

3. **Seed database (optional):**
   ```bash
   npm run seed
   ```

4. **Start server:**
   ```bash
   npm start
   # or
   node index.js
   ```

The server will:
- Connect to MongoDB
- Start listening on port 5001
- Be ready to handle API requests

## 📝 API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "count": 5  // for list endpoints
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

