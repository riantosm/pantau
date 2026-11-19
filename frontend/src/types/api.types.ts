/** Bentuk error tunggal dari backend Go: { error: { code, message, fields?, details? } }. */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "BAD_JSON"
  | "INVALID_ID"
  | "NOT_FOUND"
  | "NAME_TAKEN"
  | "TYPE_IN_USE"
  | "INTERNAL";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: Record<string, string>;
    details?: Record<string, unknown>;
  };
}

/** Respons daftar: { data: [...], total }. */
export interface ApiList<T> {
  data: T[];
  total: number;
}

/** Respons satu item: { data: {...} }. */
export interface ApiItem<T> {
  data: T;
}

/** Status muat data di slice. */
export type LoadStatus = "idle" | "loading" | "loaded" | "error";
