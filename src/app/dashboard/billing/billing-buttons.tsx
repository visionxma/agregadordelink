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
      const result = await createCheckoutSession(planId);
      if (result && "error" in result) toast.error(result.error);
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
          ? "Redirecionando..."
          : `Assinar ${planId === "pro" ? "Pro" : "Business"}`}
    </Button>
  );
}

export function CancelSubscriptionButton() {
  const [pending, startTransition] = useTransition();

  function cancel() {
    if (!confirm("Tem certeza que quer cancelar sua assinatura? Você perderá os benefícios ao fim do período.")) return;
    startTransition(async () => {
      const result = await cancelSubscription();
      if (result && "error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Assinatura cancelada. Você mantém o acesso até o fim do período pago.");
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
