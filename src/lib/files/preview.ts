export function getFileExtension(filePath: string) {
  return filePath.split("?")[0]?.split(".").pop()?.toLowerCase() ?? "";
}

export function getFileNameFromPath(filePath: string) {
  const segment = filePath.split("/").pop() ?? filePath;
  const dashIndex = segment.indexOf("-");

  if (dashIndex > 0 && /^\d+$/.test(segment.slice(0, dashIndex))) {
    return segment.slice(dashIndex + 1);
  }

  return segment;
}

export function canPreviewInline(filePath: string) {
  return ["pdf", "png", "jpg", "jpeg", "gif", "webp"].includes(getFileExtension(filePath));
}
