import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"
import App from "./App"
import "./index.css"
import { queryClient } from "./utils/queryClient"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2500,
            style: { background: "#0b1220", color: "#e2e8f0", border: "1px solid #1e293b" }
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)