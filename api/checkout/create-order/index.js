export const config = {
  runtime: "nodejs",
};

/**
 * Proxy vers l'endpoint WordPress custom-checkout/v1/create-order.
 * Crée la commande WooCommerce + session Stripe et renvoie payment_url.
 * Body attendu: { items, customer: { billing, shipping }, payment_method?, customer_note? }
 */
const ALLOWED_ORIGINS = ["https://www.impexo.fr", "https://impexo.fr"];

function setCors(res, req) {
  const origin = req.headers?.origin || req.headers?.Origin;
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");
}

export default async function handler(req, res) {
  setCors(res, req);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const wpBase = (process.env.WP_BASE_URL || "https://wp.impexo.fr").replace(/\/+$/, "");
    const wpUrl = `${wpBase}/wp-json/custom-checkout/v1/create-order`;

    const response = await fetch(wpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {}),
    });

    const data = await response.json().catch(() => ({}));

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Erreur proxy checkout",
      details: error.message,
    });
  }
}
