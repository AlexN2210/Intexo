export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  // CORS pour toutes les réponses
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "https://www.impexo.fr");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Préflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Backend WordPress (wp.impexo.fr). Ne pas utiliser www.impexo.fr = front Vercel → boucle.
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
