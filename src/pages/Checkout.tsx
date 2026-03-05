import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createOrderFromCart } from "@/services/checkout";
import {
  getCartPayloadForCheckout,
  selectCartDiscount,
  selectCartSubtotal,
  useCartStore,
} from "@/store/cartStore";
import { formatEUR } from "@/utils/money";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "hsl(var(--foreground))",
      "::placeholder": { color: "hsl(var(--muted-foreground))" },
    },
    invalid: {
      color: "hsl(var(--destructive))",
    },
  },
};

const schema = z.object({
  first_name: z.string().min(1, "Prénom requis"),
  last_name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(1, "Téléphone requis"),
  address_1: z.string().min(1, "Adresse requise"),
  address_2: z.string().optional(),
  city: z.string().min(1, "Ville requise"),
  postcode: z.string().min(1, "Code postal requis"),
  country: z.string().min(1, "Pays requis"),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_COUNTRY = "FR";

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const packOfferId = useCartStore((s) => s.packOfferId);
  const setCheckoutLoading = useCartStore((s) => s.setCheckoutLoading);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = selectCartSubtotal(items);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);
  const discount = selectCartDiscount(subtotal, count, packOfferId);
  const total = Math.max(0, subtotal - discount);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address_1: "",
      address_2: "",
      city: "",
      postcode: "",
      country: DEFAULT_COUNTRY,
    },
  });

  useEffect(() => {
    setCheckoutLoading(false);
  }, [setCheckoutLoading]);

  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      navigate("/panier", { replace: true });
    }
  }, [items.length, isSubmitting, navigate]);

  const onSubmit = async (values: FormValues) => {
    if (items.length === 0) {
      toast({ title: "Panier vide", variant: "destructive" });
      return;
    }
    if (!stripe || !elements) {
      toast({ title: "Stripe non prêt", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setCheckoutLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({ title: "Erreur", description: "Champ carte manquant.", variant: "destructive" });
      setCheckoutLoading(false);
      setIsSubmitting(false);
      return;
    }

    try {
      const billing = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        address_1: values.address_1,
        address_2: values.address_2 ?? "",
        city: values.city,
        postcode: values.postcode,
        country: values.country,
      };

      // Étape 1 : créer la commande WC + PaymentIntent → reçoit client_secret
      const result = await createOrderFromCart({
        items: getCartPayloadForCheckout(items),
        billing_address: billing,
      });

      const clientSecret = (result as { client_secret?: string }).client_secret;

      if (!clientSecret) {
        throw new Error(
          (result as { error?: string }).error ?? "Pas de client_secret reçu du serveur."
        );
      }

      // Étape 2 : confirmer le paiement avec Stripe.js
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${values.first_name} ${values.last_name}`.trim(),
            email: values.email,
            phone: values.phone,
            address: {
              line1: values.address_1,
              line2: values.address_2 || undefined,
              city: values.city,
              postal_code: values.postcode,
              country: values.country,
            },
          },
        },
      });

      if (error) {
        toast({
          title: "Paiement refusé",
          description: error.message ?? "Vérifiez vos informations carte.",
          variant: "destructive",
        });
        setCheckoutLoading(false);
        setIsSubmitting(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // Étape 3 : notifier WordPress que le paiement est confirmé
        await fetch(`${(import.meta.env.VITE_CHECKOUT_API_BASE_URL ?? "")}/api/checkout/confirm-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: result.order_id,
            payment_intent_id: paymentIntent.id,
          }),
        }).catch(() => null);

        navigate(`/confirmation?order_id=${result.order_id}`, { replace: true });
        return;
      }

      throw new Error("Statut de paiement inattendu : " + paymentIntent?.status);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du paiement.";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setCheckoutLoading(false);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return null;
  }

  return (
    <div className="bg-background min-h-screen impexo-safe-bottom">
      <Container className="py-6 sm:py-10 md:py-12">
        <FadeIn>
          <div>
            <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">CHECKOUT</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">Finaliser la commande</h1>
            <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">Vos informations et paiement sécurisé Stripe.</p>
          </div>
        </FadeIn>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 sm:mt-8 min-w-0">
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 min-w-0">
              <div className="space-y-4 sm:space-y-6 lg:col-span-2 min-w-0">
                <FadeIn className="rounded-2xl border bg-card p-5 sm:rounded-3xl sm:p-6">
                  <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">COORDONNÉES</div>
                  <div className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input className="min-h-[44px] rounded-xl bg-muted/40 sm:rounded-2xl sm:h-11" placeholder="Prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input className="min-h-[44px] rounded-xl bg-muted/40 sm:rounded-2xl sm:h-11" placeholder="Nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              className="min-h-[44px] rounded-xl bg-muted/40 sm:rounded-2xl sm:h-11"
                              placeholder="email@exemple.fr"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input className="min-h-[44px] rounded-xl bg-muted/40 sm:rounded-2xl sm:h-11" placeholder="+33 6 12 34 56 78" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address_1"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input className="min-h-[44px] rounded-xl bg-muted/40 sm:rounded-2xl sm:h-11" placeholder="Numéro et rue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address_2"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Complément d&apos;adresse (optionnel)</FormLabel>
                        <FormControl>
                          <Input className="min-h-[44px] rounded-xl bg-muted/40 sm:rounded-2xl sm:h-11" placeholder="Bât, étage, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input className="min-h-[44px] rounded-xl bg-muted/40 sm:rounded-2xl sm:h-11" placeholder="Ville" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal</FormLabel>
                          <FormControl>
                            <Input className="min-h-[44px] rounded-xl bg-muted/40 sm:rounded-2xl sm:h-11" placeholder="75001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pays</FormLabel>
                          <FormControl>
                            <Input className="min-h-[44px] rounded-xl bg-muted/40 sm:rounded-2xl sm:h-11" placeholder="FR" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FadeIn>

                <FadeIn className="rounded-2xl border bg-card p-5 sm:rounded-3xl sm:p-6">
                  <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">CARTE BANCAIRE</div>
                  <p className="mt-2 text-sm text-muted-foreground">Paiement sécurisé par Stripe.</p>
                  <div className="mt-3 rounded-xl border bg-muted/30 p-3 sm:mt-4 sm:rounded-2xl sm:p-4">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                </FadeIn>
              </div>

              <FadeIn delay={0.05} className="rounded-2xl border bg-card p-5 sm:rounded-3xl sm:p-6 lg:sticky lg:top-24 lg:self-start impexo-safe-bottom min-w-0">
                <div className="text-sm font-medium tracking-tight">Récapitulatif</div>
                <Separator className="my-4" />
                <ul className="space-y-2 text-sm">
                  {items.map((it) => (
                    <li key={it.key} className="flex justify-between gap-2">
                      <span className="truncate text-muted-foreground">
                        {it.name} × {it.quantity}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums">{formatEUR(it.unitPrice * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium tabular-nums">{formatEUR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Remise</span>
                    <span className="font-medium tabular-nums">- {formatEUR(discount)}</span>
                  </div>
                )}
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold tabular-nums">{formatEUR(total)}</span>
                </div>
                <Button
                  type="submit"
                  className="mt-6 min-h-[48px] w-full rounded-full text-base sm:h-12"
                  disabled={isSubmitting || !stripe || items.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    "Payer"
                  )}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Paiement sécurisé par Stripe. Vos données carte ne transitent pas par notre serveur.
                </p>
              </FadeIn>
            </div>
          </form>
        </Form>
      </Container>
    </div>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}