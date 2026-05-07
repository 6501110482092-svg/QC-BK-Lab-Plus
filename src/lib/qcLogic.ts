import { QCResult, QCConfig, EQARecord } from '../types';

export function checkWestgardRules(
  currentValue: number,
  previousResults: QCResult[],
  config: QCConfig,
  level: 1 | 2 | 3,
  sigma?: number
): string[] {
  const violations: string[] = [];

  const getZScore = (val: number, lvl: 1 | 2 | 3) => {
    const params = lvl === 1 ? config.level1 : (lvl === 2 ? config.level2 : config.level3);
    if (!params) return 0;
    return (val - params.mean) / params.sd;
  };

  const currentZ = getZScore(currentValue, level);
  const currentAbsZ = Math.abs(currentZ);
  const s = sigma || 0;

  // 1. Across Time Logic (Current level only)
  const levelHistory = previousResults
    .filter((r) => r.level === level && r.testId === config.id)
    .slice(-10); // History of THIS level

  // 1-3s Rejection
  if (currentAbsZ > 3) violations.push('1-3s (Across Time)');

  if (s < 6) {
    // 2-2s (Across Time)
    if (levelHistory.length >= 1) {
      const prev = levelHistory[levelHistory.length - 1];
      const prevZ = getZScore(prev.value, level);
      if (currentAbsZ > 2 && Math.abs(prevZ) > 2 && Math.sign(currentZ) === Math.sign(prevZ)) {
        violations.push('2-2s (Across Time)');
      }

      // R-4s (Across Time)
      if (Math.abs(currentZ - prevZ) > 4) {
        violations.push('R-4s (Across Time)');
      }
    }
  }

  if (s < 5 && levelHistory.length >= 3) {
    // 4-1s (Across Time)
    const last4Z = [...levelHistory.slice(-3).map(r => getZScore(r.value, level)), currentZ];
    if (last4Z.every(z => Math.abs(z) > 1 && Math.sign(z) === Math.sign(last4Z[0]))) {
      violations.push('4-1s (Across Time)');
    }
  }

  if (s < 4 && levelHistory.length >= 9) {
    // 10x (Across Time)
    const last10Z = [...levelHistory.map(r => getZScore(r.value, level)), currentZ];
    if (last10Z.every(z => Math.sign(z) === Math.sign(last10Z[0]))) {
      violations.push('10x (Across Time)');
    }
  }

  // 2. Across Material Logic (Compare with latest of other levels)
  // Get latest results for ALL levels of this test
  const otherLevels: (1 | 2 | 3)[] = ([1, 2, 3] as (1 | 2 | 3)[]).filter(l => l !== level);
  const latestOfOtherLevels = otherLevels.map(l => {
    const params = l === 1 ? config.level1 : (l === 2 ? config.level2 : config.level3);
    if (!params) return null;
    return previousResults.filter(r => r.level === l && r.testId === config.id).pop();
  }).filter(r => r !== undefined && r !== null) as QCResult[];

  if (latestOfOtherLevels.length > 0) {
    // 2-2s (Across Material)
    latestOfOtherLevels.forEach(other => {
      const otherZ = getZScore(other.value, other.level as any);
      if (currentAbsZ > 2 && Math.abs(otherZ) > 2 && Math.sign(currentZ) === Math.sign(otherZ)) {
        violations.push('2-2s (Across Material)');
      }

      // R-4s (Across Material)
      if (Math.abs(currentZ - otherZ) > 4) {
        violations.push('R-4s (Across Material)');
      }
    });

    // 4-1s (Across Material) - Combined 4 points across levels
    // Typically: current level (2 points) + other level (2 points)
    // For simplicity: check 4 total across all levels
    const allRecent = [...previousResults.filter(r => r.testId === config.id).slice(-3), { value: currentValue, level }];
    const allRecentZ = allRecent.map(r => getZScore(r.value, r.level as any));
    if (allRecentZ.length >= 4 && s < 5) {
      const last4Z = allRecentZ.slice(-4);
      if (last4Z.every(z => Math.abs(z) > 1 && Math.sign(z) === Math.sign(last4Z[0]))) {
        violations.push('4-1s (Across Material)');
      }
    }

    // 10x (Across Material)
    const allHistory = [...previousResults.filter(r => r.testId === config.id), { value: currentValue, level }];
    if (allHistory.length >= 10 && s < 4) {
      const last10Z = allHistory.slice(-10).map(r => getZScore(r.value, r.level as any));
      if (last10Z.every(z => Math.sign(z) === Math.sign(last10Z[0]))) {
        violations.push('10x (Across Material)');
      }
    }
  }

  // Remove duplicates (e.g. if a rule is triggered multiple times)
  return Array.from(new Set(violations));
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
