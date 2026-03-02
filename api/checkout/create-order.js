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
    // 1. GET cart → récupérer nonce + session cookie
    const cartRes = await fetch(`${proxy}?endpoint=cart`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const nonce = cartRes.headers.get("Nonce") || cartRes.headers.get("nonce") || "";
    const cartToken = cartRes.headers.get("Cart-Token") || cartRes.headers.get("cart-token") || "";
    // Récupérer le Set-Cookie pour maintenir la session
    const setCookie = cartRes.headers.get("set-cookie") || "";

    if (!nonce) {
      return res.status(500).json({ error: "Impossible de récupérer le nonce" });
    }

    const sessionHeaders = {
      "Content-Type": "application/json",
      Nonce: nonce,
      ...(cartToken && { "Cart-Token": cartToken }),
      ...(setCookie && { Cookie: setCookie }),
    };

    // 2. Vider le panier
    await fetch(`${proxy}?endpoint=cart/items`, {
      method: "DELETE",
      headers: sessionHeaders,
    });

    // 3. Ajouter chaque article
    const items = body.items || [];
    for (const item of items) {
      await fetch(`${proxy}?endpoint=cart/add-item`, {
        method: "POST",
        headers: sessionHeaders,
        body: JSON.stringify({
          id: item.product_id,
          quantity: item.quantity,
          ...(item.variation_id ? { variation_id: item.variation_id } : {}),
        }),
      });
    }

    // 4. Checkout
    const checkoutBody = {
      billing_address: body.customer?.billing || body.billing_address,
      shipping_address: body.customer?.shipping || body.shipping_address,
      payment_method: body.payment_method || "woocommerce_payments",
      customer_note: body.customer_note || "",
    };

    const checkoutRes = await fetch(`${proxy}?endpoint=checkout`, {
      method: "POST",
      headers: sessionHeaders,
      body: JSON.stringify(checkoutBody),
    });

    const data = await checkoutRes.json().catch(() => ({}));
    return res.status(checkoutRes.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erreur checkout", details: error.message });
  }
}
