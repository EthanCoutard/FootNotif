import { clsx } from "clsx"
import type { ReactNode } from "react"

export function Card(props: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm",
        props.className
      )}
    >
      {props.children}
    </div>
  )
}

export function CardHeader(props: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-lg font-semibold">{props.title}</div>
        {props.subtitle ? <div className="text-sm text-slate-400">{props.subtitle}</div> : null}
      </div>
      {props.right ? <div className="flex items-center gap-2">{props.right}</div> : null}
    </div>
  )
}

export function CardBody(props: { children: ReactNode; className?: string }) {
  return <div className={clsx("px-5 py-4", props.className)}>{props.children}</div>
}