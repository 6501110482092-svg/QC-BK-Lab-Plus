export interface User {
  id: string;
  name: string;
  licenseNumber: string;
  role: 'MT' | 'MD' | 'ADMIN';
  password?: string;
}

export interface QCResult {
  id: string;
  date: string;
  value: number;
  level: 1 | 2 | 3;
  instrumentId: string;
  testId: string;
  operatorId: string;
  comment?: string;
  westgardViolations: string[];
}

export interface LevelConfig {
  mean: number;
  sd: number;
}

export interface QCConfig {
  id: string;
  testName: string;
  unit: string;
  level1: LevelConfig;
  level2: LevelConfig;
  level3?: LevelConfig;
  allowableError?: number;
}

export interface EQARecord {
  id: string;
  testId: string;
  instrumentId: string;
  date: string;
  yourResult: number;
  targetMean: number;
  peerSD: number;
  teaPercentage: number;
  bias: number;
  cv: number;
  sigma: number;
}

export interface Instrument {
  id: string;
  name: string;
  model: string;
}
