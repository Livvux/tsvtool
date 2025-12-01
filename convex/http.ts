import { httpRouter } from 'convex/server';

const http = httpRouter();

// With Clerk authentication, we don't need HTTP routes for auth.
// Clerk handles all authentication flows client-side.
// This file is kept for potential future HTTP endpoints.

export default http;
