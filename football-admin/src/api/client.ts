import axios from "axios"
import { formatError } from "../utils/formatError"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = formatError(err)
    return Promise.reject(new Error(msg))
  }
)