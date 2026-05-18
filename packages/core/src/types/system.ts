import type { Outcome, SystemStrategy } from './domain';

export type SystemRow = [
  Outcome, Outcome, Outcome, Outcome, Outcome, Outcome, Outcome,
  Outcome, Outcome, Outcome, Outcome, Outcome, Outcome
];

export interface HistogramBin {
  correct: number;
  count: number;
  probability: number;
}

export interface SimulationResult {
  iterations: number;
  probability10correct: number;
  probability11correct: number;
  probability12correct: number;
  probability13correct: number;
  expectedValue: number;
  histogram: HistogramBin[];
}

export interface GeneratedSystemData {
  id: string;
  roundId: string;
  budgetSek: number;
  strategy: SystemStrategy;
  rows: SystemRow[];
  simulationResult: SimulationResult;
  createdAt: Date;
}

export interface SystemGeneratorInput {
  roundId: string;
  budgetSek: number;
  strategy: SystemStrategy;
}
