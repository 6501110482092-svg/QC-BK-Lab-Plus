import { QCResult, QCConfig, EQARecord } from '../types';

export function checkWestgardRules(
  currentValue: number,
  previousResults: QCResult[],
  config: QCConfig,
  level: 1 | 2 | 3,
  sigma?: number
): string[] {
  const violations: string[] = [];
  const levelParams = level === 1 ? config.level1 : (level === 2 ? config.level2 : config.level3);
  if (!levelParams) return [];
  
  const { mean, sd } = levelParams;
  const zScore = (currentValue - mean) / sd;
  const absZ = Math.abs(zScore);

  // All points from this test/level
  const history = previousResults.filter((r) => r.level === level && r.testId === config.id);
  const lastResults = history.slice(-9); // Need up to 9 previous points for 10x

  // Tiered Rejection Logic based on Sigma
  // 6 Sigma: Only 1-3s
  // 5 Sigma: 1-3s, 2-2s, R-4s
  // 4 Sigma: 1-3s, 2-2s, R-4s, 4-1s
  // <4 Sigma: 1-3s, 2-2s, R-4s, 4-1s, 10x

  const s = sigma || 0;

  // 1-3s Rejection (Always checked)
  if (absZ > 3) violations.push('1-3s');

  // Rules for Sigma < 6
  if (s < 6) {
    // 2-2s
    if (lastResults.length >= 1) {
      const prev = lastResults[lastResults.length - 1];
      const prevZ = (prev.value - mean) / sd;
      if (absZ > 2 && Math.abs(prevZ) > 2 && Math.sign(zScore) === Math.sign(prevZ)) {
        violations.push('2-2s');
      }

      // R-4s
      if (Math.abs(zScore - prevZ) > 4) {
        violations.push('R-4s');
      }
    }
  }

  // Rules for Sigma < 5
  if (s < 5 && lastResults.length >= 3) {
    // 4-1s: 4 consecutive results > 1SD on the same side
    const last4 = [...lastResults.slice(-3), { value: currentValue }];
    const last4Z = last4.map(r => (r.value - mean) / sd);
    if (last4Z.every(z => Math.abs(z) > 1 && Math.sign(z) === Math.sign(last4Z[0]))) {
      violations.push('4-1s');
    }
  }

  // Rules for Sigma < 4
  if (s < 4 && lastResults.length >= 9) {
    // 10x: 10 consecutive results on same side of mean
    const last10 = [...lastResults, { value: currentValue }];
    const last10Z = last10.map(r => (r.value - mean) / sd);
    if (last10Z.every(z => Math.sign(z) === Math.sign(last10Z[0]))) {
      violations.push('10x');
    }
  }

  return violations;
}

export function calculateEQASigma(
  yourResult: number,
  targetMean: number,
  peerSD: number,
  teaPercentage: number
) {
  const bias = Math.abs((yourResult - targetMean) / targetMean) * 100;
  const cv = (peerSD / targetMean) * 100;
  const sigma = (teaPercentage - bias) / cv;

  let suggestedRules: string[] = [];
  if (sigma >= 6) {
    suggestedRules = ['1-3s'];
  } else if (sigma >= 5) {
    suggestedRules = ['1-3s', '2-2s', 'R-4s'];
  } else if (sigma >= 4) {
    suggestedRules = ['1-3s', '2-2s', 'R-4s', '4-1s'];
  } else {
    suggestedRules = ['1-3s', '2-2s', 'R-4s', '4-1s', '10x'];
  }

  return { bias, cv, sigma, suggestedRules };
}

export function getThaiSigmaRecommendation(sigma: number, bias: number, cv: number): string {
  if (sigma >= 6) {
    return "ประสิทธิภาพระดับ World Class: ผลการทดสอบมีความแม่นยำสูงมาก แนะนำให้ใช้กฎ 1-3s เพียงอย่างเดียวเพื่อลดการเกิด False Rejection และช่วยประหยัดทรัพยากร";
  }
  if (sigma >= 4) {
    if (bias > cv) {
      return "ประสิทธิภาพระดับพอใช้ (Marginal): พบ Bias สูงกว่า Precision แนะนำให้ตรวจสอบการ Calibrator, ตรวจสอบ Reagent lot หรือพิจารณาการบำรุงรักษาเชิงป้องกัน (Maintenance)";
    }
    return "ประสิทธิภาพระดับพอใช้ (Marginal): พบ Imprecision (CV) สูง แนะนำให้ตรวจสอบระบบการดูดจ่ายสาร (Pipetting system), อุณหภูมิเครื่อง หรือทักษะของผู้ปฏิบัติงาน";
  }
  if (sigma >= 3) {
    return "ประสิทธิภาพต่ำ (Poor): ต้องใช้ Westgard Multi-rule อย่างเคร่งครัด แนะนำให้ทำการหาสาเหตุของทั้ง Systematic Error และ Random Error ทันที";
  }
  return "ประสิทธิภาพไม่ชัดเจน (Unacceptable): ผลการทดสอบไม่น่าเชื่อถือ แนะนำให้หยุดการทดสอบและหาสาเหตุ Root Cause Analysis (RCA) ก่อนเปิดระบบใหม่";
}
