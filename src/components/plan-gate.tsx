"use client";

import Link from "next/link";
import { Crown, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanTier } from "@/lib/db/schema";

// ─── Badges ──────────────────────────────────────────────────────────────────

export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="Disponível no plano Pro"
      className={`inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ${className}`}
    >
      <Star className="size-2.5 fill-amber-500 text-amber-500" />
      Pro
    </span>
  );
}

export function BusinessBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="Disponível no plano Business"
      className={`inline-flex items-center gap-0.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 ${className}`}
    >
      <Crown className="size-2.5 fill-purple-500 text-purple-500" />
      Business
    </span>
  );
}

// ─── Gate wrapper ─────────────────────────────────────────────────────────────

type RequiredPlan = "pro" | "business";

const PLAN_ORDER: Record<PlanTier, number> = { free: 0, pro: 1, business: 2 };

export function hasAccess(current: PlanTier, required: RequiredPlan) {
  return PLAN_ORDER[current] >= PLAN_ORDER[required];
}

export function PlanGate({
  required,
  currentPlan,
  label,
  description,
  children,
}: {
  required: RequiredPlan;
  currentPlan: PlanTier;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  if (hasAccess(currentPlan, required)) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-border bg-secondary/30">
      {/* Conteúdo bloqueado desfocado */}
      <div className="pointer-events-none select-none blur-[2px] opacity-40 p-4">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-[1px] p-4 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-background shadow-ios-sm border border-border">
          {required === "pro" ? (
            <Star className="size-5 fill-amber-400 text-amber-400" />
          ) : (
            <Crown className="size-5 fill-purple-500 text-purple-500" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold">{label}</p>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Disponível no plano{" "}
            <strong>{required === "pro" ? "Pro (R$29/mês)" : "Business (R$79/mês)"}</strong>
          </p>
        </div>
        <Button asChild size="sm" className="rounded-full px-5 text-xs h-8">
          <Link href="/dashboard/billing">
            {required === "pro" ? (
              <><Star className="mr-1.5 size-3 fill-current" /> Assinar Pro</>
            ) : (
              <><Crown className="mr-1.5 size-3 fill-current" /> Assinar Business</>
            )}
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Lock inline (para labels) ────────────────────────────────────────────────

export function LockedLabel({
  children,
  required,
  currentPlan,
}: {
  children: React.ReactNode;
  required: RequiredPlan;
  currentPlan: PlanTier;
}) {
  if (hasAccess(currentPlan, required)) return <>{children}</>;
  return (
    <span className="flex items-center gap-1.5">
      {children}
      {required === "pro" ? <ProBadge /> : <BusinessBadge />}
    </span>
  );
}
