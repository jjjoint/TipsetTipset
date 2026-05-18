export interface CalibrationPoint {
  predictedBin: number;
  observedFrequency: number;
  count: number;
}

export interface BacktestResult {
  roundId: string;
  modelVersion: string;
  brierScore: number;
  logLoss: number;
  calibrationCurve: CalibrationPoint[];
  roi: number;
}
