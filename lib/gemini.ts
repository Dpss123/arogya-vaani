// ============================================
// GEMINI AI CLIENT
// This file connects to Google Gemini API
// To change AI model: change MODEL_NAME below
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Main model for conversation and triage.
// gemini-1.5-flash is retired; 2.5-flash is current, free-tier, multimodal.
export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Vision model for reading reports, X-rays, medicine strips
export const geminiVision = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Sentinel returned (not thrown) on failure so conversational paths always have
// something to show. Structured routes should treat this as an error.
export const GEMINI_ERROR_MESSAGE = "Maafi chahta hoon, abhi koi problem aa rahi hai. Thodi der baad dobara try karein.";

// Helper — send a message and get response. Falls back to free Groq (LLaMA)
// when Gemini errors / is rate-limited, then to the sentinel if both fail.
export async function askGemini(prompt: string): Promise<string> {
  try {
    const result = await geminiFlash.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini error, trying Groq fallback:", error);
    try {
      const { groqText } = await import("./groq");
      return await groqText(prompt);
    } catch (e2) {
      console.error("Groq fallback failed:", e2);
      return GEMINI_ERROR_MESSAGE;
    }
  }
}

// Helper — send image + prompt to Gemini Vision
export async function askGeminiVision(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  try {
    const result = await geminiVision.generateContent([
      { inlineData: { data: imageBase64, mimeType } },
      prompt,
    ]);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Vision error, trying Groq vision fallback:", error);
    try {
      const { groqVision } = await import("./groq");
      return await groqVision(imageBase64, mimeType, prompt);
    } catch (e2) {
      console.error("Groq vision fallback failed:", e2);
      return "Report padh nahi paya. Please dobara upload karein.";
    }
  }
}
