"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { PlanTier } from "@/lib/db/schema";
import { createCheckoutSession, cancelSubscription } from "./actions";

export function SubscribeButton({
  planId,
  disabled,
}: {
  planId: PlanTier;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function subscribe() {
    startTransition(async () => {
      try {
        const result = await createCheckoutSession(planId);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        // Redireciona para o checkout da Abacate Pay
        window.location.href = result.url;
      } catch (err) {
        console.error("[SubscribeButton]", err);
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

  return (
    <Button
      onClick={subscribe}
      disabled={disabled || pending}
      className="mt-5 w-full"
      variant={disabled ? "outline" : "default"}
    >
      {disabled
        ? "Plano atual"
        : pending
          ? "Aguarde..."
          : `Assinar ${planId === "pro" ? "Pro" : "Business"}`}
    </Button>
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
