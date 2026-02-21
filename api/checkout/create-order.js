/**
 * Route Vercel : reçoit le panier (items + customer) et le transmet à WordPress
 * pour création de la commande (custom endpoint). Un seul appel au checkout → pas de 429.
 */

export const config = {
  api: { bodyParser: true },
};

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
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const wpBase = process.env.WP_BASE_URL;
  if (!wpBase || !wpBase.startsWith("http")) {
    console.error("[Checkout] WP_BASE_URL manquant ou invalide");
    return res.status(500).json({ error: "Configuration serveur manquante" });
  }

  const url = `${wpBase.replace(/\/+$/, "")}/wp-json/custom-checkout/v1/create-order`;
  const body = req.body ?? {};

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error("[Checkout] Erreur vers WordPress:", err);
    res.status(502).json({
      error: "Impossible de contacter le serveur de commande",
      message: err?.message,
    });
  }
}
