import { NextResponse } from 'next/server';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data, error: null }, { status });
}

export function error(message: string, status = 500): NextResponse<ApiResponse<null>> {
  return NextResponse.json({ data: null, error: message }, { status });
}
