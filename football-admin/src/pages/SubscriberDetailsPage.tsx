import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { addSubscription, getSubscriberTeams, getTeamByName, removeSubscription, searchTeams } from "../api/endpoints"
import type { Team } from "../types/api"
import { Card, CardBody, CardHeader } from "../components/Card"
import { Badge } from "../components/Badge"
import { Button } from "../components/Button"
import { ConfirmDialog } from "../components/ConfirmDialog"
import { EmptyState } from "../components/EmptyState"
import { ErrorState } from "../components/ErrorState"
import { Input } from "../components/Input"
import { LoadingState } from "../components/LoadingState"
import { Table, Td, Th, Tr } from "../components/Table"
import { debounce } from "../utils/debounce"


export default function SubscriberDetailsPage() {
  const nav = useNavigate()
  const params = useParams()
  const emailParam = params.email ? decodeURIComponent(params.email) : ""
  const qc = useQueryClient()

  const subsQuery = useQuery({
    queryKey: ["subscribers"],
    queryFn: async () => {
      const { getSubscribers } = await import("../api/endpoints")
      return getSubscribers()
    }
  })

  const subscriber = useMemo(() => {
    const list = subsQuery.data ?? []
    return list.find((x) => x.email === emailParam) ?? null
  }, [subsQuery.data, emailParam])

  const teamsQuery = useQuery({
    queryKey: ["subscriberTeams", emailParam],
    queryFn: () => getSubscriberTeams(emailParam),
    enabled: !!emailParam
  })

  const subscribedNames = useMemo(() => teamsQuery.data?.teamNames ?? [], [teamsQuery.data])

    const crestsQuery = useQuery({
    queryKey: ["teamCrests", subscribedNames],
    queryFn: async () => {
      const entries = await Promise.all(
        subscribedNames.map(async (name) => {
          const t = await getTeamByName(name)
          return [name, t?.crest ?? null] as const
        })
      )
      return Object.fromEntries(entries) as Record<string, string | null>
    },
    enabled: subscribedNames.length > 0
  })

  const crestMap = crestsQuery.data ?? {}

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [teamToRemove, setTeamToRemove] = useState<string | null>(null)

  const removeMut = useMutation({
    mutationFn: async (teamName: string) => removeSubscription(emailParam, teamName),
    onMutate: async (teamName) => {
      await qc.cancelQueries({ queryKey: ["subscriberTeams", emailParam] })
      const prev = qc.getQueryData<{ teamNames: string[] }>(["subscriberTeams", emailParam]) ?? { teamNames: [] }
      qc.setQueryData(["subscriberTeams", emailParam], { teamNames: prev.teamNames.filter((n) => n !== teamName) })
      return { prev }
    },
    onError: (err, _teamName, ctx) => {
      if (ctx?.prev) qc.setQueryData(["subscriberTeams", emailParam], ctx.prev)
      toast.error((err as Error).message)
    },
    onSuccess: () => {
      toast.success("Subscription removed")
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["subscriberTeams", emailParam] })
    }
  })

  const [search, setSearch] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [results, setResults] = useState<Team[]>([])
  const [selected, setSelected] = useState<Team | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement | null>(null)

  const doSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        const s = q.trim()
        if (!s) {
          setResults([])
          setSearchError(null)
          setSearchLoading(false)
          return
        }
        setSearchLoading(true)
        setSearchError(null)
        try {
          const r = await searchTeams(s)
          setResults(r)
        } catch (e: any) {
          setSearchError(e?.message ?? "Search failed")
          setResults([])
        } finally {
          setSearchLoading(false)
        }
      }, 300),
    []
  )

  useEffect(() => {
    doSearch(search)
  }, [search, doSearch])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const el = boxRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const existingNames = useMemo(() => new Set(subscribedNames), [subscribedNames])

  const filteredResults = useMemo(() => results.filter((t) => !existingNames.has(t.name)), [results, existingNames])

  const addMut = useMutation({
    mutationFn: async (teamName: string) => addSubscription(emailParam, teamName),
    onError: (err) => toast.error((err as Error).message),
    onSuccess: () => {
      toast.success("Team added")
      setSearch("")
      setResults([])
      setSelected(null)
      setDropdownOpen(false)
      qc.invalidateQueries({ queryKey: ["subscriberTeams", emailParam] })
    }
  })

  const canValidate = !!selected && !addMut.isPending

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Subscriber details"
          subtitle="Gère les équipes de cet abonné"
          right={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => nav("/")}>
                Back
              </Button>
            </div>
          }
        />
        <CardBody>
          {!emailParam ? <ErrorState message="Email manquant dans l’URL." /> : null}

          {emailParam ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-base font-semibold">{emailParam}</div>
                <div className="mt-1 text-sm text-slate-400">Ajoute/retire des abonnements d’équipe.</div>
              </div>

              <div className="flex items-center gap-2">
                <Badge tone={subscriber?.frequency === "DAILY" ? "green" : "blue"}>
                  {subscriber?.frequency ? String(subscriber.frequency) : "UNKNOWN"}
                </Badge>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Add a team" subtitle="Search + select + validate (1 équipe à la fois)" />
        <CardBody>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full" ref={boxRef}>
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setDropdownOpen(true)
                }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search teams..."
              />

              {dropdownOpen ? (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg">
                  <div className="px-3 py-2 text-xs text-slate-400">
                    {searchLoading ? "Searching..." : searchError ? "Error" : "Results"}
                  </div>

                  {searchError ? <div className="px-3 pb-3 text-sm text-red-200">{searchError}</div> : null}

                  {!searchLoading && !searchError && search.trim() && filteredResults.length === 0 ? (
                    <div className="px-3 pb-3 text-sm text-slate-400">No teams found (or already subscribed).</div>
                  ) : null}

                  <div className="max-h-72 overflow-auto">
                    {filteredResults.map((t) => {
                      const isSel = selected?.name === t.name
                      return (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => {
                            setSelected(t)
                            setDropdownOpen(false)
                          }}
                          className={[
                            "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition",
                            isSel ? "bg-slate-900/70" : "hover:bg-slate-900/40"
                          ].join(" ")}
                        >
                          <div className="h-7 w-7 overflow-hidden rounded-lg bg-slate-900">
                            {t.crest ? (
                              <img src={t.crest} alt="" className="h-full w-full object-contain" />
                            ) : (
                              <div className="h-full w-full" />
                            )}
                          </div>
                          <div className="flex-1 text-slate-200">{t.name}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <Button
              className="sm:w-[140px]"
              onClick={() => {
                if (!selected) return
                addMut.mutate(selected.name)
              }}
              disabled={!canValidate}
            >
              {addMut.isPending ? "Adding..." : "Validate"}
            </Button>
          </div>

          {selected ? (
            <div className="mt-3 text-sm text-slate-300">
              Selected: <span className="font-semibold">{selected.name}</span>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Subscribed teams" subtitle="Liste des équipes abonnés + remove" />
        <CardBody>
          {teamsQuery.isLoading ? <LoadingState label="Chargement des équipes..." /> : null}

          {teamsQuery.isError ? (
            <ErrorState message={(teamsQuery.error as Error).message} onRetry={() => teamsQuery.refetch()} />
          ) : null}

          {!teamsQuery.isLoading && !teamsQuery.isError && subscribedNames.length === 0 ? (
            <EmptyState title="Aucune équipe" subtitle="Cet abonné n’a encore aucun abonnement." />
          ) : null}

          {!teamsQuery.isLoading && !teamsQuery.isError && subscribedNames.length > 0 ? (
            <Table className="mt-2">
              <thead>
                <tr>
                  <Th className="w-[90px]">Logo</Th>
                  <Th>Team</Th>
                  <Th className="w-[140px]">Action</Th>
                </tr>
              </thead>
              <tbody>
                {subscribedNames.map((name) => (
                  <Tr key={name}>
                    <Td>
                      <div className="h-9 w-9 overflow-hidden rounded-xl bg-slate-900">
                        {crestMap[name] ? (
                          <img src={crestMap[name]!} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                            —
                          </div>
                        )}
                      </div>
                    </Td>
                    <Td className="font-medium">{name}</Td>
                    <Td>
                      <Button
                        variant="danger"
                        onClick={() => {
                          setTeamToRemove(name)
                          setConfirmOpen(true)
                        }}
                        disabled={removeMut.isPending}
                      >
                        Remove
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          ) : null}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove subscription?"
        description={teamToRemove ? `Retirer "${teamToRemove}" pour ${emailParam} ?` : ""}
        confirmText={removeMut.isPending ? "Removing..." : "Remove"}
        danger
        loading={removeMut.isPending}
        onCancel={() => {
          setConfirmOpen(false)
          setTeamToRemove(null)
        }}
        onConfirm={() => {
          if (!teamToRemove) return
          removeMut.mutate(teamToRemove)
          setConfirmOpen(false)
          setTeamToRemove(null)
        }}
      />
    </div>
  )
}