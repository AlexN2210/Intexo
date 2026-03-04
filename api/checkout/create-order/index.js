export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "https://www.impexo.fr");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      const raw = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(data));
        req.on("error", reject);
      });
      body = raw ? JSON.parse(raw) : {};
    } catch { body = {}; }
  }

  const wp = (process.env.WP_BASE_URL || "https://wp.impexo.fr").replace(/\/+$/, "");
  const consumerKey = (process.env.WC_CONSUMER_KEY || process.env.VITE_WC_CONSUMER_KEY || "").trim();
  const consumerSecret = (process.env.WC_CONSUMER_SECRET || process.env.VITE_WC_CONSUMER_SECRET || "").trim();

  if (!consumerKey || !consumerSecret) {
    return res.status(500).json({
      error: "Authentification manquante",
      details: "Définir WC_CONSUMER_KEY et WC_CONSUMER_SECRET dans Vercel (Environment Variables).",
    });
  }

  const authB64 = Buffer.from(consumerKey + ":" + consumerSecret, "utf8").toString("base64");
  const authorization = "Basic " + authB64;

  // Store API uniquement : store-proxy dispatch en interne vers POST /wc/store/v1/checkout (pas wc/v3/orders)
  const storeProxyUrl = `${wp}/store-proxy.php?endpoint=checkout-full`;
  try {
    console.log("[checkout] Store API via proxy:", storeProxyUrl, "→ POST /wc/store/v1/checkout");
    const response = await fetch(storeProxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        // En-tête de secours : certains hébergeurs (Apache) suppriment "Authorization"
        "X-WC-Proxy-Auth": authB64,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    const hasClientSecret = data?.payment_result?.payment_intent_client_secret ?? data?.payment_intent_client_secret;
    console.log("[checkout] WP status:", response.status, "has payment_intent_client_secret:", !!hasClientSecret, "body:", JSON.stringify(data).slice(0, 400));

    if (response.status === 401) {
      return res.status(401).json({
        error: "Authentification refusée",
        details: "Clés WooCommerce invalides ou utilisateur sans droit. Vérifier WC_CONSUMER_KEY / WC_CONSUMER_SECRET (compte admin).",
        ...data,
      });
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erreur checkout", details: error.message });
  }
}