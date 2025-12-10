import { GoogleGenAI, Type } from "@google/genai";

// Helper to convert file to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getAI() {
    if (!this.ai) {
      const apiKey = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
      console.log("Using API Key:", apiKey);
      if (!apiKey) {
        throw new Error("API Key not found");
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  async diagnoseDisease(file: File | null, additionalInfo: string) {
    try {
      const ai = this.getAI();
      
      const prompt = `
        You are an expert AI medical assistant. 
        ${file ? 'Analyze this image/audio/video carefully.' : 'Analyze the described symptoms carefully.'}
        The user has provided this additional context: "${additionalInfo}".
        
        Please provide a response in the following Markdown format:
        ## Possible Condition
        [Name of possible condition or 'Unable to diagnose' if unclear]

        ## Analysis
        [Brief explanation of why]

        ## Recommended Actions
        [List of immediate steps, e.g., 'See a doctor', 'Apply ice', etc.]

        ## Disclaimer
        This is an AI analysis and not a professional medical diagnosis. Please consult a doctor.
      `;

      const parts: any[] = [{ text: prompt }];

      if (file) {
          const imagePart = await fileToGenerativePart(file);
          parts.unshift(imagePart);
      }

      const response = await ai.models.generateContent({
        //model: 'gemini-3-pro-preview', // High reasoning capability
        model: "gemini-2.5-flash-lite",
        contents: {
          parts: parts
        }
      });
      
      return response.text;
    } catch (error) {
      console.error("Gemini Diagnosis Error:", error);
      throw error;
    }
  }

  async analyzeNutrition(file: File) {
    try {
        const ai = this.getAI();
        const imagePart = await fileToGenerativePart(file);
        
        const prompt = "Identify this food, estimate calories and macros, and suggest a healthy recipe.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [imagePart, { text: prompt }]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        foodName: { type: Type.STRING },
                        calories: { type: Type.STRING },
                        macros: {
                            type: Type.OBJECT,
                            properties: {
                                protein: { type: Type.STRING },
                                carbs: { type: Type.STRING },
                                fats: { type: Type.STRING }
                            }
                        },
                        healthScore: { type: Type.NUMBER },
                        recipe: { type: Type.STRING }
                    }
                }
            }
        });
        
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Gemini Nutrition Error", error);
        throw error;
    }
  }

  async recommendMedicine(symptoms: string) {
    try {
        const ai = this.getAI();
        const prompt = `
            User has these symptoms: ${symptoms}.
            Recommend over-the-counter medicines. 
            Keep it brief. Warning: Always advise consulting a doctor.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Medicine Error", error);
        throw error;
    }
  }
}

export const geminiService = new GeminiService();