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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

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

export default function Checkout() {
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
    setIsSubmitting(true);
    setCheckoutLoading(true);
    try {
      const payload = {
        items: getCartPayloadForCheckout(items),
        customer: {
          billing: {
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            phone: values.phone,
            address_1: values.address_1,
            address_2: values.address_2 ?? "",
            city: values.city,
            postcode: values.postcode,
            country: values.country,
          },
          shipping: {
            first_name: values.first_name,
            last_name: values.last_name,
            address_1: values.address_1,
            address_2: values.address_2 ?? "",
            city: values.city,
            postcode: values.postcode,
            country: values.country,
          },
        },
        payment_method: "stripe",
      };

      const result = await createOrderFromCart(payload);

      if (result.payment_url) {
        window.location.href = result.payment_url;
        return;
      }

      toast({
        title: "Commande créée",
        description: result.order_id
          ? `Commande #${result.order_id}. Paiement à finaliser.`
          : "Redirection vers le paiement indisponible.",
      });
      navigate("/confirmation" + (result.order_id ? `?order_id=${result.order_id}` : ""), { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création de la commande.";
      toast({ title: "Erreur", description: message, variant: "destructive" });
      setCheckoutLoading(false);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return null;
  }

  return (
    <div className="bg-background">
      <Container className="py-10 sm:py-12">
        <FadeIn>
          <div>
            <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">CHECKOUT</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Finaliser la commande</h1>
            <p className="mt-2 text-sm text-muted-foreground">Vos informations et paiement sécurisé Stripe.</p>
          </div>
        </FadeIn>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <FadeIn className="rounded-3xl border bg-card p-6">
                  <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">COORDONNÉES</div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input className="h-11 rounded-2xl bg-muted/40" placeholder="Prénom" {...field} />
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
                            <Input className="h-11 rounded-2xl bg-muted/40" placeholder="Nom" {...field} />
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
                              className="h-11 rounded-2xl bg-muted/40"
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
                            <Input className="h-11 rounded-2xl bg-muted/40" placeholder="+33 6 12 34 56 78" {...field} />
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
                          <Input className="h-11 rounded-2xl bg-muted/40" placeholder="Numéro et rue" {...field} />
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
                          <Input className="h-11 rounded-2xl bg-muted/40" placeholder="Bât, étage, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input className="h-11 rounded-2xl bg-muted/40" placeholder="Ville" {...field} />
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
                            <Input className="h-11 rounded-2xl bg-muted/40" placeholder="75001" {...field} />
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
                            <Input className="h-11 rounded-2xl bg-muted/40" placeholder="FR" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FadeIn>
              </div>

              <FadeIn delay={0.05} className="rounded-3xl border bg-card p-6 lg:sticky lg:top-24 lg:self-start">
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
                  className="mt-6 h-12 w-full rounded-full"
                  disabled={isSubmitting || items.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création de la commande...
                    </>
                  ) : (
                    "Aller au paiement Stripe"
                  )}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Vous serez redirigé vers Stripe pour un paiement sécurisé.
                </p>
              </FadeIn>
            </div>
          </form>
        </Form>
      </Container>
    </div>
  );
}
