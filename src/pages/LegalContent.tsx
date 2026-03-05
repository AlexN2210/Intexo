import { useParams, Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";

const TITLES: Record<string, string> = {
  "legal": "Mentions légales | CGV | Politique de confidentialité",
  "retours-retractation": "Retours & rétractation",
};

function LegalCombinedContent() {
  return (
    <article className="mt-8 space-y-12 text-sm text-muted-foreground">
      {/* 1. MENTIONS LÉGALES */}
      <section id="mentions-legales" className="space-y-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          1. MENTIONS LÉGALES
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground">Éditeur du site</h3>
            <p className="mt-1">
              <strong>IMPEXO</strong>
              <br />
              Entreprise individuelle
              <br />
              Gérant : Emrah Oral
              <br />
              Siège social : 66 Avenue des Champs-Élysées, 75008 Paris, France
            </p>
            <p className="mt-2">
              SIREN : 519 358 535
              <br />
              SIRET : 519 358 535 00010
              <br />
              N° TVA intracommunautaire : FR22 519 358 535
              <br />
              Code NAF/APE : 46.18Z
            </p>
            <p className="mt-2">
              Email : contact@impexo.fr
              <br />
              Site web : https://www.impexo.fr
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Directeur de la publication</h3>
            <p className="mt-1">Emrah Oral</p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Hébergement</h3>
            <p className="mt-1">
              <strong>o2switch</strong>
              <br />
              SARL au capital de 100 000 €
              <br />
              222 Boulevard Gustave Flaubert, 63000 Clermont-Ferrand
              <br />
              SIRET : 510 909 807 00032
              <br />
              Téléphone : 04 44 44 60 40
              <br />
              Site : https://www.o2switch.fr
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Propriété intellectuelle</h3>
            <p className="mt-1">
              L'ensemble du contenu présent sur le site www.impexo.fr (textes, images, logos, visuels produits) est la
              propriété exclusive d'IMPEXO et est protégé par les lois françaises et internationales relatives à la
              propriété intellectuelle. Toute reproduction, représentation ou adaptation, sans autorisation écrite
              préalable d'IMPEXO, est interdite.
            </p>
            <p className="mt-2">
              Les marques Apple® et iPhone® sont des marques déposées d'Apple Inc. Leur mention sur ce site est faite
              uniquement à titre indicatif de compatibilité. IMPEXO n'est pas affiliée à Apple Inc.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Paiement</h3>
            <p className="mt-1">
              Les paiements sont sécurisés par <strong>Stripe</strong>, prestataire certifié PCI-DSS. IMPEXO ne stocke
              à aucun moment vos coordonnées bancaires.
            </p>
          </div>
        </div>
      </section>

      {/* 2. CGV */}
      <section id="cgv" className="space-y-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          2. CONDITIONS GÉNÉRALES DE VENTE (CGV)
        </h2>
        <p className="italic">En vigueur au 1er mars 2026</p>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-foreground">Article 1 — Objet</h3>
            <p className="mt-1">
              Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits effectuées sur le site
              www.impexo.fr par IMPEXO, entreprise individuelle dirigée par Emrah Oral, SIREN 519 358 535, dont le siège
              social est situé 66 Avenue des Champs-Élysées, 75008 Paris.
            </p>
            <p className="mt-2">Tout achat sur le site vaut acceptation sans réserve des présentes CGV.</p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Article 2 — Produits</h3>
            <p className="mt-1">
              Les produits proposés à la vente sont des coques de protection pour smartphones iPhone 17 Series. IMPEXO
              se réserve le droit de modifier à tout moment son catalogue sans préavis.
            </p>
            <p className="mt-2">
              Les photographies et visuels des produits sont présentés à titre illustratif. Des variations mineures de
              couleur peuvent exister selon les conditions d'affichage.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Article 3 — Prix</h3>
            <p className="mt-1">
              Les prix sont indiqués en euros TTC. IMPEXO se réserve le droit de modifier ses prix à tout moment. Les
              produits sont facturés au prix en vigueur au moment de la validation de la commande.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Article 4 — Commande</h3>
            <p className="mt-1">La commande est définitivement enregistrée après :</p>
            <ol className="mt-2 list-decimal pl-5 space-y-1">
              <li>Sélection des produits et validation du panier</li>
              <li>Renseignement des informations de livraison</li>
              <li>Validation du paiement</li>
            </ol>
            <p className="mt-2">
              Un email de confirmation est adressé au client après validation de sa commande.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Article 5 — Paiement</h3>
            <p className="mt-1">
              Le paiement s'effectue en ligne par carte bancaire (Visa, Mastercard, American Express) via la plateforme
              sécurisée Stripe. Le débit est effectué au moment de la validation de la commande.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Article 6 — Livraison</h3>
            <p className="mt-1">
              <strong>Zone de livraison :</strong> France métropolitaine uniquement.
            </p>
            <p className="mt-2">
              <strong>Transporteur :</strong> Colissimo (La Poste) — livraison à domicile ou en point relais.
            </p>
            <p className="mt-2">
              <strong>Frais de livraison :</strong> 2,50 € par commande.
            </p>
            <p className="mt-2">
              <strong>Délai de livraison :</strong> 3 à 5 jours ouvrés à compter de la confirmation de commande.
            </p>
            <p className="mt-2">
              En cas de retard de livraison imputable au transporteur, IMPEXO ne pourra être tenue responsable. Le
              client pourra contacter le service client à contact@impexo.fr pour toute demande de suivi.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Article 7 — Droit de rétractation</h3>
            <p className="mt-1">
              Conformément à l'article L221-18 du Code de la consommation, le client dispose d'un délai de{" "}
              <strong>14 jours calendaires</strong> à compter de la réception de sa commande pour exercer son droit de
              rétractation, sans avoir à justifier de motif.
            </p>
            <p className="mt-2">
              Pour exercer ce droit, le client doit notifier sa décision à IMPEXO par email à contact@impexo.fr avant
              l'expiration du délai.
            </p>
            <p className="mt-2">
              Le produit doit être retourné dans son état d'origine, complet et sans traces d'utilisation.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Article 8 — Retours</h3>
            <p className="mt-1">
              Les frais de retour sont <strong>à la charge du client</strong>. IMPEXO recommande l'envoi en lettre
              suivie ou colissimo avec suivi.
            </p>
            <p className="mt-2">
              Adresse de retour :
              <br />
              IMPEXO — Service retours
              <br />
              66 Avenue des Champs-Élysées
              <br />
              75008 Paris
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Article 9 — Remboursement</h3>
            <p className="mt-1">
              Après réception et vérification du retour, IMPEXO procède au remboursement dans un délai de{" "}
              <strong>5 à 7 jours ouvrés</strong>, sur le moyen de paiement utilisé lors de la commande.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Article 10 — Garanties légales</h3>
            <p className="mt-1">
              Conformément aux articles L217-4 et suivants du Code de la consommation, les produits bénéficient de la
              garantie légale de conformité (2 ans) et de la garantie contre les vices cachés (articles 1641 et
              suivants du Code civil).
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Article 11 — Responsabilité</h3>
            <p className="mt-1">
              IMPEXO ne pourra être tenue responsable des dommages indirects résultant de l'utilisation de ses
              produits. La responsabilité d'IMPEXO est limitée au montant de la commande concernée.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Article 12 — Médiation</h3>
            <p className="mt-1">
              En cas de litige, le client peut recourir gratuitement au médiateur de la consommation{" "}
              <strong>CM2C (Centre de Médiation de la Consommation de Conciliateurs de Justice)</strong> :
            </p>
            <p className="mt-2">
              Site : https://www.cm2c.net
              <br />
              Email : cm2c@cm2c.net
              <br />
              Adresse : 49 rue de Ponthieu, 75008 Paris
            </p>
            <p className="mt-2">
              La médiation ne peut être engagée qu'après une tentative de résolution amiable auprès d'IMPEXO.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Article 13 — Droit applicable</h3>
            <p className="mt-1">
              Les présentes CGV sont soumises au droit français. En cas de litige non résolu par médiation, les
              tribunaux français seront seuls compétents.
            </p>
          </div>
        </div>
      </section>

      {/* 3. POLITIQUE DE CONFIDENTIALITÉ */}
      <section id="politique-confidentialite" className="space-y-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          3. POLITIQUE DE CONFIDENTIALITÉ
        </h2>
        <p className="italic">Conforme au RGPD — En vigueur au 1er mars 2026</p>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-foreground">Responsable du traitement</h3>
            <p className="mt-1">
              Emrah Oral — IMPEXO
              <br />
              66 Avenue des Champs-Élysées, 75008 Paris
              <br />
              contact@impexo.fr
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Données collectées</h3>
            <p className="mt-1">Lors d'une commande, IMPEXO collecte les données suivantes :</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Adresse postale de livraison</li>
              <li>Numéro de téléphone</li>
              <li>Données de transaction (montant, référence commande)</li>
            </ul>
            <p className="mt-2">
              Aucune donnée bancaire n'est stockée par IMPEXO. Les paiements sont traités par Stripe (politique de
              confidentialité disponible sur https://stripe.com/fr/privacy).
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Finalité du traitement</h3>
            <p className="mt-1">Les données personnelles sont collectées pour :</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Traitement et suivi des commandes</li>
              <li>Communication relative à votre commande (confirmation, expédition)</li>
              <li>Respect des obligations légales (comptabilité, fiscalité)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Durée de conservation</h3>
            <p className="mt-1">
              Les données clients sont conservées pendant <strong>3 ans</strong> à compter de la dernière commande,
              conformément aux obligations légales françaises.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Partage des données</h3>
            <p className="mt-1">
              Les données personnelles ne sont transmises qu'aux prestataires strictement nécessaires à l'exécution de
              la commande :
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Stripe</strong> — traitement du paiement</li>
              <li><strong>Colissimo / La Poste</strong> — livraison</li>
            </ul>
            <p className="mt-2">
              Aucune donnée n'est vendue ou transmise à des tiers à des fins commerciales.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Vos droits</h3>
            <p className="mt-1">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
              <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, contactez : contact@impexo.fr
            </p>
            <p className="mt-2">
              Vous pouvez également introduire une réclamation auprès de la <strong>CNIL</strong> : https://www.cnil.fr
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Cookies</h3>
            <p className="mt-1">
              Le site www.impexo.fr utilise uniquement des cookies techniques nécessaires à son fonctionnement :
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Cookie de session panier</strong> : mémorisation des articles ajoutés au panier</li>
              <li><strong>Cookies Stripe</strong> : sécurisation des transactions de paiement</li>
            </ul>
            <p className="mt-2">
              Ces cookies ne nécessitent pas de consentement préalable car ils sont strictement nécessaires au service.
              Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Sécurité</h3>
            <p className="mt-1">
              IMPEXO met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données
              contre tout accès non autorisé, perte ou altération. Les communications entre votre navigateur et le site
              sont chiffrées via le protocole HTTPS.
            </p>
          </div>
        </div>
      </section>

      <p className="pt-4 text-xs italic">Dernière mise à jour : mars 2026</p>
    </article>
  );
}

function RetoursContent() {
  return (
    <article className="mt-8 space-y-8 text-sm text-muted-foreground">
      <p className="italic">En vigueur au 1er mars 2026</p>

      <section>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Droit de rétractation</h2>
        <p className="mt-2">
          Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai de{" "}
          <strong>14 jours calendaires</strong> à compter de la réception de votre commande pour retourner un article,
          sans avoir à justifier de motif.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Conditions de retour</h2>
        <p className="mt-2">Pour être accepté, le produit retourné doit être :</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Dans son état d'origine</li>
          <li>Non utilisé et non endommagé</li>
          <li>Accompagné de la référence de commande</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Procédure de retour</h2>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-medium text-foreground">Étape 1 — Notifiez-nous</h3>
            <p className="mt-1">
              Envoyez un email à contact@impexo.fr en indiquant :
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Votre numéro de commande</li>
              <li>L'article que vous souhaitez retourner</li>
              <li>La raison du retour (facultatif)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Étape 2 — Expédiez le colis</h3>
            <p className="mt-1">Renvoyez le produit à l'adresse suivante :</p>
            <blockquote className="mt-2 border-l-2 border-muted-foreground/30 pl-4 italic">
              IMPEXO — Service retours
              <br />
              66 Avenue des Champs-Élysées
              <br />
              75008 Paris
            </blockquote>
            <p className="mt-2">
              Nous recommandons l'envoi en <strong>Colissimo avec suivi</strong>. Les frais de retour sont à votre
              charge. IMPEXO ne peut être tenue responsable des colis perdus ou endommagés lors du retour.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Étape 3 — Remboursement</h3>
            <p className="mt-1">
              Après réception et vérification du produit, nous procédons au remboursement dans un délai de{" "}
              <strong>5 à 7 jours ouvrés</strong>, sur le moyen de paiement utilisé lors de la commande.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Articles non remboursables</h2>
        <p className="mt-2">Ne sont pas éligibles au retour :</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Les produits utilisés ou endommagés par le client</li>
          <li>Les produits retournés hors délai (après 14 jours)</li>
          <li>Les produits incomplets</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Produit défectueux ou erreur de commande
        </h2>
        <p className="mt-2">
          Si vous avez reçu un produit défectueux ou ne correspondant pas à votre commande, contactez-nous à
          contact@impexo.fr dans les 48h suivant la réception. Dans ce cas, les frais de retour sont pris en charge par
          IMPEXO.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Contact</h2>
        <p className="mt-2">
          Pour toute question relative à un retour : contact@impexo.fr
        </p>
      </section>

      <p className="pt-4 text-xs italic">Dernière mise à jour : mars 2026</p>
    </article>
  );
}

export default function LegalContent() {
  const { slug } = useParams<{ slug: string }>();
  const title = (slug && TITLES[slug]) || "Document";
  const isCombinedLegal = slug === "legal";
  const isRetours = slug === "retours-retractation";

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-10 sm:py-14 lg:py-16">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">{title}</h1>

        {isCombinedLegal ? (
          <LegalCombinedContent />
        ) : isRetours ? (
          <RetoursContent />
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Contenu à compléter.</p>
        )}

        <p className="mt-8">
          <Link to="/mentions-legales" className="text-sm underline hover:no-underline">
            ← Retour aux mentions légales
          </Link>
        </p>
      </Container>
    </div>
  );
}
