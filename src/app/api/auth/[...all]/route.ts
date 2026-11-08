import { getAuth } from "@/features/auth/infrastructure/auth";
import {
  endpoint,
  readJson,
  requireSameOrigin,
  HttpError,
} from "@/shared/server/http";
export const runtime = "nodejs";
export function GET(request: Request) {
  return endpoint(() => getAuth().handler(request));
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
    return getAuth().handler(
      new Request(request.url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }),
    );
  });
}
