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
  const proxy = `${wp}/store-proxy.php`;

  try {
    // 1. GET cart → nonce + cart-token
    const cartRes = await fetch(`${proxy}?endpoint=cart`);
    let nonce = cartRes.headers.get("Nonce") || cartRes.headers.get("nonce") || "";
    let cartToken = cartRes.headers.get("Cart-Token") || cartRes.headers.get("cart-token") || "";

    if (!nonce || !cartToken) {
      return res.status(500).json({ error: "Impossible de récupérer nonce/cart-token" });
    }

    const makeHeaders = (n, ct) => ({
      "Content-Type": "application/json",
      "Nonce": n,
      "Cart-Token": ct,
    });

    // 2. Vider le panier
    await fetch(`${proxy}?endpoint=cart/items`, {
      method: "DELETE",
      headers: makeHeaders(nonce, cartToken),
    });

    // 3. Ajouter chaque article — mettre à jour le cart-token après chaque ajout
    const items = body.items || [];
    for (const item of items) {
      const addRes = await fetch(`${proxy}?endpoint=cart/add-item`, {
        method: "POST",
        headers: makeHeaders(nonce, cartToken),
        body: JSON.stringify({
          id: item.variation_id && item.variation_id !== 0 ? item.variation_id : item.product_id,
          quantity: item.quantity,
        }),
      });

      // Rafraîchir le cart-token retourné
      const newCartToken = addRes.headers.get("Cart-Token") || addRes.headers.get("cart-token");
      const newNonce = addRes.headers.get("Nonce") || addRes.headers.get("nonce");
      if (newCartToken) cartToken = newCartToken;
      if (newNonce) nonce = newNonce;

      const addData = await addRes.json().catch(() => ({}));
      if (!addRes.ok) {
        return res.status(400).json({ error: "Erreur ajout article", details: addData });
      }
    }

    // 4. Checkout
    const checkoutBody = {
      billing_address: body.billing_address || {},
      payment_method: body.payment_method || "woocommerce_payments",
      customer_note: body.customer_note || "",
    };

    const checkoutRes = await fetch(`${proxy}?endpoint=checkout`, {
      method: "POST",
      headers: makeHeaders(nonce, cartToken),
      body: JSON.stringify(checkoutBody),
    });

    const data = await checkoutRes.json().catch(() => ({}));
    return res.status(checkoutRes.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Erreur checkout", details: error.message });
  }
}