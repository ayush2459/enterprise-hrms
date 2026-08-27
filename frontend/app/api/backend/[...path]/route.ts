import { NextRequest, NextResponse } from "next/server";

// Replaces the old next.config.ts rewrite. In standalone output mode,
// next.config rewrites are resolved once at BUILD time and frozen into
// the build output — but BACKEND_INTERNAL_URL is only set when the
// container actually runs, not during `docker build`. That silently
// baked in zero rewrites no matter what env var was present at runtime.
// A route handler re-reads process.env on every request instead, so it
// works regardless of when/where the env var is set (Docker, Render, etc).

function backendBase() {
  return process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
}

async function proxy(req: NextRequest, path: string[]) {
  const targetUrl = `${backendBase()}/api/v1/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}
