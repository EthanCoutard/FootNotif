import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { createSubscriber, deleteSubscriber, getSubscribers } from "../api/endpoints"
import type { Subscriber } from "../types/api"
import { Card, CardBody, CardHeader } from "../components/Card"
import { Table, Td, Th, Tr } from "../components/Table"
import { Input } from "../components/Input"
import { LoadingState } from "../components/LoadingState"
import { ErrorState } from "../components/ErrorState"
import { EmptyState } from "../components/EmptyState"
import { Button } from "../components/Button"
import { ConfirmDialog } from "../components/ConfirmDialog"

export default function SubscribersPage() {
  const nav = useNavigate()
  const qc = useQueryClient()

  const [q, setQ] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newFreq, setNewFreq] = useState<"DAILY" | "WEEKLY">("WEEKLY")

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null)

  const query = useQuery({
    queryKey: ["subscribers"],
    queryFn: getSubscribers
  })

  const createMut = useMutation({
    mutationFn: () => createSubscriber(newEmail.trim(), newFreq),
    onSuccess: () => {
      toast.success("Subscriber créé")
      setNewEmail("")
      setNewFreq("WEEKLY")
      qc.invalidateQueries({ queryKey: ["subscribers"] })
    },
    onError: (err) => toast.error((err as Error).message)
  })

  const deleteMut = useMutation({
    mutationFn: (email: string) => deleteSubscriber(email),
    onSuccess: () => {
      toast.success("Subscriber supprimé")
      qc.invalidateQueries({ queryKey: ["subscribers"] })
    },
    onError: (err) => toast.error((err as Error).message)
  })

  const filtered = useMemo(() => {
    const list = query.data ?? []
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter((x) => x.email.toLowerCase().includes(s) || (x.frequency ?? "").toLowerCase().includes(s))
  }, [query.data, q])

  const go = (email: string) => nav(`/subscribers/${encodeURIComponent(email)}`)

  return (
    <Card>
      <CardHeader
        title="Subscribers"
        subtitle="Liste des abonnés (click pour voir les détails)"
        right={
          <div className="flex w-full flex-col gap-2 sm:w-[760px] sm:flex-row sm:items-center">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search (email/frequency)..." />

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new email..."
                className="sm:w-[240px]"
              />

              <select
                value={newFreq}
                onChange={(e) => setNewFreq(e.target.value as any)}
                className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600"
              >
                <option value="WEEKLY">WEEKLY</option>
                <option value="DAILY">DAILY</option>
              </select>

              <Button onClick={() => createMut.mutate()} disabled={!newEmail.trim() || createMut.isPending}>
                {createMut.isPending ? "Creating..." : "Create"}
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  toast.dismiss()
                  query.refetch()
                }}
              >
                Refresh
              </Button>
            </div>
          </div>
        }
      />
      <CardBody>
        {query.isLoading ? <LoadingState label="Chargement des abonnés..." /> : null}

        {query.isError ? <ErrorState message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}

        {!query.isLoading && !query.isError && filtered.length === 0 ? (
          <EmptyState title="Aucun abonné" subtitle={q.trim() ? "Aucun résultat pour ta recherche." : "La liste est vide."} />
        ) : null}

        {!query.isLoading && !query.isError && filtered.length > 0 ? (
          <Table className="mt-2">
            <thead>
              <tr>
                <Th>Email</Th>
                <Th>Frequency</Th>
                <Th className="w-[220px]">Action</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: Subscriber) => (
                <Tr key={s.email} onClick={() => go(s.email)}>
                  <Td className="font-medium">{s.email}</Td>
                  <Td className="text-slate-300">{String(s.frequency ?? "")}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          go(s.email)
                        }}
                      >
                        View
                      </Button>

                      <Button
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEmailToDelete(s.email)
                          setConfirmOpen(true)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : null}
      </CardBody>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete subscriber?"
        description={emailToDelete ? `Supprimer ${emailToDelete} (et ses subscriptions) ?` : ""}
        confirmText={deleteMut.isPending ? "Deleting..." : "Delete"}
        danger
        loading={deleteMut.isPending}
        onCancel={() => {
          setConfirmOpen(false)
          setEmailToDelete(null)
        }}
        onConfirm={() => {
          if (!emailToDelete) return
          deleteMut.mutate(emailToDelete)
          setConfirmOpen(false)
          setEmailToDelete(null)
        }}
      />
    </Card>
  )
}