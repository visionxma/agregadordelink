"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ImageCropDialog,
  type CropAspect,
} from "@/components/image-crop-dialog";

export function ImageUploadButton({
  onUploaded,
  label = "Fazer upload",
  variant = "outline",
  className,
  crop,
  accept = "image/jpeg,image/png,image/webp,image/gif",
}: {
  onUploaded: (url: string) => void;
  label?: string;
  variant?: "outline" | "default";
  className?: string;
  /** Quando definido, abre o editor de crop antes de enviar (só faz sentido pra imagem). */
  crop?: CropAspect;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erro no upload");
        return;
      }
      onUploaded(data.url);
      toast.success("Imagem enviada!");
    } catch {
      toast.error("Falha na conexão");
    } finally {
      setUploading(false);
    }
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Limpa o input pra permitir reselecionar o mesmo arquivo.
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;

    if (crop && file.type.startsWith("image/")) {
      setPendingFile(file);
      return;
    }

    await uploadFile(file);
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size="sm"
        className={className}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        {uploading ? "Enviando..." : label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {crop && pendingFile && (
        <ImageCropDialog
          file={pendingFile}
          aspect={crop}
          onCancel={() => setPendingFile(null)}
          onConfirm={async (processed) => {
            setPendingFile(null);
            await uploadFile(processed);
          }}
        />
      )}
    </>
  );
}
