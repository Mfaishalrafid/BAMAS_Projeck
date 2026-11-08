import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_BAMAS_DEMO_ONLY !== "true")
    return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: {
          code: "DEMO_ONLY",
          message: "Preview ini hanya menyediakan SIMULASI.",
        },
      },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.redirect(new URL("/?screen=profile", request.url));
}

export const config = { matcher: ["/api/:path*", "/akun/:path*"] };
