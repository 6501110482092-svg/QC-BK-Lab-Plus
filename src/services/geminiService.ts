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

  // Prepare a concise summary of the current QC state for the AI
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
You are a senior Laboratory Quality Control (QC) Expert specialized in Westgard Rules and Six Sigma management for medical laboratories.
Your name is "BK Lab AI Advisor".
You have access to the current laboratory's QC data summary below.

RULES:
1. Always provide professional, accurate, and helpful advice based on Westgard Rules.
2. If a user asks about their data, refer to the provided summary.
3. Be concise and use a professional tone.
4. You can speak in both Thai and English (Default to Thai as the user is Thai).
5. If a Westgard violation is detected (like 13s, 22s, R4s, 41s, 10x), explain what it means and suggest corrective actions (e.g., check reagents, recalibrate, or investigate instrument).

CURRENT LABORATORY DATA SUMMARY:
${currentStatusSummary}
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "ขออภัยครับ ผมไม่สามารถประมวลผลคำตอบได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI Advisor";
  }
}

export async function askBloodTestAdvisor(query: string) {
  const systemInstruction = `
You are a highly experienced Clinical Pathologist and Medical Doctor.
Your role is to help medical staff interpret blood test results and provide patient-friendly advice.

GUIDELINES:
1. Use professional yet empathetic tone.
2. Explain medical terms in simple Thai language.
3. Always include a disclaimer: "นี่คือการวิเคราะห์เบื้องต้นโดย AI กรุณาปรึกษาแพทย์เจ้าของไข้เพื่อการวินิจฉัยที่แน่นอน"
4. If results are critical (e.g., extremely high glucose, very low hemoglobin), emphasize the urgency.
5. Provide lifestyle advice related to the results (e.g., diet for high cholesterol, hydration for high BUN/Cr).
6. You are talking to medical personnel who will relay this to patients, but you can also provide the direct wording for patients to understand easily.

Context: You are providing advice based on typical reference ranges (e.g., Glucose 70-100 mg/dL, Hb 12-16 g/dL, etc.). If the user provides specific values, analyze them against standard medical knowledge.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    return response.text || "ขออภัยครับ ผมไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini Medical API Error:", error);
    return "ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบวิเคราะห์ผลเลือด";
  }
}
