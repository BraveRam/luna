import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async uploadFile(file: any) {
    return this.ai.files.upload({
      file,
      config: { displayName: file.name },
    });
  }

  async generateContent(model: string, contents: any, config?: any) {
    return this.ai.models.generateContent({ model, config, contents });
  }
}
