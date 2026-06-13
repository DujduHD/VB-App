/** Tauri invoke ve diğer kaynaklardan gelen hataları okunabilir metne çevirir. */
export function formatError(err: unknown, fallback: string): string {
  if (typeof err === "string" && err.trim()) return err;
  if (err instanceof Error && err.message.trim()) return err.message;
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    const msg = (err as { message: string }).message.trim();
    if (msg) return msg;
  }
  return fallback;
}
