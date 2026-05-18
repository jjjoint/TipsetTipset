import type { PayoutInfo } from '@tipset/core';
import type { ModelSignals, Outcome, SystemRow } from '@tipset/core';
import type { CalibrationPoint } from '@tipset/core';

export function encodePayoutInfo(info: PayoutInfo | null): string | null {
  return info ? JSON.stringify(info) : null;
}

export function decodePayoutInfo(raw: string | null): PayoutInfo | null {
  if (!raw) return null;
  return JSON.parse(raw) as PayoutInfo;
}

export function encodeRecommendedSigns(signs: Outcome[]): string {
  return JSON.stringify(signs);
}

export function decodeRecommendedSigns(raw: string): Outcome[] {
  return JSON.parse(raw) as Outcome[];
}

export function encodeSystemRows(rows: SystemRow[]): string {
  return JSON.stringify(rows);
}

export function decodeSystemRows(raw: string): SystemRow[] {
  return JSON.parse(raw) as SystemRow[];
}

export function encodeModelSignals(signals: ModelSignals | null): string | null {
  return signals ? JSON.stringify(signals) : null;
}

export function decodeModelSignals(raw: string | null): ModelSignals | null {
  if (!raw) return null;
  return JSON.parse(raw) as ModelSignals;
}

export function encodeForm(form: ('W' | 'D' | 'L')[] | null): string | null {
  return form ? JSON.stringify(form) : null;
}

export function decodeForm(raw: string | null): ('W' | 'D' | 'L')[] | null {
  if (!raw) return null;
  return JSON.parse(raw) as ('W' | 'D' | 'L')[];
}

export function encodeCalibrationData(data: CalibrationPoint[] | null): string | null {
  return data ? JSON.stringify(data) : null;
}

export function decodeCalibrationData(raw: string | null): CalibrationPoint[] | null {
  if (!raw) return null;
  return JSON.parse(raw) as CalibrationPoint[];
}
