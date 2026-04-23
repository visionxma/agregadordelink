import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { PLAN_LIST, getPlan } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkBioLogo } from "@/components/linkbio-logo";
import { BillingButtons } from "./billing-buttons";

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, session.user.id))
    .limit(1);

  const currentPlan = getPlan(sub?.plan ?? "free");

  return (
    <main className="ambient-bg min-h-screen">
      <header className="glass-nav sticky top-0 z-30 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" /> Voltar
              </Link>
            </Button>
            <Link href="/dashboard" className="flex items-center">
              <LinkBioLogo size="md" />
            </Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto max-w-5xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-[-0.03em] sm:text-5xl">
            Planos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Você está no <strong>plano {currentPlan.name}</strong>.
            {sub?.status === "active" && sub?.currentPeriodEnd && (
              <>
                {" "}
                Próxima cobrança em{" "}
                {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")}.
              </>
            )}
            {sub?.cancelAtPeriodEnd && (
              <span className="ml-1 text-amber-700">
                (Cancelamento agendado)
              </span>
            )}
          </p>
        </div>

        {sub && sub.plan !== "free" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Gerenciar assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Altere método de pagamento, veja faturas ou cancele.
              </p>
              <BillingButtons showPortal />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          {PLAN_LIST.map((p) => {
            const isCurrent = p.id === currentPlan.id;
            return (
              <div
                key={p.id}
                className={`relative rounded-3xl border bg-card/80 p-6 backdrop-blur-xl shadow-ios-sm ${isCurrent ? "border-primary ring-2 ring-primary/20" : p.highlight ? "border-primary/50" : "border-border"}`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 left-6 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Seu plano
                  </span>
                )}
                {!isCurrent && p.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Popular
                  </span>
                )}
                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight">
                    {p.priceDisplay.replace("/mês", "")}
                  </span>
                  {p.priceDisplay.includes("/mês") && (
                    <span className="text-xs text-muted-foreground">/mês</span>
                  )}
                </div>

                <BillingButtons planId={p.id} disabled={isCurrent} />

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
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
