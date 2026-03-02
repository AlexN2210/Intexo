/**
 * Edge Middleware : s'applique à tout sauf /api/checkout/create-order.
 * La route checkout est gérée uniquement par api/checkout/create-order.js qui envoie les headers CORS.
 */
import { next } from "@vercel/functions";

export const config = {
  matcher: ["/((?!api/checkout/create-order).*)"],
};

export default function middleware() {
  return next();
}
