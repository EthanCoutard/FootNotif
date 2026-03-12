export function EmptyState(props: { title: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/20 px-4 py-6 text-center">
      <div className="text-sm font-semibold text-slate-200">{props.title}</div>
      {props.subtitle ? <div className="mt-1 text-sm text-slate-400">{props.subtitle}</div> : null}
    </div>
  )
}