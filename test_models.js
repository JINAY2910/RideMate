import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple .env parser since we can't rely on dotenv being installed/configured for this standalone script
const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env');
let apiKey = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error("Could not read .env file");
}

if (!apiKey || apiKey === 'DEMO_KEY_PLEASE_REPLACE') {
    console.error("Invalid or missing API Key in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Note: listModels is not directly on genAI instance in all versions, 
        // but usually we can try to get a model and if it fails we know. 
        // Actually, the SDK doesn't have a simple listModels method exposed on the main class in all versions.
        // But the error message suggested calling ListModels.
        // Let's try to just use 'gemini-pro' which is the safest bet if 1.5 fails.
        // Or we can try to use the model manager if available.

        // For the purpose of this script, let's just try to generate content with a few common model names
        // and see which one works.
        const modelsToTry = ["gemini-2.5-flash-lite", "gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-pro"];

        for (const modelName of modelsToTry) {
            console.log(`Testing model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`SUCCESS: ${modelName} works!`);
                console.log(result.response.text());
                return; // Found one that works
            } catch (err) {
                console.log(`FAILED: ${modelName} - ${err.message.split('\n')[0]}`);
            }
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

listModels();
