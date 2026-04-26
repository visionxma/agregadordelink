import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft, Check, X, AlertCircle, CheckCircle2, QrCode, CreditCard, Shield } from "lucide-react";
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

        {/* Métodos de pagamento */}
        <div className="mt-10 rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="size-4 text-emerald-500" />
              Pagamentos processados com segurança via{" "}
              <span className="font-semibold text-foreground">Abacate Pay</span>
            </div>
            <div className="flex items-center gap-3">
              {/* PIX */}
              <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-800 dark:bg-emerald-950/40">
                <QrCode className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">PIX</span>
                <span className="rounded-full bg-emerald-200 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                  INSTANTÂNEO
                </span>
              </div>
              {/* Cartão de crédito */}
              <div className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 dark:border-blue-800 dark:bg-blue-950/40">
                <CreditCard className="size-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Cartão de Crédito</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground sm:text-left">
            Escolha sua forma de pagamento preferida no momento do checkout. PIX é confirmado na hora — cartão aceita parcelamento em até 12x.
          </p>
        </div>
      </section>
    </main>
  );
}
