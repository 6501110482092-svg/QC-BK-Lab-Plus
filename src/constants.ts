import { Instrument, QCConfig } from './types';

export const INSTRUMENTS: Instrument[] = [
  { id: 'inst-1', name: 'Alinity c', model: 'Abbott' },
  { id: 'inst-2', name: 'Cobas c501', model: 'Roche' },
];

export const QC_CONFIGS: QCConfig[] = [
  {
    id: 'test-glu',
    testName: 'Glucose',
    unit: 'mg/dL',
    level1: { mean: 100, sd: 2.5 },
    level2: { mean: 250, sd: 5.0 },
  },
  {
    id: 'test-cre',
    testName: 'Creatinine',
    unit: 'mg/dL',
    level1: { mean: 1.0, sd: 0.05 },
    level2: { mean: 4.0, sd: 0.15 },
  },
];

export const WESTGARD_RULES = {
  W1_2S: '1-2s (Warning)',
  R1_3S: '1-3s (Rejection)',
  R2_2S: '2-2s (Rejection)',
  R_4S: 'R-4s (Rejection)',
};
