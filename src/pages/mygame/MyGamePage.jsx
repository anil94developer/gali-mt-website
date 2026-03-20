import { useEffect, useMemo, useState } from 'react'
import logo from '../../assets/hero.png'
import { ROUTE_PATHS } from '../routes'
import { getMarketList } from '../../services/playService'
import { getUserCredit } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import { getPendingBetHistory } from '../../services/historyService'
import SideDrawer from '../common/SideDrawer'
import AppIcon from '../common/AppIcon'
import './mygame.css'

function MyGamePage({ navigate, pageTitle = 'History', initialTab = 'pending' }) {
  const [session] = useState(() => getSession())
  const [loading, setLoading] = useState(true)
  const [reloadTick, setReloadTick] = useState(0)
  const [error, setError] = useState('')
  const [credit, setCredit] = useState(0)
  const [markets, setMarkets] = useState([])
  const [selectedMarket, setSelectedMarket] = useState('all')
  const [activeTab, setActiveTab] = useState(initialTab)
  const [historyRows, setHistoryRows] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadInitialData = async () => {
      try {
        const [marketData, creditData] = await Promise.all([
          getMarketList(session.userId),
          getUserCredit(session.userId),
        ])
        setMarkets(marketData)
        setCredit(Number(creditData || 0))
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to fetch market list.')
      }
    }

    loadInitialData()
  }, [navigate, session?.userId])

  useEffect(() => {
    if (!session?.userId) return

    const loadHistory = async () => {
      setLoading(true)
      setError('')
      try {
        // Using pending-bet-history endpoint for both tabs until a dedicated declared API is provided.
        const result = await getPendingBetHistory(session.userId, selectedMarket, 1)
        setHistoryRows(result.rows)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to fetch history.')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [activeTab, reloadTick, selectedMarket, session?.userId])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const marketOptions = useMemo(
    () => [{ id: 'all', name: 'All Market' }, ...markets.map((item) => ({ id: item.id, name: item.name }))],
    [markets]
  )

  if (!session?.userId) return null

  return (
    <div className="history-page">
      <header className="history-topbar">
        <button type="button" className="history-icon-btn" onClick={() => setDrawerOpen(true)}>
          ☰
        </button>
        <span className="history-bell" onClick={() => navigate(ROUTE_PATHS.notification)}>
          🔔
        </span>
        <img src={logo} alt="POD" className="history-logo" />
        <div className="history-balance-card">
          <div className="history-coin">₹</div>
          <div className="history-balance-text">
            <small>Balance</small>
            <strong>{credit}/-</strong>
          </div>
        </div>
      </header>

      <div className="history-title">{pageTitle}</div>

      <main className="history-content">
        <section className="market-filter">
          <select value={selectedMarket} onChange={(event) => setSelectedMarket(event.target.value)}>
            {marketOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setReloadTick((prev) => prev + 1)}>
            Reload
          </button>
        </section>

        <section className="tab-info-wrap">
          <div className="history-tabs">
            <button
              type="button"
              className={activeTab === 'pending' ? 'active' : ''}
              onClick={() => setActiveTab('pending')}
            >
              Pending Bet
            </button>
            <button
              type="button"
              className={activeTab === 'declared' ? 'active' : ''}
              onClick={() => setActiveTab('declared')}
            >
              Declared Bet
            </button>
          </div>
          <div className="history-tab-note">
            <p>जिन गेम का रिजल्ट नही आया वो PENDING BET में दिखेंगी।</p>
            <p>जिन गेम का रिजल्ट आ गया है वो DECLARED BET में दिखेंगी।</p>
          </div>
        </section>

        {loading ? <p className="state-text">Loading history...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        {!loading && !error ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Number</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.datetime || row.date || '--'}</td>
                    <td>{row.table_id || '--'}</td>
                    <td>{row.bettype || '--'}</td>
                    <td>{row.pred_num || '--'}</td>
                    <td>{row.tr_value ?? '--'}</td>
                  </tr>
                ))}
                {historyRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      No history found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </main>

      <nav className="bottom-nav">
        <button type="button" className="nav-item" onClick={() => navigate(ROUTE_PATHS.home)}>
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
        <button type="button" className="nav-item active">
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

export default MyGamePage
