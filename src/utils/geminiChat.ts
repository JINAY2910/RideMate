import { rideApi } from '../services/rides';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api';

export async function askGemini(message: string, context: string = ""): Promise<string> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return "Please log in to use the AI assistant.";
    }

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error("Error calling AI API:", error);
    return "I'm having trouble connecting to the server. Please try again later.";
  }
}

export async function classifyDomain(message: string): Promise<"domain" | "external"> {
  // For now, we'll assume all messages are domain-relevant to simplify
  // In a real app, we could have a lightweight classifier or just send everything to backend
  return "domain";
}
