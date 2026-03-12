export function LoadingState(props: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/30 px-4 py-4">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-slate-200" />
      <div className="text-sm text-slate-300">{props.label ?? "Chargement..."}</div>
    </div>
  )
}