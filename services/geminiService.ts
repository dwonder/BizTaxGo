import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const askTaxAssistant = async (question: string, context?: string) => {
  try {
    const ai = getAiClient();
    const systemInstruction = `You are an expert Nigerian Tax Consultant for SMEs called 'BizTax Advisor'. 
    Your goal is to explain complex tax concepts (CIT, VAT, PAYE, WHT) simply. 
    Always cite relevant Nigerian tax laws (e.g., Finance Act 2023, CITA, PITA) when possible but keep it practical.
    If the user asks about specific calculations, guide them to use the app's calculator but explain the logic.
    Current Context: ${context || 'General inquiry'}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the tax database right now. Please try again later.";
  }
};

export const analyzeDocument = async (documentText: string) => {
  try {
    const ai = getAiClient();
    const prompt = `Analyze this text from a business document (receipt, invoice, or tax certificate). 
    Extract the following if present: 
    1. Date
    2. Total Amount
    3. Vendor/Payer Name
    4. Document Type (Invoice, Receipt, TCC, etc.)
    5. A brief summary.
    
    Return the result as a valid JSON object with keys: date, amount, vendor, type, summary.
    Do not wrap in markdown code blocks. Just the raw JSON string.

    Document Text:
    ${documentText}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Could not analyze document.");
  }
};
