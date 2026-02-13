import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function proxyRequest(request: NextRequest, path: string[]) {
  const url = `${API_URL}/api/v1/${path.join("/")}`;
  const searchParams = request.nextUrl.searchParams.toString();
  const fullUrl = searchParams ? `${url}?${searchParams}` : url;

  const headers = new Headers();

  // Forward relevant headers
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.set("authorization", authorization);
  }

  // Forward cookies for auth
  const cookie = request.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }

  // Forward user-agent and client IP for audit logging
  const userAgent = request.headers.get("user-agent");
  if (userAgent) {
    headers.set("user-agent", userAgent);
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    headers.set("x-forwarded-for", forwardedFor);
  }

  try {
    let body: string | FormData | null = null;

    if (request.method !== "GET" && request.method !== "HEAD") {
      if (contentType?.includes("multipart/form-data")) {
        body = await request.formData();
      } else if (contentType?.includes("application/json")) {
        body = await request.text();
      } else {
        body = await request.text();
      }
    }

    const response = await fetch(fullUrl, {
      method: request.method,
      headers,
      body: body as BodyInit | null,
    });

    // Create response with appropriate headers
    const responseHeaders = new Headers();

    // Forward content-type
    const resContentType = response.headers.get("content-type");
    if (resContentType) {
      responseHeaders.set("content-type", resContentType);
    }

    // Forward set-cookie headers for auth
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      responseHeaders.set("set-cookie", setCookie);
    }

    // Handle SSE responses
    if (resContentType?.includes("text/event-stream")) {
      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-store, no-transform, must-revalidate",
          "X-Accel-Buffering": "no",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // Handle binary/download responses (images, files, exports, etc.)
    if (
      resContentType?.startsWith("image/") ||
      resContentType?.startsWith("application/octet-stream") ||
      resContentType?.includes("application/pdf") ||
      resContentType?.includes("application/zip") ||
      resContentType?.includes("text/csv") ||
      resContentType?.includes("application/vnd.openxmlformats")
    ) {
      const buffer = await response.arrayBuffer();

      // Forward content-disposition header for downloads
      const contentDisposition = response.headers.get("content-disposition");
      if (contentDisposition) {
        responseHeaders.set("content-disposition", contentDisposition);
      }

      // Forward cache headers for proxied images
      const cacheControl = response.headers.get("cache-control");
      if (cacheControl) {
        responseHeaders.set("cache-control", cacheControl);
      }
      const xCache = response.headers.get("x-cache");
      if (xCache) {
        responseHeaders.set("x-cache", xCache);
      }

      return new NextResponse(buffer, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to API server" },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}
