import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";

config();

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }

  async uploadFile(file: any) {
    return this.ai.files.upload({
      file,
      config: { displayName: file.name, mimeType: "application/pdf" },
    });
  }

  async generateContent(model: string, contents: any, config?: any) {
    return this.ai.models.generateContent({ model, contents, config });
  }
}
