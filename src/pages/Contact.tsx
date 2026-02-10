import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/layout/Container";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  message: z.string().min(10, "Message trop court"),
});

type Values = z.infer<typeof schema>;

export default function Contact() {
  const { toast } = useToast();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = (values: Values) => {
    // À brancher: endpoint WP (Contact Form 7 / custom REST endpoint) ou support tool.
    console.log("Contact:", values);
    toast({ title: "Message envoyé", description: "Nous revenons vers vous rapidement." });
    form.reset();
  };

  return (
    <div className="bg-background">
      <Container className="py-10 sm:py-12">
        <FadeIn>
          <div>
            <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">SUPPORT</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Contact & assistance</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Un style sobre, un échange clair. L’équipe Impexo est là pour vous conseiller.
            </p>
          </div>
        </FadeIn>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <FadeIn className="rounded-3xl border bg-card p-6">
            <div className="text-sm font-medium tracking-tight">Nous écrire</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Réponse sous 24–48h ouvrées (à adapter selon votre organisation).
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input className="h-11 rounded-2xl bg-muted/40" placeholder="Votre nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 rounded-2xl bg-muted/40"
                          placeholder="vous@exemple.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-32 rounded-2xl bg-muted/40"
                          placeholder="Votre demande (modèle d’iPhone, couleur, question…) "
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="h-12 w-full rounded-full">
                  Envoyer
                </Button>
              </form>
            </Form>
          </FadeIn>

          <FadeIn delay={0.05} className="rounded-3xl border bg-card p-6">
            <div className="text-sm font-medium tracking-tight">FAQ</div>
            <div className="mt-2 text-sm text-muted-foreground">Réponses rapides, ton premium, zéro bruit.</div>

            <Accordion type="single" collapsible className="mt-6">
              <AccordionItem value="item-1">
                <AccordionTrigger>Quels modèles d’iPhone sont compatibles ?</AccordionTrigger>
                <AccordionContent>
                  Les compatibilités sont indiquées sur chaque page produit. Filtrez aussi par modèle dans la boutique.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Les coques protègent-elles l’appareil photo ?</AccordionTrigger>
                <AccordionContent>
                  Oui, avec un léger rebord de protection (selon la gamme). Les détails sont listés dans la fiche
                  produit.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Expédition et retours</AccordionTrigger>
                <AccordionContent>
                  À connecter à votre configuration WooCommerce. Une fois le checkout branché, ces informations peuvent
                  être dynamiques (zones, délais, politiques).
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </FadeIn>
        </div>
      </Container>
    </div>
  );
}

