/**
 * Script de test pour vérifier que le proxy fonctionne
 * Usage: node test-proxy.js
 * 
 * Ce script teste le proxy en local (nécessite vercel dev)
 * ou directement l'API WooCommerce si le proxy n'est pas disponible
 */

const WP_BASE_URL = process.env.VITE_WP_BASE_URL || process.env.WP_BASE_URL || 'https://www.impexo.fr';
const CONSUMER_KEY = process.env.VITE_WC_CONSUMER_KEY || process.env.WC_CONSUMER_KEY || 'ck_374c0ec78039fd4115f44238dae84ac7cb31cd38';
const CONSUMER_SECRET = process.env.VITE_WC_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET || 'cs_80d24956f94f48b7724d06bc5149e7ab0cf376a3';

const PROXY_URL = 'http://localhost:3000/api/woocommerce/products?per_page=1';

async function testProxy() {
  console.log('🔍 Test du proxy WooCommerce...\n');
  
  // Test 1: Proxy local (si vercel dev est lancé)
  console.log('📡 Test 1: Proxy local (http://localhost:3000/api/woocommerce/products)...');
  try {
    const proxyResponse = await fetch(PROXY_URL);
    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      console.log('✅ Proxy local fonctionne !');
      console.log(`   - Status: ${proxyResponse.status}`);
      console.log(`   - Produits retournés: ${Array.isArray(data) ? data.length : 'N/A'}`);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`   - Premier produit: ${data[0].name || 'N/A'}`);
      }
      console.log('\n🎉 Le proxy est opérationnel ! Vous pouvez utiliser vercel dev pour développer.\n');
      return;
    } else {
      console.log(`⚠️  Proxy local retourne ${proxyResponse.status}`);
    }
  } catch (error) {
    console.log('⚠️  Proxy local non disponible (vercel dev non lancé ?)');
    console.log(`   ${error.message}\n`);
  }

  // Test 2: API directe WooCommerce
  console.log('📡 Test 2: API WooCommerce directe...');
  const directUrl = new URL(`${WP_BASE_URL}/wp-json/wc/v3/products`);
  directUrl.searchParams.set('consumer_key', CONSUMER_KEY);
  directUrl.searchParams.set('consumer_secret', CONSUMER_SECRET);
  directUrl.searchParams.set('per_page', '1');

  try {
    const directResponse = await fetch(directUrl.toString());
    if (directResponse.ok) {
      const data = await directResponse.json();
      console.log('✅ API WooCommerce directe fonctionne !');
      console.log(`   - Status: ${directResponse.status}`);
      console.log(`   - Produits retournés: ${Array.isArray(data) ? data.length : 'N/A'}`);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`   - Premier produit: ${data[0].name || 'N/A'}`);
      }
      console.log('\n💡 Pour utiliser le proxy en local, lancez: vercel dev\n');
    } else {
      console.error(`❌ Erreur API: ${directResponse.status} ${directResponse.statusText}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testProxy().catch(console.error);
