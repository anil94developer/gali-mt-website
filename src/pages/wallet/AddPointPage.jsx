import { useEffect, useState } from 'react'
import logo from '../../assets/hero.png'
import { ROUTE_PATHS } from '../routes'
import { getSession } from '../../services/sessionService'
import { getAppManager } from '../../services/walletService'
import { getUserCredit } from '../../services/homeService'
import SideDrawer from '../common/SideDrawer'
import MessageDialog from '../common/MessageDialog'
import { APP_CONFIG } from '../../config/config'
import AppIcon from '../common/AppIcon'
import './addPoint.css'

const sampleWalletRows = [
  { id: 1, mode: 'Game Bet DISAWAR', date: '18/3/2026, 11:44:56 pm', points: 10, closing: 15, status: 'Success' },
  { id: 2, mode: 'Game Bet DISAWAR', date: '18/3/2026, 11:42:25 pm', points: 20, closing: 25, status: 'Success' },
  { id: 3, mode: 'Game Bet DISAWAR', date: '18/3/2026, 11:42:12 pm', points: 40, closing: 45, status: 'Success' },
  { id: 4, mode: 'Game Bet DISAWAR', date: '18/3/2026, 11:41:08 pm', points: 10, closing: 85, status: 'Success' },
]

function AddPointPage({ navigate }) {
  const [session] = useState(() => getSession())
  const [amount, setAmount] = useState('')
  const [credit, setCredit] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '' })

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [, creditValue] = await Promise.all([
          getAppManager(session.userId),
          getUserCredit(session.userId),
        ])
        setCredit(Number(creditValue || 0))
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to load wallet data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  const onAddPoints = () => {
    if (!amount || Number(amount) <= 0) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Please enter valid amount.',
      })
      return
    }

    const name = encodeURIComponent(session?.name || 'Test')
    const userid = encodeURIComponent(String(session?.userId || ''))
    const contact = encodeURIComponent(session?.mobileNum || '')
    const finalAmount = encodeURIComponent(String(amount))
    const getaway = 'razorpay'
    const url = `${APP_CONFIG.paymentGatewayUrl}?name=${name}&userid=${userid}&amount=${finalAmount}&contact=${contact}&getaway=${getaway}`
    window.location.href = url
  }

  if (!session?.userId) return null

  return (
    <div className="add-point-page">
      <header className="addp-topbar">
        <button type="button" className="addp-icon-btn" onClick={() => setDrawerOpen(true)}>
          ☰
        </button>
        <span className="addp-bell" onClick={() => navigate(ROUTE_PATHS.notification)}>
          🔔
        </span>
        <img src={logo} alt="POD" className="addp-logo" />
        <div className="addp-balance-card">
          <div className="addp-coin">₹</div>
          <div className="addp-balance-text">
            <small>Balance</small>
            <strong>{credit}/-</strong>
          </div>
        </div>
      </header>

      <div className="addp-win-strip">
        Win Amount :- <span>{credit}</span>
      </div>

      <main className="addp-content">
        {loading ? <p className="state-text">Loading wallet data...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        <section className="addp-card">
          <div className="addp-tabs">
            <button type="button" className="addp-tab active">
              Add Point
            </button>
            <button type="button" className="addp-tab" onClick={() => navigate(ROUTE_PATHS.wallet)}>
              Withdraw
            </button>
          </div>

          <div className="addp-input-wrap">
            <span className="addp-input-icon">🏛️</span>
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter Amount"
            />
          </div>

          <button type="button" className="addp-submit-btn" onClick={onAddPoints}>
            Add Points
          </button>
        </section>

        <section className="addp-history-card">
          <h3>Wallet History</h3>
          <div className="addp-history-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Pay Mode</th>
                  <th>Date</th>
                  <th>Points</th>
                  <th>Closing Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sampleWalletRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.mode}</td>
                    <td>{row.date}</td>
                    <td>{row.points}</td>
                    <td>{row.closing}</td>
                    <td className="success">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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
        <button type="button" className="nav-item active">
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

      <MessageDialog
        open={dialog.open}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  )
}

export default AddPointPage
