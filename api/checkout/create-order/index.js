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
    } catch {
      body = {};
    }
  }

  const wp = (process.env.WP_BASE_URL || "https://wp.impexo.fr").replace(/\/+$/, "");
  const proxy = `${wp}/store-proxy.php`;

  try {
    // Un seul appel PHP : checkout-full fait tout dans la même session (vider panier → ajouter articles → checkout)
    const payload = {
      items: body.items || [],
      billing_address: body.customer?.billing || body.billing_address || {},
      shipping_address: body.customer?.shipping || body.shipping_address || body.customer?.billing || {},
      payment_method: body.payment_method || "woocommerce_payments",
      customer_note: body.customer_note || "",
    };

    const response = await fetch(`${proxy}?endpoint=checkout-full`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erreur checkout", details: error.message });
  }
}
