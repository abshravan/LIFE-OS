import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return ok(data, 201);
}

export function err(
  message: string,
  status = 400,
  details?: Record<string, string[]>
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { success: false, error: message, ...(details && { details }) },
    { status }
  );
}

export function unauthorized(): NextResponse<ApiResponse<never>> {
  return err("Authentication required. Please log in.", 401);
}

export function forbidden(): NextResponse<ApiResponse<never>> {
  return err("Access denied.", 403);
}

export function notFound(resource = "Resource"): NextResponse<ApiResponse<never>> {
  return err(`${resource} not found.`, 404);
}

export function serverError(e: unknown): NextResponse<ApiResponse<never>> {
  console.error("[LifeOS API Error]", e);
  return err("Internal system error. Please try again.", 500);
}
