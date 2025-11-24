import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
// NOTE: In a real app, you should use an environment variable for the API key.
// For this demo, we'll assume it's available via VITE_GEMINI_API_KEY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Create a single shared instance
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (API_KEY && API_KEY !== "YOUR_API_KEY_HERE") {
  genAI = new GoogleGenerativeAI(API_KEY);
  // Use the new stable free model
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  console.log("Gemini model:", model);
} else {
  console.error("Gemini API Key is missing or invalid.");
}

// Placeholder for the knowledge base content since the file was missing
const KNOWLEDGE_BASE = `
RideMate Ticket Format:
- Ticket ID: 12-character alphanumeric string
- Passenger Name: Full Name
- Ride ID: Unique identifier for the trip
- Date & Time: ISO 8601 format
- Seat Number: e.g., A1, B2
- Status: Confirmed, Pending, Cancelled

RideMate Safety Features:
- 24/7 Support
- Live Ride Tracking
- Emergency SOS Button
- Verified Drivers

RideMate is a ride-sharing application focused on safety and convenience.
`;

const SYSTEM_PROMPT = `
System: You are RideMate Assistant. You are a helpful, warm, and human-like assistant for the RideMate app.

ALLOWED TOPICS:
- Greetings and small talk (e.g., "Hi", "How are you?")
- RideMate app features, booking, drivers, riders, safety, tickets, profile.
- Travel, transportation, routes, maps, distance, and cost calculations.
- Weather forecasts and current conditions for any location.
- General queries that arise naturally during a conversation about rides or travel.

BLOCKED TOPICS:
- Politics, religion, medical advice, legal advice, historical facts unrelated to travel.
- Celebrity gossip, entertainment news, complex math unrelated to travel cost/distance.
- Programming questions unrelated to RideMate.

INSTRUCTIONS:
- If the user greets you, reply warmly: "Hi! How can I help you with RideMate today?"
- If the user asks about distance, suggest they can ask for "distance between A and B".
- If the user asks about weather, provide the data if available or explain you can check weather.
- Keep answers concise (max 3-4 sentences) and friendly.
- Do NOT be robotic. Use natural language.
- If a topic is BLOCKED, politely refuse: "Sorry! I can help only with RideMate, rides, travel, distance, and weather-related questions. Try asking something like 'distance between two places' or 'weather at a location'."
- Use the provided context and knowledge base as reference when appropriate.
`;

export async function askGemini(message: string, context: string = ""): Promise<string> {
  try {
    if (!model) {
      console.error("Gemini model not initialized. Check API Key.");
      return "Configuration Error: Please set a valid VITE_GEMINI_API_KEY in your .env file.";
    }

    const fullPrompt = `
${SYSTEM_PROMPT}

Knowledge Base:
${KNOWLEDGE_BASE}

Context:
${context}

User Question: ${message}
    `;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error("Error calling Gemini:", error);
    return "Connection Error: Unable to reach the AI model.";
  }
}

export async function classifyDomain(message: string): Promise<"domain" | "external"> {
  try {
    // Simple keyword fallback first to save API calls/latency for obvious cases
    const lowerMsg = message.toLowerCase();
    const domainKeywords = [
      'ridemate', 'ride', 'driver', 'rider', 'ticket', 'booking', 'safety', 'app', 'map', 'route', 'weather', 'forecast',
      'distance', 'km', 'mile', 'far', 'how long', 'traffic', 'cost', 'price', 'fare', 'travel', 'trip', 'go to',
      'hi', 'hello', 'hey', 'morning', 'evening', 'help'
    ];

    if (domainKeywords.some(kw => lowerMsg.includes(kw))) {
      // Optimistic local check
      return "domain";
    }

    if (!model) {
      return "domain"; // Fail open
    }

    const prompt = `
    Classify the following user message into one of two categories:
    1. "domain": The message is related to RideMate, rides, transportation, travel, maps, routes, distance, weather, safety, app features, OR it is a greeting/small talk.
    2. "external": The message is completely unrelated (e.g., politics, cooking, history, math, celebrities).

    User Message: "${message}"

    Reply ONLY with "domain" or "external".
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toLowerCase();

    if (text.includes("domain")) return "domain";
    if (text.includes("external")) return "external";

    // Fallback if unclear
    return "domain";
  } catch (error) {
    console.error("Error classifying domain:", error);
    // Fallback to keyword matching if API fails
    return "domain";
  }
}
