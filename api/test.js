/**
 * Route de test pour vérifier que les API Routes fonctionnent sur Vercel
 */

export default async function handler(req, res) {
  return res.status(200).json({
    success: true,
    message: "API Route fonctionne correctement",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
  });
}
