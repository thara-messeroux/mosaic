import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

// Minimal toast system (replaces the reference's sonner dependency).
// Messages auto-dismiss after a couple of seconds.

interface ToastItem {
  id: number
  title: string
  description?: string
}

type ShowToast = (t: { title: string; description?: string }) => void

const ToastContext = createContext<ShowToast>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const toast = useCallback<ShowToast>((t) => {
    const id = ++idRef.current
    setItems((prev) => [...prev, { ...t, id }])
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 2600)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-wrap" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className="toast">
            <p className="toast-title">{item.title}</p>
            {item.description && <p className="toast-desc">{item.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
