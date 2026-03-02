export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "https://www.impexo.fr");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Parser le body manuellement si nécessaire
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

  try {
    const wp = (process.env.WP_BASE_URL || "https://wp.impexo.fr").replace(/\/+$/, "");
    const url = `${wp}/store-proxy.php?endpoint=checkout`;

    const nonce = req.headers["nonce"] || req.headers["Nonce"] || "";
    const cartToken = req.headers["cart-token"] || req.headers["Cart-Token"] || "";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(nonce && { Nonce: nonce }),
        ...(cartToken && { "Cart-Token": cartToken }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erreur checkout", details: error.message });
  }
}
