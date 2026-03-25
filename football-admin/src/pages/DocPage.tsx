import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

export default function DocPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    console.log("Ready.")
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    }

    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  const handleFullscreen = () => {
    if (!containerRef.current) return
    containerRef.current.requestFullscreen?.()
  }

  const handleExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    }
  }

  return (
    <main className="mx-auto w-full max-w-12xl px-0 py-4">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Documentation de FootNotif ⚽📩</h1>
          <button
            type="button"
            onClick={handleFullscreen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition-colors hover:bg-slate-100"
            aria-label="Afficher la documentation en plein ecran"
            title="Plein ecran"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M8 3H3v5" />
              <path d="M16 3h5v5" />
              <path d="M8 21H3v-5" />
              <path d="M16 21h5v-5" />
            </svg>
          </button>
        </div>
        <div ref={containerRef} className="relative">
          {isFullscreen && (
            <button
              type="button"
              onClick={handleExitFullscreen}
              className="fixed right-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
              aria-label="Quitter le plein ecran"
              title="Quitter le plein ecran"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 8V3h5" />
                <path d="M21 8V3h-5" />
                <path d="M3 16v5h5" />
                <path d="M21 16v5h-5" />
              </svg>
            </button>
          )}
          <iframe
            ref={iframeRef}
            src="/doc.html"
            title="Documentation"
            className={isFullscreen ? "h-screen w-full rounded-none border-0" : "h-[65vh] w-full rounded-md border border-slate-200"}
          />
        </div>
        <div className="mt-5">
          <Link
            to="/"
            className="inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>
    </main>
  )
}
