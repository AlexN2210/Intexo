/**
 * Proxy Vercel : POST /api/checkout/create-order → WordPress custom-checkout/v1/create-order
 */

const ALLOWED_ORIGINS = [
  "https://www.impexo.fr",
  "https://impexo.fr",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

function setCors(res, req) {
  const origin = req?.headers?.origin ?? "https://www.impexo.fr";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

export default async function handler(req, res) {
  setCors(res, req);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const wpBase = (process.env.WP_BASE_URL || "https://www.impexo.fr").replace(/\/+$/, "");
    const wpUrl = `${wpBase}/wp-json/custom-checkout/v1/create-order`;

    const response = await fetch(wpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body || {}),
    });

    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("[Checkout] Erreur proxy:", error);
    return res.status(500).json({
      error: "Erreur proxy checkout",
      details: error?.message || String(error),
    });
  }
}
