import type { ReactNode } from "react"
import { clsx } from "clsx"

export function Table(props: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("overflow-hidden rounded-2xl border border-slate-800", props.className)}>
      <table className="w-full table-auto">{props.children}</table>
    </div>
  )
}

export function Th(props: { children: ReactNode; className?: string }) {
  return (
    <th className={clsx("bg-slate-900/70 px-4 py-3 text-left text-xs font-semibold text-slate-300", props.className)}>
      {props.children}
    </th>
  )
}

export function Td(props: { children: ReactNode; className?: string }) {
  return <td className={clsx("px-4 py-3 text-sm text-slate-200", props.className)}>{props.children}</td>
}

export function Tr(props: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      onClick={props.onClick}
      className={clsx(
        "border-t border-slate-800 hover:bg-slate-900/40",
        props.onClick ? "cursor-pointer" : "",
        props.className
      )}
    >
      {props.children}
    </tr>
  )
}