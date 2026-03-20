import { useEffect, useMemo, useState } from 'react'
import logo from '../../assets/hero.png'
import { ROUTE_PATHS } from '../routes'
import { getAppNotice, getHelpNumber, getHomeDashboard, getUserCredit, getUserProfile } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import SideDrawer from '../common/SideDrawer'
import AppIcon from '../common/AppIcon'
import './home.css'

function HomePage({ navigate }) {
  const [session] = useState(() => getSession())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [markets, setMarkets] = useState([])
  const [credit, setCredit] = useState(0)
  const [notice, setNotice] = useState('')
  const [help, setHelp] = useState(null)

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const [profileData, dashboardData, creditData, noticeData, helpData] = await Promise.all([
          getUserProfile(session.userId),
          getHomeDashboard(session.userId),
          getUserCredit(session.userId),
          getAppNotice(session.userId),
          getHelpNumber(),
        ])

        setProfile(profileData)
        setMarkets(Array.isArray(dashboardData.data) ? dashboardData.data : [])
        setCredit(Number(creditData || dashboardData.user_balance || 0))
        setNotice(noticeData[0]?.short_description || noticeData[0]?.description || '')
        setHelp(helpData)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to fetch home data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  const helpNumber = useMemo(
    () => profile?.genral_setting_whatsapp || help?.help_line_number || '+91 9257191421',
    [help?.help_line_number, profile?.genral_setting_whatsapp]
  )
  const todayText = useMemo(() => {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yyyy = String(today.getFullYear())
    return `${dd}-${mm}-${yyyy}`
  }, [])

  if (!session?.userId) return null

  return (
    <div className="home-page">
      <header className="home-topbar">
        <button className="menu-btn" type="button" onClick={() => setDrawerOpen(true)}>
          <AppIcon name="menu" />
        </button>
        <button className="home-bell-btn" type="button" onClick={() => navigate(ROUTE_PATHS.notification)}>
          <AppIcon name="notifications" />
        </button>
        <img src={logo} alt="POD" className="top-logo" />
        <div className="balance-card">
          <div className="coin">₹</div>
          <div className="balance-text">
            <small>Balance</small>
            <strong>{credit}/-</strong>
          </div>
        </div>
      </header>

      <main className="home-content">
        {loading ? <p className="state-text">Loading home data...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        {!loading && !error ? (
          <section className="hero-result-card">
            <div className="hero-date">Date: {todayText}</div>
            <div className="hero-body">
              <h4>{notice || 'Not Available'}</h4>
              <h4>Result Not Available</h4>
            </div>
            <button
              type="button"
              className="share-earn-btn"
              onClick={() => navigate(ROUTE_PATHS.refer)}
            >
              शेयर 🔗 SHARE &amp; EARN
            </button>
          </section>
        ) : null}

        <div className="live-strip">🔥 LIVE RESULT OF {todayText}</div>

        {!loading &&
          !error &&
          markets.map((item) => (
            <section key={item.market_id} className="market-card">
              <h3>{item.market_name}</h3>
              <p className="result-time">
                Result At <strong>{item.resultTime || '--'}</strong>
              </p>
              <div className="result-head">
                <span>Previous Result</span>
                <span>Today Result</span>
              </div>
              <div className="result-values">
                <span>{item.market_result_previous_day || '--'}</span>
                <span>{item.market_result || '--'}</span>
              </div>
            </section>
          ))}
      </main>

      <nav className="bottom-nav">
        <button type="button" className="nav-item active">
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
        name={profile?.name || session.name || 'User'}
        mobile={profile?.mob || session.mobileNum || '--'}
        refCode={profile?.refCode || '--'}
        helpNumber={helpNumber}
      />
    </div>
  )
}

export default HomePage
