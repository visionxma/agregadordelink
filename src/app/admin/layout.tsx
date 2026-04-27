import { db } from "@/lib/db";
import { abuseReport } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { requireAdmin } from "./lib";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  const [pending] = await db
    .select({ c: count() })
    .from(abuseReport)
    .where(eq(abuseReport.status, "pending"));

  return (
    <div className="ambient-bg-subtle min-h-screen text-foreground">
      <AdminNav
        adminName={admin.name}
        adminEmail={admin.email}
        adminImage={admin.image}
        abusePending={pending?.c ?? 0}
      />
      <div className="lg:pl-60">
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
