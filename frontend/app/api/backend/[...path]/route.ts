import { NextRequest, NextResponse } from "next/server";

function backendBase() {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://backend:8000"
  ).replace(/\/+$/, "");
}

async function proxy(req: NextRequest, path: string[]) {
  const targetUrl =
    `${backendBase()}/api/v1/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);

  headers.delete("host");
  headers.delete("content-length");
  headers.delete("connection");
  headers.delete("accept-encoding");

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const responseBody = await upstream.arrayBuffer();

  const responseHeaders = new Headers();

  upstream.headers.forEach((value, key) => {
    if (
      ![
        "content-encoding",
        "content-length",
        "transfer-encoding",
        "connection",
      ].includes(key.toLowerCase())
    ) {
      responseHeaders.set(key, value);
    }
  });

  responseHeaders.set(
    "content-length",
    responseBody.byteLength.toString()
  );

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}
