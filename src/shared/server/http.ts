import "server-only";
import { ZodError } from "zod";
import { ConfigurationError, authConfig } from "./config";
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function endpoint(action: () => Promise<Response>) {
  try {
    return await action();
  } catch (error) {
    if (error instanceof HttpError)
      return json(
        { error: { code: error.code, message: error.message } },
        error.status,
      );
    if (error instanceof ZodError)
      return json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Data tidak valid. Periksa isian Anda.",
          },
        },
        422,
      );
    if (error instanceof ConfigurationError)
      return json(
        { error: { code: "SERVICE_UNAVAILABLE", message: error.message } },
        503,
      );
    return json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Layanan sementara tidak tersedia.",
        },
      },
      503,
    );
  }
}
export function requireSameOrigin(request: Request) {
  if (request.headers.get("origin") !== authConfig().baseURL)
    throw new HttpError(
      403,
      "INVALID_ORIGIN",
      "Asal permintaan tidak diizinkan.",
    );
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
    throw new HttpError(415, "INVALID_CONTENT_TYPE", "Gunakan JSON.");
}
export async function readJson(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 32768)
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Data terlalu besar.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "INVALID_JSON", "JSON diperlukan.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 32768) {
      await reader.cancel();
      throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Data terlalu besar.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new HttpError(400, "INVALID_JSON", "JSON tidak valid.");
  }
}
