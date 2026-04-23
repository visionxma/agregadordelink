import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft, Check, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { PLAN_LIST, getPlan } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkBioLogo } from "@/components/linkbio-logo";
import { SubscribeButton, CancelSubscriptionButton } from "./billing-buttons";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, session.user.id))
    .limit(1);

  const currentPlan = getPlan(sub?.plan ?? "free");
  const params = await searchParams;
  const isActive = sub?.status === "active";
  const isPaid = currentPlan.id !== "free";

  return (
    <main className="ambient-bg min-h-screen">
      <header className="glass-nav sticky top-0 z-30 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center gap-3 px-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" /> Voltar
            </Link>
          </Button>
          <Link href="/dashboard" className="flex items-center">
            <LinkBioLogo size="md" />
          </Link>
        </div>
      </header>

      <section className="container mx-auto max-w-5xl px-4 py-12">

        {/* Banners de feedback */}
        {params.success && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="text-sm font-medium">
              Pagamento confirmado! Seu plano foi ativado.
            </span>
          </div>
        )}
        {params.canceled && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <AlertCircle className="size-5 shrink-0" />
            <span className="text-sm font-medium">
              Pagamento cancelado. Nenhuma cobrança foi feita.
            </span>
          </div>
        )}

        {/* Cabeçalho */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-[-0.03em] sm:text-5xl">
            Planos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Você está no{" "}
            <strong>plano {currentPlan.name}</strong>.
            {isActive && sub?.currentPeriodEnd && (
              <>
                {" "}Próxima cobrança em{" "}
                <strong>
                  {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")}
                </strong>.
              </>
            )}
            {sub?.cancelAtPeriodEnd && sub?.currentPeriodEnd && (
              <span className="ml-1 text-amber-700">
                (Cancelamento agendado para{" "}
                {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")})
              </span>
            )}
            {sub?.status === "past_due" && (
              <span className="ml-1 text-destructive">
                — Pagamento pendente. Regularize para não perder o acesso.
              </span>
            )}
          </p>
        </div>

        {/* Gerenciar assinatura ativa */}
        {isPaid && isActive && !sub?.cancelAtPeriodEnd && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Gerenciar assinatura</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Cancele a qualquer momento. Você mantém o acesso até o fim do período pago.
              </p>
              <CancelSubscriptionButton />
            </CardContent>
          </Card>
        )}

        {/* Grade de planos */}
        <div className="grid gap-5 lg:grid-cols-3">
          {PLAN_LIST.map((p) => {
            const isCurrent = p.id === currentPlan.id;
            return (
              <div
                key={p.id}
                className={`relative rounded-3xl border bg-card/80 p-6 backdrop-blur-xl shadow-ios-sm transition-shadow hover:shadow-ios-md ${
                  isCurrent
                    ? "border-primary ring-2 ring-primary/20"
                    : p.highlight
                      ? "border-primary/50"
                      : "border-border"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 left-6 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Seu plano
                  </span>
                )}
                {!isCurrent && p.badge && (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    {p.badge}
                  </span>
                )}

                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight">
                    {p.priceDisplay.replace("/mês", "")}
                  </span>
                  {p.priceDisplay.includes("/mês") && (
                    <span className="text-xs text-muted-foreground">/mês</span>
                  )}
                </div>

                <SubscribeButton planId={p.id} disabled={isCurrent} />

                <ul className="mt-5 space-y-2">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-2.5" />
                      </span>
                      {f}
                    </li>
                  ))}
                  {p.notIncluded?.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-xs text-muted-foreground/50 line-through"
                    >
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground/50">
                        <X className="size-2.5" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Pagamentos processados com segurança via{" "}
          <span className="font-semibold text-foreground">Abacate Pay</span>.
          Aceitamos PIX e cartão de crédito.
        </p>
      </section>
    </main>
  );
}
