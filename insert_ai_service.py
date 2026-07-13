import sys

file_path = 'cropmateNG/src/services/aiService.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_method = """  async predictDiseasesFromWeather(stateName: string, weather: { temperature: number, humidity: number, rainfall: number }, language: string = 'English'): Promise<{ predictions: { disease: string, probability: number, reasoning: string }[], summary: string }> {
    if (!apiKey) {
      throw new Error(\"Missing API Key. Please add VITE_GEMINI_API_KEY to your .env file.\");
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
        \"predictions\": [
          {
            \"disease\": \"Name of the disease (in ${language})\",
            \"probability\": 0.85,
            \"reasoning\": \"Brief explanation of why this weather condition increases the risk (in ${language})\"
          }
        ],
        \"summary\": \"A short, concise summary of the overall plant health risk for this weather (in ${language})\"
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) {
        throw new Error(\"Invalid AI response format.\");
      }
      const jsonText = text.substring(start, end + 1);
      return JSON.parse(jsonText);
    } catch (error) {
      console.error(\"Weather Prediction Failed:\", error);
      throw new Error(\"Failed to predict diseases from weather.\");
    }
  }

"""

target_line = -1
for i, line in enumerate(lines):
    if 'async chatWithContext' in line:
        target_line = i
        break

if target_line != -1:
    lines[target_line:target_line] = [new_method + '\\n']
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print('Successfully inserted new method.')
else:
    print('Could not find target line.')
