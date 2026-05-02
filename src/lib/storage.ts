import type { FormFieldConfig } from "@/types/app";
import { STORAGE_BUCKET } from "@/lib/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function normalizeStorageSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildStoragePath(folder: string, fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  const baseName = lastDot >= 0 ? fileName.slice(0, lastDot) : fileName;
  const extension = lastDot >= 0 ? fileName.slice(lastDot).toLowerCase() : "";
  const normalizedFolder = folder
    .split("/")
    .map(normalizeStorageSegment)
    .filter(Boolean)
    .join("/");
  const normalizedBaseName = normalizeStorageSegment(baseName) || "fichier";

  return `${normalizedFolder}/${Date.now()}-${normalizedBaseName}${extension}`;
}

export function getStorageFieldKey(fields: ReadonlyArray<FormFieldConfig>) {
  return fields.find((field) => field.storageFolder)?.key ?? null;
}

export async function uploadFileToStorage({
  file,
  folder
}: {
  file: File;
  folder: string;
}) {
  const supabase = getSupabaseBrowserClient();
  const filePath = buildStoragePath(folder, file.name);
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) {
    throw error;
  }

  return filePath;
}

export async function getStorageSignedUrl(filePath: string, expiresIn = 300) {
  if (!filePath) {
    throw new Error("Aucun fichier n'est joint a cette fiche.");
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Impossible de generer le lien du fichier.");
  }

  return data.signedUrl;
}

export async function openStorageFile(filePath: string, expiresIn = 300) {
  const signedUrl = await getStorageSignedUrl(filePath, expiresIn);

  window.open(signedUrl, "_blank", "noopener,noreferrer");
}
