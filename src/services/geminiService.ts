import { GoogleGenAI } from "@google/genai";
import { QCResult, QCConfig, Instrument } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY as string 
});

export async function askQCExpert(
  question: string,
  context: {
    results: QCResult[];
    configs: QCConfig[];
    instruments: Instrument[];
  }
) {
  const { results, configs, instruments } = context;

  const currentStatusSummary = configs.map(config => {
    const configResults = results.filter(r => r.testId === config.id);
    const recentResults = configResults.slice(-5);
    const instrumentsList = instruments.filter(i => 
      configResults.some(r => r.instrumentId === i.id)
    ).map(i => i.name).join(", ");

    return `
Test: ${config.testName} (${config.unit})
Instruments: ${instrumentsList}
Mean (LV1): ${config.level1.mean}, SD: ${config.level1.sd}
Recent 5 values: ${recentResults.map(r => `${r.value} (LV${r.level})`).join(", ")}
Violations (LV1): ${recentResults.filter(r => r.level === 1 && r.westgardViolations.length > 0).length}
    `.trim();
  }).join("\n---\n");

  const systemInstruction = `
You are a senior Laboratory Quality Control (QC) Expert specialized in Westgard Rules and Six Sigma management.
Your name is "BK Lab AI Advisor".

RULES:
1. Provide professional advice based on Westgard Rules.
2. Use professional Thai language.
3. Be concise and helpful.
4. If a Westgard violation is detected (13s, 22s, R4s, etc.), explain and suggest actions.

CURRENT LABORATORY DATA:
${currentStatusSummary}
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: { systemInstruction, temperature: 0.7 }
    });
    return response.text || "ขออภัยครับ ไม่สามารถตอบคำถามได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI";
  }
}
