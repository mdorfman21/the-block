import { Component, type ErrorInfo, type ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Catches render-time errors anywhere below it and shows a friendly fallback
 * instead of a blank screen. Error boundaries must be class components.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[the-block] Unhandled error:', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.wrap} role="alert">
          <p className={styles.badge}>Error</p>
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.sub}>An unexpected error occurred. Reloading usually fixes it.</p>
          <button type="button" className={styles.btn} onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
