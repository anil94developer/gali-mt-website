import { useEffect, useState } from 'react'
import logo from '../../assets/hero.png'
import { ROUTE_PATHS } from '../routes'
import { getSession } from '../../services/sessionService'
import { getUserCredit } from '../../services/homeService'
import { getReferList } from '../../services/referService'
import SideDrawer from '../common/SideDrawer'
import AppIcon from '../common/AppIcon'
import './refer.css'

function ReferPage({ navigate }) {
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
        const [creditValue, referData] = await Promise.all([
          getUserCredit(session.userId),
          getReferList(session.userId),
        ])
        setCredit(Number(creditValue || 0))
        setRows(referData.rows)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to load refer list.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  if (!session?.userId) return null

  return (
    <div className="refer-page">
      <header className="refer-topbar">
        <button type="button" className="refer-icon-btn" onClick={() => setDrawerOpen(true)}>
          ☰
        </button>
        <span className="refer-bell" onClick={() => navigate(ROUTE_PATHS.notification)}>
          🔔
        </span>
        <img src={logo} alt="POD" className="refer-logo" />
        <div className="refer-balance-card">
          <div className="refer-coin">₹</div>
          <div className="refer-balance-text">
            <small>Balance</small>
            <strong>{credit}/-</strong>
          </div>
        </div>
      </header>

      <main className="refer-content">
        <h2 className="refer-title">My Refer List</h2>

        {loading ? <p className="state-text">Loading refer list...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        {!loading && !error ? (
          <div className="refer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      Data Not Found
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={row.id || `${row.name || 'n'}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.name || row.FullName || '--'}</td>
                      <td>{row.mob || row.mobile || '--'}</td>
                      <td>{row.date || row.created_at || '--'}</td>
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

export default ReferPage
