import { clsx } from "clsx"
import type { ButtonHTMLAttributes } from "react"

type Variant = "primary" | "secondary" | "danger" | "ghost"

export function Button({
  variant = "primary",
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
  const styles: Record<Variant, string> = {
    primary: "bg-slate-100 text-slate-900 hover:bg-white",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700",
    danger: "bg-red-500/90 text-white hover:bg-red-500",
    ghost: "bg-transparent text-slate-200 hover:bg-slate-800/60 border border-slate-800"
  }

  return <button className={clsx(base, styles[variant], className)} {...rest} />
}