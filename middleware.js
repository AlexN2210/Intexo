/**
 * Edge Middleware : répond à la preflight OPTIONS pour /api/checkout/create-order
 * avec les en-têtes CORS, pour éviter le blocage quand le front est sur www.impexo.fr.
 */
import { next } from "@vercel/functions";

const CORS_ORIGIN = "https://www.impexo.fr";

const corsHeaders = {
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

export const config = {
  matcher: "/api/checkout/create-order",
};

export default function middleware(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return next({
    headers: corsHeaders,
  });
}
