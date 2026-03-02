export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "https://www.impexo.fr");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Nonce, Cart-Token");
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
    } catch {
      body = {};
    }
  }

  const wp = (process.env.WP_BASE_URL || "https://wp.impexo.fr").replace(/\/+$/, "");
  const proxyUrl = `${wp}/store-proxy.php`;

  try {
    // 1. Récupérer un nonce frais + Cart-Token via GET cart
    const cartRes = await fetch(`${proxyUrl}?endpoint=cart`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const nonce = cartRes.headers.get("Nonce") || cartRes.headers.get("nonce") || "";
    const cartToken = cartRes.headers.get("Cart-Token") || cartRes.headers.get("cart-token") || "";

    if (!nonce) {
      return res.status(500).json({ error: "Impossible de récupérer le nonce WooCommerce" });
    }

    // 2. Appeler checkout avec le nonce
    const checkoutRes = await fetch(`${proxyUrl}?endpoint=checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Nonce: nonce,
        ...(cartToken && { "Cart-Token": cartToken }),
      },
      body: JSON.stringify(body),
    });

    const data = await checkoutRes.json().catch(() => ({}));
    return res.status(checkoutRes.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erreur checkout", details: error.message });
  }
}
