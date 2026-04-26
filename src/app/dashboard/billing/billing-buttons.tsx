"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanTier } from "@/lib/db/schema";
import { createCheckoutSession, cancelSubscription, startFreeTrial } from "./actions";

export function SubscribeButton({
  planId,
  disabled,
  trialAvailable,
}: {
  planId: PlanTier;
  disabled?: boolean;
  trialAvailable?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function subscribe() {
    startTransition(async () => {
      try {
        const result = await createCheckoutSession(planId);
        if ("error" in result) { toast.error(result.error); return; }
        window.location.href = result.url;
      } catch (err) {
        console.error("[SubscribeButton]", err);
        toast.error("Erro inesperado. Tente novamente.");
      }
    });
  }

  function activateTrial() {
    startTransition(async () => {
      try {
        const result = await startFreeTrial(planId as "pro" | "business");
        if ("error" in result) { toast.error(result.error); return; }
        toast.success("Trial ativado! Aproveite 3 dias grátis.");
        router.refresh();
      } catch (err) {
        console.error("[TrialButton]", err);
        toast.error("Erro inesperado. Tente novamente.");
      }
    });
  }

  if (planId === "free") {
    return (
      <Button variant="outline" className="mt-5 w-full" disabled>
        Plano atual
      </Button>
    );
  }

  if (disabled) {
    return (
      <Button variant="outline" className="mt-5 w-full" disabled>
        Plano atual
      </Button>
    );
  }

  return (
    <div className="mt-5 space-y-2">
      {trialAvailable ? (
        <>
          <Button
            onClick={activateTrial}
            disabled={pending}
            className="w-full gap-2 bg-gradient-to-r from-primary to-emerald-500 hover:opacity-90"
          >
            <Zap className="size-4" />
            {pending ? "Ativando..." : "Testar 3 dias grátis"}
          </Button>
          <p className="text-center text-[10px] text-muted-foreground">
            Sem cartão de crédito agora
          </p>
          <button
            type="button"
            onClick={subscribe}
            disabled={pending}
            className="w-full text-center text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground disabled:opacity-50"
          >
            Já quero assinar com cartão
          </button>
        </>
      ) : (
        <>
          <Button onClick={subscribe} disabled={pending} className="w-full">
            {pending ? "Aguarde..." : `Assinar ${planId === "pro" ? "Pro" : "Business"}`}
          </Button>
          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <CreditCard className="size-3" /> Cartão de crédito
          </div>
        </>
      )}
    </div>
  );
}

export function CancelSubscriptionButton() {
  const [pending, startTransition] = useTransition();

  function cancel() {
    if (
      !confirm(
        "Tem certeza que quer cancelar sua assinatura? Você mantém o acesso até o fim do período pago."
      )
    )
      return;

    startTransition(async () => {
      try {
        const result = await cancelSubscription();
        if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.success(
            "Assinatura cancelada. Você mantém o acesso até o fim do período."
          );
        }
      } catch (err) {
        console.error("[CancelSubscriptionButton]", err);
        toast.error("Erro inesperado. Tente novamente.");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cancel}
      disabled={pending}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      {pending ? "Cancelando..." : "Cancelar assinatura"}
    </Button>
  );
}
