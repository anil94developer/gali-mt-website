import { useState } from 'react'
import { getSession } from '../../services/sessionService'
import { ROUTE_PATHS } from '../routes'
import SideDrawer from '../common/SideDrawer'
import AppIcon from '../common/AppIcon'
import './resultHistory.css'

function ResultHistoryPage({ navigate }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [session] = useState(() => getSession())

  return (
    <div className="result-history-page">
      <button type="button" className="rh-menu-btn" onClick={() => setDrawerOpen(true)}>
        <AppIcon name="menu" />
      </button>

      <iframe
        src="https://playonlineds.net/Admin/public/results-data"
        title="Result History"
        className="rh-iframe"
      />

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

export default ResultHistoryPage
