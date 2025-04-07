import { GoogleGenAI } from "@google/genai";
import {GEMINI_API_KEY} from "@env"

// Configure the Gemini API with your API key
console.log("Gemini API Key:",GEMINI_API_KEY);
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "", // Replace with your actual API key
});

// Function to analyze transactions and holidays
export const analyzeTransactionsAndHolidays = async (
  transactions: { type: string; amount: number; date: string }[],
  holidays: { name: string; date: string }[]
) => {
  try {
    const prompt = `
      Analyze the following transaction data and holidays.
      Provide structured predictions for next day, monthly, and yearly spending.
      Also, provide financial advice on where savings can be improved based on trends and upcoming holidays.
      Return the response in **valid JSON format** with two fields: 
      - "predictions" (object with daily, monthly, and yearly predictions)
      - "advice" (an array of advice strings)
      - pleae keep the predictions format as daily:{expense:, income:}, monthly:{expense:, income:}, yearly:{expense:, income:}
      - please keep the advice format as an array of strings
      - if data is less just put the some avergae for that coomponent , like just multiply and divide by days or months ,as needed and put in bracket less data.

      Transaction Data: ${JSON.stringify(transactions, null, 2)}
      Holidays: ${JSON.stringify(holidays, null, 2)}
    `;

    // Send prompt properly using "contents"
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config:{responseMimeType:"application/json"},
    });

    const text = result.text;
    // console.log("AI result:", JSON.parse(result.text?.split("json")[1].slice(0,result.text?.split("json")[1].length-3)));
    console.log("AI Response:",text );

    // Parse response to JSON
    if (!text) {
      throw new Error("AI response text is undefined");
    }
    const json = JSON.parse(text);

    return json;
  } catch (error) {
    console.error("Error fetching AI predictions:", error);
    throw new Error("Failed to fetch AI predictions");
  }
};
