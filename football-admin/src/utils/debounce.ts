export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delayMs: number
) {
  let t: number | undefined
  return (...args: TArgs) => {
    if (t) window.clearTimeout(t)
    t = window.setTimeout(() => fn(...args), delayMs)
  }
}