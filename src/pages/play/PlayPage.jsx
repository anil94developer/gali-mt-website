import { useEffect, useState } from 'react'
import logo from '../../assets/hero.png'
import { ROUTE_PATHS } from '../routes'
import { getMarketList } from '../../services/playService'
import { getUserCredit } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import SideDrawer from '../common/SideDrawer'
import AppIcon from '../common/AppIcon'
import './play.css'

function PlayPage({ navigate }) {
  const [session] = useState(() => getSession())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markets, setMarkets] = useState([])
  const [credit, setCredit] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const [marketData, creditData] = await Promise.all([
          getMarketList(session.userId),
          getUserCredit(session.userId),
        ])

        setMarkets(marketData)
        setCredit(Number(creditData || 0))
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to load play data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  if (!session?.userId) return null

  const openMarketPlay = (market) => {
    if (String(market.is_play) !== '1') return
    sessionStorage.setItem('selected_market', JSON.stringify(market))
    navigate(ROUTE_PATHS.playMarket)
  }

  return (
    <div className="play-page">
      <header className="play-topbar">
        <button type="button" className="play-icon-btn" onClick={() => setDrawerOpen(true)}>
          ☰
        </button>
        <span className="play-bell" onClick={() => navigate(ROUTE_PATHS.notification)}>
          🔔
        </span>
        <img src={logo} alt="POD" className="play-logo" />
        <div className="play-balance-card">
          <div className="play-coin">₹</div>
          <div className="play-balance-text">
            <small>Balance</small>
            <strong>{credit}/-</strong>
          </div>
        </div>
      </header>

      <main className="play-content">
        <h2 className="all-games-title">All Games</h2>

        {loading ? <p className="state-text">Loading market list...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        {!loading && !error ? (
          <div className="games-grid">
            {markets.map((market) => {
              const canPlay = String(market.is_play) === '1'
              return (
                <article key={market.id} className="game-card">
                  <div className="clock-box">⏰</div>
                  <div className="game-info">
                    <h3>{market.name}</h3>
                    <p>
                      {market.open_time} - {market.time}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`game-action ${canPlay ? 'play' : 'timeout'}`}
                    onClick={() => openMarketPlay(market)}
                  >
                    {canPlay ? 'Play Games' : 'Time Out'}
                  </button>
                </article>
              )
            })}
          </div>
        ) : null}
      </main>

      <nav className="bottom-nav">
        <button type="button" className="nav-item" onClick={() => navigate(ROUTE_PATHS.home)}>
          <AppIcon name="home" className="nav-icon" />
          <span>Home</span>
        </button>
        <button type="button" className="nav-item active">
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

export default PlayPage
