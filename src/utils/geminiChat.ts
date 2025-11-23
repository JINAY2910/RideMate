import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("Loaded key:", import.meta.env.VITE_GEMINI_API_KEY?.slice(0, 10));

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// use v1-compliant model name
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite"
});

export async function askGemini(message: string) {
  try {
    const result = await model.generateContent(message);
    return result.response.text();
  } catch (err) {
    console.error("Gemini Error:", err);
    return "Gemini API error.";
  }
}
