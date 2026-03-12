export function formatError(err: any): string {
  if (err instanceof Error && err.message) return err.message
  const msg = err?.response?.data?.detail
  if (typeof msg === "string" && msg.trim()) return msg
  const s = err?.message
  if (typeof s === "string" && s.trim()) return s
  return "Une erreur est survenue."
}