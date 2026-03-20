import { useEffect, useMemo, useState } from 'react'
import logo from '../../assets/hero.png'
import { ROUTE_PATHS } from '../routes'
import { getAppNotice, getUserCredit } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import SideDrawer from '../common/SideDrawer'
import AppIcon from '../common/AppIcon'
import './notification.css'

function formatNoticeTime(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-GB', { hour12: false })
}

function NotificationPage({ navigate }) {
  const [session] = useState(() => getSession())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [credit, setCredit] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notices, setNotices] = useState([])

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [creditValue, noticeRows] = await Promise.all([
          getUserCredit(session.userId),
          getAppNotice(session.userId),
        ])
        setCredit(Number(creditValue || 0))
        setNotices(noticeRows)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to fetch notices.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  const latestNotice = useMemo(() => notices[0] || null, [notices])

  if (!session?.userId) return null

  return (
    <div className="notification-page">
      <header className="notification-topbar">
        <button type="button" className="notification-icon-btn" onClick={() => setDrawerOpen(true)}>
          ☰
        </button>
        <span className="notification-bell">🔔</span>
        <img src={logo} alt="POD" className="notification-logo" />
        <div className="notification-balance-card">
          <div className="notification-coin">₹</div>
          <div className="notification-balance-text">
            <small>Balance</small>
            <strong>{credit}/-</strong>
          </div>
        </div>
      </header>

      <main className="notification-content">
        {loading ? <p className="state-text">Loading notification...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        {!loading && !error ? (
          <section className="notice-card">
            <div className="notice-head">
              <h3>{latestNotice?.title || 'Notice'}</h3>
              <span>{formatNoticeTime(latestNotice?.created_at)}</span>
            </div>
            <p>{latestNotice?.description || 'No notice available.'}</p>
          </section>
        ) : null}
      </main>

      <nav className="bottom-nav">
        <button type="button" className="nav-item active" onClick={() => navigate(ROUTE_PATHS.home)}>
          <AppIcon name="home" className="nav-icon" />
          <span>Home</span>
        </button>
        <button type="button" className="nav-item" onClick={() => navigate(ROUTE_PATHS.play)}>
          <AppIcon name="sports_esports" className="nav-icon" />
          <span>Play</span>
        </button>
        <button type="button" className="nav-item" onClick={() => navigate(ROUTE_PATHS.wallet)}>
          <AppIcon name="account_balance_wallet" className="nav-icon" />
          <span>Wallet</span>
        </button>
        <button type="button" className="nav-item" onClick={() => navigate(ROUTE_PATHS.myGame)}>
          <AppIcon name="stadia_controller" className="nav-icon" />
          <span>My Game</span>
        </button>
      </nav>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigate={navigate}
        name={session?.name || 'User'}
        mobile={session?.mobileNum || '--'}
      />
    </div>
  )
}

export default NotificationPage
