import { getAuth } from "@/features/auth/infrastructure/auth";
import {
  endpoint,
  readJson,
  requireSameOrigin,
  HttpError,
} from "@/shared/server/http";
export const runtime = "nodejs";
async function handle(request: Request) {
  const response = await getAuth().handler(request);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
export function GET(request: Request) {
  return endpoint(() => handle(request));
}
export function POST(request: Request) {
  return endpoint(async () => {
    requireSameOrigin(request);
    const body = await readJson(request);
    if (
      typeof body === "object" &&
      body !== null &&
      ["role", "emailVerified", "id", "userId"].some((key) => key in body)
    )
      throw new HttpError(
        422,
        "FORBIDDEN_FIELD",
        "Isian hak akses tidak dapat diubah.",
      );
    const headers = new Headers(request.headers);
    headers.delete("content-length");
    return handle(
      new Request(request.url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }),
    );
  });
}
