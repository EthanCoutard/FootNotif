import { Button } from "./Button"

export function ErrorState(props: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-900/50 bg-red-500/10 px-4 py-4">
      <div className="text-sm text-red-200">{props.message}</div>
      {props.onRetry ? (
        <div className="mt-3">
          <Button variant="secondary" onClick={props.onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  )
}