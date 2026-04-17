"use client";

import Link from "next/link";
import { useState } from "react";
import { BarChart3, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeModal } from "@/components/qr-code-modal";

export function PageCardActions({
  id,
  slug,
  title,
}: {
  id: string;
  slug: string;
  title: string;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/${slug}`
      : `/${slug}`;

  return (
    <>
      <div className="mt-4 flex gap-2">
        <Button asChild size="sm" className="flex-1">
          <Link href={`/dashboard/pages/${id}/edit`}>Editar</Link>
        </Button>
        <Button
          asChild
          size="icon"
          variant="outline"
          title="Analytics"
        >
          <Link href={`/dashboard/pages/${id}/analytics`}>
            <BarChart3 className="size-3.5" />
          </Link>
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setQrOpen(true)}
          title="QR code"
        >
          <QrCode className="size-3.5" />
        </Button>
        <Button asChild size="icon" variant="outline">
          <Link href={`/${slug}`} target="_blank">
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </div>
      <QRCodeModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        url={url}
        title={title}
      />
    </>
  );
}
