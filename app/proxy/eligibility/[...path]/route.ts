import { NextRequest, NextResponse } from "next/server";

const ELIGIBILITY_BACKEND_URL = "https://paddling-velcro-appetite.ngrok-free.dev";

async function proxyEligibilityRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetUrl = new URL(`/${path.join("/")}`, ELIGIBILITY_BACKEND_URL);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.set("host", new URL(ELIGIBILITY_BACKEND_URL).host);
  headers.set("ngrok-skip-browser-warning", "any");

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    redirect: "manual",
  });

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyEligibilityRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyEligibilityRequest(request, context);
}

