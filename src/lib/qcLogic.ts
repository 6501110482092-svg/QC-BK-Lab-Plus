import { QCResult, QCConfig, EQARecord } from '../types';

export function checkWestgardRules(
  currentValue: number,
  previousResults: QCResult[],
  config: QCConfig,
  level: 1 | 2 | 3,
  instrumentId: string,
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

  // History of THIS level on THIS instrument
  const levelHistory = previousResults
    .filter((r) => r.level === level && r.testId === config.id && r.instrumentId === instrumentId)
    .slice(-10); // Keep enough for 10x check

  // 1-2s Warning (Standard Westgard)
  if (currentAbsZ >= 2 && currentAbsZ < 3) {
    violations.push('1-2s | Warning | Across Time');
  }

  // 1-3s Rejection
  if (currentAbsZ >= 3) {
    violations.push('1-3s | Random Error | Across Time');
  }

  if (s < 6) {
    // 2-2s (Across Time)
    if (levelHistory.length >= 1) {
      const prev = levelHistory[levelHistory.length - 1];
      const prevZ = getZScore(prev.value, level);
      if (currentAbsZ >= 2 && Math.abs(prevZ) >= 2 && Math.sign(currentZ) === Math.sign(prevZ)) {
        violations.push('2-2s | Systemic Error | Across Time');
      }

      // R-4s (Across Time)
      if (Math.abs(currentZ - prevZ) >= 4) {
        violations.push('R-4s | Random Error | Across Time');
      }
    }
  }

  if (s < 5) {
    // 4-1s (Across Time)
    // Needs 3 previous + current = 4
    if (levelHistory.length >= 3) {
      const last4Z = [...levelHistory.slice(-3).map(r => getZScore(r.value, level)), currentZ];
      if (last4Z.length === 4 && last4Z.every(z => Math.abs(z) >= 1 && Math.sign(z) === Math.sign(last4Z[0]))) {
        violations.push('4-1s | Systemic Error | Across Time');
      }
    }
  }

  if (s < 4) {
    // 10x (Across Time)
    // Needs 9 previous + current = 10
    if (levelHistory.length >= 9) {
      const last10Z = [...levelHistory.slice(-9).map(r => getZScore(r.value, level)), currentZ];
      if (last10Z.length === 10 && last10Z.every(z => Math.sign(z) === Math.sign(last10Z[0]))) {
        violations.push('10x | Systemic Error | Across Time');
      }
    }
  }

  // 2. Across Material Logic (Current instrument, but check OTHER levels)
  const otherLevels: (1 | 2 | 3)[] = ([1, 2, 3] as (1 | 2 | 3)[]).filter(l => l !== level);
  
  const latestOfOtherLevels = otherLevels.map(l => {
    const params = l === 1 ? config.level1 : (l === 2 ? config.level2 : config.level3);
    if (!params) return null;
    return previousResults.filter(r => r.level === l && r.testId === config.id && r.instrumentId === instrumentId).pop();
  }).filter(r => r !== undefined && r !== null) as QCResult[];

  if (latestOfOtherLevels.length > 0) {
    if (s < 6) {
      // 2-2s (Across Material)
      latestOfOtherLevels.forEach(other => {
        const otherZ = getZScore(other.value, other.level as any);
        if (currentAbsZ >= 2 && Math.abs(otherZ) >= 2 && Math.sign(currentZ) === Math.sign(otherZ)) {
          violations.push('2-2s | Systemic Error | Across Material');
        }

        // R-4s (Across Material)
        if (Math.abs(currentZ - otherZ) >= 4) {
          violations.push('R-4s | Random Error | Across Material');
        }
      });
    }

    // 4-1s (Across Material)
    const allRecentOnInstrument = [...previousResults.filter(r => r.testId === config.id && r.instrumentId === instrumentId).slice(-3), { value: currentValue, level }];
    if (allRecentOnInstrument.length >= 4 && s < 5) {
      const last4Z = allRecentOnInstrument.slice(-4).map(r => getZScore(r.value, r.level as any));
      if (last4Z.every(z => Math.abs(z) >= 1 && Math.sign(z) === Math.sign(last4Z[0]))) {
        violations.push('4-1s | Systemic Error | Across Material');
      }
    }

    // 10x (Across Material)
    const allHistoryOnInstrument = [...previousResults.filter(r => r.testId === config.id && r.instrumentId === instrumentId), { value: currentValue, level }];
    if (allHistoryOnInstrument.length >= 10 && s < 4) {
      const last10Z = allHistoryOnInstrument.slice(-10).map(r => getZScore(r.value, r.level as any));
      if (last10Z.every(z => Math.sign(z) === Math.sign(last10Z[0]))) {
        violations.push('10x | Systemic Error | Across Material');
      }
    }
  }

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

export function calculateStats(values: number[]) {
  if (values.length === 0) return { mean: 0, sd: 0, cv: 0 };
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  if (n < 2) return { mean, sd: 0, cv: 0 };
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
  const sd = Math.sqrt(variance);
  const cv = (sd / mean) * 100;
  return { mean, sd, cv };
}
