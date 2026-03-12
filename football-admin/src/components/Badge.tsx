import { clsx } from "clsx"

export function Badge(props: { children: string; tone?: "neutral" | "blue" | "green" }) {
  const tone = props.tone ?? "neutral"
  const styles =
    tone === "green"
      ? "border-emerald-900/60 bg-emerald-500/10 text-emerald-200"
      : tone === "blue"
      ? "border-sky-900/60 bg-sky-500/10 text-sky-200"
      : "border-slate-700 bg-slate-800/50 text-slate-200"
  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs", styles)}>
      {props.children}
    </span>
  )
}