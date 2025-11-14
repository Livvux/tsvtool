import { NextRequest } from 'next/server';
import http from '@/convex/http';

export const runtime = 'nodejs';

// Cache GET requests for 30 seconds
export const revalidate = 30;
export const dynamic = 'force-dynamic';

async function handleRequest(request: NextRequest, method: string) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return new Response('Convex URL not configured', { status: 500 });
  }

  // Get the path from the catch-all route
  const path = request.nextUrl.pathname.replace('/api/convex', '') || '/';
  
  // Forward the request to Convex
  const url = new URL(path, convexUrl);
  url.search = request.nextUrl.search;

  const response = await fetch(url.toString(), {
    method,
    headers: {
      ...Object.fromEntries(request.headers.entries()),
      host: new URL(convexUrl).host,
    },
    body: method !== 'GET' && method !== 'HEAD' ? await request.text() : undefined,
    // Add cache for GET requests
    cache: method === 'GET' ? 'no-store' : 'no-store',
  });

  // Set appropriate cache headers
  const headers = new Headers(response.headers);
  if (method === 'GET') {
    headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  } else {
    headers.set('Cache-Control', 'no-store');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}

export async function OPTIONS(request: NextRequest) {
  return handleRequest(request, 'OPTIONS');
}

