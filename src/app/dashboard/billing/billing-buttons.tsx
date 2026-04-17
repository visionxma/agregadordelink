"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { PlanTier } from "@/lib/db/schema";
import { createCheckoutSession, createPortalSession } from "./actions";

export function BillingButtons({
  planId,
  disabled,
  showPortal,
}: {
  planId?: PlanTier;
  disabled?: boolean;
  showPortal?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function subscribe() {
    if (!planId) return;
    startTransition(async () => {
      const result = await createCheckoutSession(planId);
      if (result && "error" in result) toast.error(result.error);
    });
  }

  function openPortal() {
    startTransition(async () => {
      const result = await createPortalSession();
      if (result && "error" in result) toast.error(result.error);
    });
  }

  if (showPortal) {
    return (
      <Button onClick={openPortal} disabled={pending}>
        {pending ? "Abrindo..." : "Gerenciar no Stripe"}
      </Button>
    );
  }

  if (!planId) return null;
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
      {disabled ? "Plano atual" : pending ? "Abrindo..." : `Assinar ${planId}`}
    </Button>
  );
}
