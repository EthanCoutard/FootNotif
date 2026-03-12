import { Button } from "./Button"
import { Card } from "./Card"

export function ConfirmDialog(props: {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
  loading?: boolean
}) {
  if (!props.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <Card className="w-full max-w-md">
        <div className="px-5 py-4">
          <div className="text-lg font-semibold">{props.title}</div>
          {props.description ? <div className="mt-2 text-sm text-slate-400">{props.description}</div> : null}
          <div className="mt-5 flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={props.onCancel} disabled={props.loading}>
              Cancel
            </Button>
            <Button
              variant={props.danger ? "danger" : "primary"}
              onClick={props.onConfirm}
              disabled={props.loading}
            >
              {props.confirmText ?? "Confirm"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}