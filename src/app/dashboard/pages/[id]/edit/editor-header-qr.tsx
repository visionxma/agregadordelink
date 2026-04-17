"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeModal } from "@/components/qr-code-modal";

export function EditorHeaderQr({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/${slug}`
      : `/${slug}`;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        title="QR code"
      >
        <QrCode className="size-4" />
      </Button>
      <QRCodeModal
        open={open}
        onClose={() => setOpen(false)}
        url={url}
        title={title}
      />
    </>
  );
}
