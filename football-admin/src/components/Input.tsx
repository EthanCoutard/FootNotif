import { clsx } from "clsx"
import type { InputHTMLAttributes } from "react"

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-slate-600",
        className
      )}
      {...rest}
    />
  )
}