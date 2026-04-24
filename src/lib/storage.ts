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
  const normalizedBaseName = normalizeStorageSegment(baseName) || "file";

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

export async function openStorageFile(filePath: string, expiresIn = 60) {
  if (!filePath) {
    throw new Error("No file is attached to this record yet.");
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Unable to generate a download link.");
  }

  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}
