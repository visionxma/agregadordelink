import { createClient } from "@supabase/supabase-js";

// Cliente de Storage — usa service role key pra bypass RLS no upload server-side
// (validação de auth é feita no server action antes de chamar aqui)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const BUCKET = "linkhub-uploads";

export function getStorageClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Supabase Storage não configurado. Adicione NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env"
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export function isStorageConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

let bucketEnsured = false;

async function ensureBucketExists(
  client: ReturnType<typeof getStorageClient>
): Promise<void> {
  if (bucketEnsured) return;

  const { data: buckets, error: listError } =
    await client.storage.listBuckets();
  if (listError) {
    throw new Error(`Falha ao listar buckets: ${listError.message}`);
  }

  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error: createError } = await client.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_IMAGE_SIZE,
      allowedMimeTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_FONT_TYPES],
    });
    if (createError && !/already exists/i.test(createError.message)) {
      throw new Error(`Falha ao criar bucket: ${createError.message}`);
    }
  }

  bucketEnsured = true;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_FONT_TYPES = [
  "font/ttf",
  "font/otf",
  "font/woff",
  "font/woff2",
  "application/font-woff",
  "application/font-woff2",
  "application/x-font-ttf",
  "application/x-font-otf",
  "application/octet-stream", // browser fallback pra ttf
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FONT_SIZE = 2 * 1024 * 1024; // 2MB

export async function uploadImage(
  userId: string,
  file: {
    name: string;
    type: string;
    size: number;
    arrayBuffer: () => Promise<ArrayBuffer>;
  }
): Promise<{ url: string } | { error: string }> {
  if (!isStorageConfigured()) {
    return { error: "Upload não configurado. Avise o admin." };
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isFont =
    ALLOWED_FONT_TYPES.includes(file.type) ||
    (file.type === "application/octet-stream" &&
      ["ttf", "otf", "woff", "woff2"].includes(ext ?? ""));

  if (!isImage && !isFont) {
    return { error: "Tipo de arquivo não suportado." };
  }
  const maxSize = isFont ? MAX_FONT_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return {
      error: `Arquivo muito grande. Máximo ${isFont ? "2MB" : "5MB"}.`,
    };
  }

  const client = getStorageClient();
  const finalExt = ext ?? "jpg";
  const key = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${finalExt}`;

  try {
    await ensureBucketExists(client);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Falha ao preparar storage.",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let { error } = await client.storage.from(BUCKET).upload(key, buffer, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error && /bucket not found/i.test(error.message)) {
    bucketEnsured = false;
    try {
      await ensureBucketExists(client);
    } catch (err) {
      return {
        error:
          err instanceof Error ? err.message : "Falha ao preparar storage.",
      };
    }
    const retry = await client.storage.from(BUCKET).upload(key, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    error = retry.error;
  }

  if (error) {
    return { error: `Falha no upload: ${error.message}` };
  }

  const { data } = client.storage.from(BUCKET).getPublicUrl(key);
  return { url: data.publicUrl };
}
