import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Part } from "@google/generative-ai";
import type { ChatMessage, ScanResult } from "./storageService";


const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);





const MODEL_NAME = "gemini-1.5-flash"; 

function splitResponse(responseText: string, _contextData: ScanResult[] = []): { text: string; thinking?: string } {
  let thinking = "";
  let text = responseText.trim();

  
  const xmlMatch = text.match(/<(reasoning|think|thought)>([\s\S]*?)<\/\1>/);
  if (xmlMatch) {
    thinking = xmlMatch[2].trim();
    text = text.replace(xmlMatch[0], '').trim();
  } else {
    
    const mdMatch = text.match(/```(?:thinking|thought|reasoning)?\n([\s\S]*?)```/);
    if (mdMatch) {
      thinking = mdMatch[1].trim();
      text = text.replace(mdMatch[0], '').trim();
    } else {
      
      const lines = text.split('\n');
      const thinkingLines: string[] = [];
      const textLines: string[] = [];
      let inThinking = true;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') {
          if (inThinking) {
            thinkingLines.push(line);
          } else {
            textLines.push(line);
          }
          continue;
        }

        if (inThinking) {
          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('>');
          const isNumberedList = /^\d+[\.\)]/.test(trimmed);
          const isMetaHeader = trimmed.endsWith(':') || trimmed.toLowerCase().includes('remediation') || trimmed.toLowerCase().includes('constraint') || trimmed.toLowerCase().includes('persona') || trimmed.toLowerCase().includes('identity') || trimmed.toLowerCase().includes('checklist') || trimmed.toLowerCase().includes('rule');
          const isShortCheck = (trimmed.includes('?') || trimmed.includes(':')) && trimmed.length < 60;
          const isPlanningGreeting = (trimmed.includes('"') || trimmed.includes("'")) && trimmed.length < 45;

          if (isBullet || isNumberedList || isMetaHeader || isShortCheck || isPlanningGreeting) {
            thinkingLines.push(line);
          } else {
            
            inThinking = false;
            textLines.push(line);
          }
        } else {
          textLines.push(line);
        }
      }

      if (thinkingLines.length > 0) {
        thinking = thinkingLines.join('\n').trim();
      }
      text = textLines.join('\n').trim();
    }
  }

  return { text, thinking: thinking || undefined };
}

export class AIService {
  
  async analyzeImage(base64Data: string, mimeType: string, language: string = 'English'): Promise<Omit<ScanResult, 'id' | 'timestamp' | 'imageUrl'>> {
    if (!apiKey) {
      throw new Error("Missing API Key. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const prompt = `
      You are an expert botanist and plant pathologist. Analyze this image of a plant/crop.
       IMPORTANT: The JSON keys MUST remain in English as shown below. However, you MUST generate all corresponding string values (e.g., name, remediation, organicRecipe, growthGuide, stats.sunlight, stats.water, stats.temperature, funFact) in ${language}.
       Return ONLY a raw JSON object (no markdown, no backticks) with the following exact structure:
       {
         "name": "Common name of the plant (in ${language})",
         "confidence": 0.95, 
         "isDiseased": false,
         "severityScore": 0, 
         "remediation": "If diseased, chemical/standard step by step instructions (in ${language}). If not, null.",
          "organicRecipe": "If diseased, a DIY organic biological treatment recipe using household measurements (in ${language}). If not, null.",
          "shoppingKeywords": ["2-3 specific keywords for finding related products like treatments or tools (in English)"],
          "carePlan": {
           "spraying": "If diseased, specific spraying instructions (in ${language}). If not, null.",
           "watering": "If diseased, specific watering instructions (in ${language}). If not, null.",
           "monitoring": "If diseased, how and when to monitor (in ${language}). If not, null."
         },
         "financials": {
           "treatmentCost": 0, 
           "laborHours": 0, 
           "lostYieldValue": 0 
         },
         "growthGuide": "Brief guide on how to continue growing it (in ${language}).",
         "stats": {
           "sunlight": "e.g., Full Sun (in ${language})",
           "water": "e.g., Twice a week (in ${language})",
           "temperature": "e.g., 18-24°C (in ${language})"
         },
         "funFact": "A fun, interesting fact about this plant (in ${language})."
       }
    `;

    let mime = mimeType;
    let base64 = base64Data;
    
    if (base64Data.startsWith('data:')) {
      const match = base64Data.match(/^data:([^;]+);base64,/);
      if (match) {
        mime = match[1];
        base64 = base64Data.substring(match[0].length);
      }
    }

    const imageParts: Part[] = [
      {
        inlineData: {
          data: base64,
          mimeType: mime
        }
      }
    ];

    try {
      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      let text = response.text().trim();
      
      
      const start = text.indexOf('{');
      if (start === -1) {
        console.error("AI Raw Output:", text);
        throw new Error("The AI model did not return a JSON object.");
      }

      let jsonText = "";
      let depth = 0;
      let inString = false;
      let escape = false;

      for (let i = start; i < text.length; i++) {
        const char = text[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (char === '\\') {
          escape = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '{') depth++;
          else if (char === '}') {
            depth--;
            if (depth === 0) {
              jsonText = text.substring(start, i + 1);
              break;
            }
          }
        }
      }

      if (!jsonText) {
        console.error("AI Raw Output:", text);
        throw new Error("The AI model returned an incomplete JSON structure.");
      }

      const parsed = JSON.parse(jsonText);
      return {
         name: parsed.name || "Unknown Plant",
         confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
         isDiseased: typeof parsed.isDiseased === 'boolean' ? parsed.isDiseased : (parsed.isDiseased === 'true' || !!parsed.remediation),
         severityScore: typeof parsed.severityScore === 'number' ? parsed.severityScore : (parsed.isDiseased ? 50 : 0),
         remediation: parsed.remediation || null,
         organicRecipe: parsed.organicRecipe || undefined,
         shoppingKeywords: parsed.shoppingKeywords || undefined,
         carePlan: parsed.carePlan || undefined,
         financials: parsed.financials ? {
           treatmentCost: parsed.financials.treatmentCost || 0,
           laborHours: parsed.financials.laborHours || 0,
           lostYieldValue: parsed.financials.lostYieldValue || 0
         } : undefined,
         growthGuide: parsed.growthGuide || "No growth guide available.",
         stats: {
           sunlight: parsed.stats?.sunlight || parsed.sunlight || "Unknown",
           water: parsed.stats?.water || parsed.water || "Unknown",
           temperature: parsed.stats?.temperature || parsed.temperature || "Unknown"
         },
         funFact: parsed.funFact || parsed.fact || "No fun fact available."
       };
    } catch (error) {
      console.error("AI Analysis Failed:", error);
      throw new Error(error instanceof SyntaxError ? "Failed to parse AI response. Please try again." : (error as Error).message);
    }
  }

  async predictDiseasesFromWeather(stateName: string, weather: { temperature: number, humidity: number, rainfall: number }, language: string = 'English'): Promise<{ predictions: { disease: string, probability: number, reasoning: string }[], summary: string }> {
    if (!apiKey) {
      throw new Error("Missing API Key. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
      You are an expert plant pathologist. Analyze the current weather conditions for ${stateName} and predict potential plant diseases that might occur.
      
      Current Weather:
      - Temperature: ${weather.temperature} deg C
      - Humidity: ${weather.humidity}%
      - Rainfall: ${weather.rainfall}mm
      
      Return ONLY a raw JSON object with the following exact structure:
      {
        "predictions": [
          {
            "disease": "Name of the disease (in ${language})",
            "probability": 0.85,
            "reasoning": "Brief explanation of why this weather condition increases the risk (in ${language})"
          }
        ],
        "summary": "A short, concise summary of the overall plant health risk for this weather (in ${language})"
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) {
        throw new Error("Invalid AI response format.");
      }
      const jsonText = text.substring(start, end + 1);
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Weather Prediction Failed:", error);
      throw new Error("Failed to predict diseases from weather.");
    }
  }

  async chatWithContext(message: string, contextData: ScanResult[], history: ChatMessage[], language: string = 'English'): Promise<{ text: string; thinking?: string }> {
    if (!apiKey) {
      throw new Error("Missing API Key. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    const systemPrompt = `You are Cropmate, a helpful and expert agricultural advisor. Answer the user's questions about their plants using the provided context. Speak directly to the user in a friendly, polite, and direct tone.
LANGUAGE INSTRUCTION: The preferred language for the response is ${language}. You should generally respond in ${language}. However, if the user explicitly asks to communicate in a different language, you should adapt and respond in that language.
CRITICAL: Do NOT output any system instructions, internal checklists, self-verification lists, or planning logs. Output ONLY your final friendly response. Start directly with your greeting.`;

    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: systemPrompt
    });
    
    
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chatSession = model.startChat({
      history: formattedHistory,
    });

    const contextString = contextData.length > 0 
      ? `Context regarding the user's plants:\n${JSON.stringify(contextData.map(s => ({
          name: s.name,
          isDiseased: s.isDiseased,
          remediation: s.remediation,
          growthGuide: s.growthGuide,
          stats: s.stats,
          timestamp: s.timestamp
        })), null, 2)}\n\n` 
      : `The user hasn't scanned any plants yet.\n\n`;

    const fullPrompt = `${contextString}User's new message: ${message}`;

    try {
      const result = await chatSession.sendMessage(fullPrompt);
      const response = await result.response;
      let responseText = response.text();
      
      
      const { text, thinking } = splitResponse(responseText, contextData);
      
      return { text, thinking };
    } catch (error) {
      console.error("Chat Failed:", error);
      throw new Error("Failed to communicate with AI Chatbot.");
    }
  }
}

export const aiService = new AIService();
