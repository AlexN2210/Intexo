export const config = {
  runtime: "nodejs",
};

/**
 * Proxy vers l'endpoint WordPress custom-checkout/v1/create-order.
 * Crée la commande WooCommerce + session Stripe et renvoie payment_url.
 * Body attendu: { items, customer: { billing, shipping }, payment_method?, customer_note? }
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "https://www.impexo.fr");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
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
