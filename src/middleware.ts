import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/cadastro", "/parceria", "/parceria-rede", "/api/auth/login", "/api/auth/registro"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith("/api/auth/"))) {
    return NextResponse.next();
  }

  // Permitir POST público em /api/parcerias (formulários da landing)
  if (pathname === "/api/parcerias" && request.method === "POST") {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/gestao-pc2026") || pathname.startsWith("/api/admin")) {
    if (payload.role !== "ADMIN" && payload.role !== "OPERADOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  const headers = new Headers(request.headers);
  headers.set("x-user-id", payload.id);
  headers.set("x-user-role", payload.role);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
