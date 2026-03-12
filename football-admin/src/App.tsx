import { Navigate, Route, Routes } from "react-router-dom"
import SubscribersPage from "./pages/SubscribersPage"
import SubscriberDetailsPage from "./pages/SubscriberDetailsPage"

export default function App() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6">
          <div className="text-2xl font-semibold tracking-tight">Football Notifications Admin</div>
          <div className="text-sm text-slate-400">Gère les abonnés et leurs équipes (frontend only).</div>
        </div>

        <Routes>
          <Route path="/" element={<SubscribersPage />} />
          <Route path="/subscribers/:email" element={<SubscriberDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}