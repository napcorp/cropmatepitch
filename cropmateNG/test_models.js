import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function run() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const models = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await models.json();
    console.log(data.models.map(m => m.name).join('\n'));
  } catch (e) {
    console.error(e);
  }
}
run();
