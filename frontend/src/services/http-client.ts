import axios from "axios";
import type { ApiErrorBody } from "@/types/api.types";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
  // Render free bisa butuh ±60 detik untuk bangun dari tidur.
  timeout: 90_000,
});

function readApiError(error: unknown): ApiErrorBody["error"] | null {
  if (!axios.isAxiosError(error)) return null;
  const body = error.response?.data as Partial<ApiErrorBody> | undefined;
  return body?.error && typeof body.error.message === "string" ? body.error : null;
}

/** Pesan ramah pengguna dari error API, atau `fallback` kalau tidak ada. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = readApiError(error);
  if (apiError) return apiError.message;
  if (axios.isAxiosError(error) && !error.response) {
    return "Server tidak bisa dihubungi. Periksa koneksi lalu coba lagi.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Pesan per field dari 400 VALIDATION_ERROR / 409 NAME_TAKEN, untuk dipetakan ke input form. */
export function getApiFieldErrors(error: unknown): Record<string, string> {
  return readApiError(error)?.fields ?? {};
}

/** Kode error backend (mis. "TYPE_IN_USE"), kalau ada. */
export function getApiErrorCode(error: unknown): ApiErrorBody["error"]["code"] | null {
  return readApiError(error)?.code ?? null;
}
