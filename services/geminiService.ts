import { GoogleGenAI, Type } from "@google/genai";
import { ResearchResult, Slide, Source } from '../types';

// Helper to get API key
const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log('Gemini API Key:', apiKey); // Debug log
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is missing");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Step 1: Perform deep research using Google Search Grounding.
 */
export const performResearch = async (topic: string): Promise<ResearchResult> => {
  const ai = getAiClient();
  
  const systemInstruction = `You are an elite technical researcher. 
  Your goal is to research the user's topic deeply using Google Search.
  Focus on:
  1. Recent breakthroughs and news.
  2. Technical challenges and bottlenecks.
  3. Future market or technological outlook.
  4. Key statistics and data points.
  
  Provide a comprehensive, structured report. Do not use markdown formatting like bolding or headers too heavily, just clear paragraphs.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Investigate the following topic deeply: "${topic}"`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction,
      },
    });

    const rawText = response.text || "No text generated.";
    
    // Extract sources from grounding metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Source[] = chunks
      .filter((c: any) => c.web?.uri && c.web?.title)
      .map((c: any) => ({
        title: c.web.title,
        uri: c.web.uri
      }));

    // Deduplicate sources
    const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());

    return {
      rawText,
      sources: uniqueSources
    };

  } catch (error) {
    console.error("Research Error:", error);
    throw error;
  }
};

/**
 * Step 2: Synthesize the research into a structured presentation (JSON).
 */
export const synthesizePresentation = async (topic: string, researchContext: string): Promise<Slide[]> => {
  const ai = getAiClient();

  // Define the schema for the output
  const slideSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Slide headline" },
        points: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "3-4 concise bullet points"
        },
        summary: { type: Type.STRING, description: "A short executive summary paragraph for the speaker notes" },
        metric: { type: Type.STRING, description: "A key statistic or number mentioned in the research, if applicable (e.g. '40% growth')" }
      },
      required: ["title", "points", "summary"],
    }
  };

  try {
    const prompt = `
      You are a Chief Strategy Officer. 
      Based on the following research report on "${topic}", create a 5-slide executive presentation.
      
      Research Context:
      ${researchContext.substring(0, 20000)} // Limit context if massive
      
      Requirements:
      1. Slide 1: Executive Overview
      2. Slide 2: Current Landscape / Technical Details
      3. Slide 3: Challenges & Risks
      4. Slide 4: Future Outlook
      5. Slide 5: Strategic Recommendation
      
      Make the content professional, punchy, and insightful.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: slideSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Failed to generate JSON");

    return JSON.parse(jsonText) as Slide[];

  } catch (error) {
    console.error("Synthesis Error:", error);
    throw error;
  }
};
