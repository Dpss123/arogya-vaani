export async function transcribeAudio(audioBuffer: Buffer, mimeType: string = "audio/ogg"): Promise<string> {
  try {
    const { Blob: NodeBlob } = await import("buffer");
    const formData = new FormData();
    const blob = new NodeBlob([audioBuffer], { type: mimeType }) as unknown as Blob;
    formData.append("file", blob, "audio.ogg");
    formData.append("model", "whisper-large-v3");
    formData.append("language", "hi");
    formData.append("response_format", "text");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: formData,
    });
    const text = await response.text();
    return text || "Voice note samajh nahi aaya. Please text mein likhein.";
  } catch (error) {
    console.error("Whisper error:", error);
    return "Voice transcription mein problem hui. Please text mein likhein.";
  }
}

export function detectLanguage(text: string): "hindi" | "english" {
  const hindiPattern = /[\u0900-\u097F]/;
  return hindiPattern.test(text) ? "hindi" : "english";
}
