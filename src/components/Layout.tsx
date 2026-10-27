import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <Header />
      <main id="main" className={`container ${styles.main}`}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
