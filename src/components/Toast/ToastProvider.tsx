import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ToastContext, type ToastApi, type ToastType } from './ToastContext'
import styles from './Toast.module.css'

interface Toast {
  id: string
  message: string
  type: ToastType
}

const AUTO_DISMISS_MS = 3600

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, AUTO_DISMISS_MS)
  }, [])

  const api = useMemo<ToastApi>(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.viewport} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            <ToastIcon type={t.type} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastIcon({ type }: { type: ToastType }) {
  return (
    <svg className={styles.icon} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="9" className={styles.iconBg} />
      {type === 'success' && (
        <path
          d="M6 10.5l2.5 2.5L14 7"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {type === 'error' && (
        <path d="M10 5.5v5M10 13.5v.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      )}
      {type === 'info' && (
        <path d="M10 9v5M10 6v.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  )
}
