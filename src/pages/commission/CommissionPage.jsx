import { useEffect, useState } from 'react'
import logo from '../../assets/hero.png'
import { ROUTE_PATHS } from '../routes'
import { getSession } from '../../services/sessionService'
import { getUserCredit } from '../../services/homeService'
import { getManageCommission } from '../../services/commissionService'
import SideDrawer from '../common/SideDrawer'
import AppIcon from '../common/AppIcon'
import './commission.css'

function CommissionPage({ navigate }) {
  const [session] = useState(() => getSession())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [credit, setCredit] = useState(0)
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [creditValue, commissionData] = await Promise.all([
          getUserCredit(session.userId),
          getManageCommission(session.userId),
        ])
        setCredit(Number(creditValue || 0))
        setRows(commissionData.rows)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to load commission list.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  if (!session?.userId) return null

  return (
    <div className="commission-page">
      <header className="commission-topbar">
        <button type="button" className="commission-icon-btn" onClick={() => setDrawerOpen(true)}>
          ☰
        </button>
        <span className="commission-bell" onClick={() => navigate(ROUTE_PATHS.notification)}>
          🔔
        </span>
        <img src={logo} alt="POD" className="commission-logo" />
        <div className="commission-balance-card">
          <div className="commission-coin">₹</div>
          <div className="commission-balance-text">
            <small>Balance</small>
            <strong>{credit}/-</strong>
          </div>
        </div>
      </header>

      <main className="commission-content">
        <h2 className="commission-title">Commission List</h2>

        {loading ? <p className="state-text">Loading commission data...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        {!loading && !error ? (
          <div className="commission-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Commission Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      No data available or something went wrong.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={row.id || `${row.date || 'd'}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.date || row.created_at || '--'}</td>
                      <td>{row.market_id || row.user_name || '--'}</td>
                      <td>{row.commission || row.amount || row.tr_value || '--'}</td>
                    </tr>
                  ))
                )}
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
        <button type="button" className="nav-item active" onClick={() => navigate(ROUTE_PATHS.myGame)}>
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

export default CommissionPage
