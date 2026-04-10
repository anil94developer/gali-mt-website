import { useEffect, useMemo, useState } from 'react'
import { getUserCredit, getUserProfile } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import { ROUTE_PATHS } from '../routes'
import SideDrawer from '../common/SideDrawer'
import AppIcon from '../common/AppIcon'
import MessageDialog from '../common/MessageDialog'
import Header from '../common/Header'
import './referShare.css'

function ReferSharePage({ navigate }) {
  const [session] = useState(() => getSession())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [credit, setCredit] = useState(0)
  const [refCode, setRefCode] = useState('393886')
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '' })

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      try {
        const [creditValue, profile] = await Promise.all([
          getUserCredit(session.userId),
          getUserProfile(session.userId),
        ])
        setCredit(Number(creditValue || 0))
        setRefCode(profile?.refCode || '393886')
      } catch {
        // keep fallback values
      }
    }

    loadData()
  }, [navigate, session?.userId])

  const shareText = useMemo(
    () =>
      `अपने दोस्तों को रेफर करें और अपने दोस्तों की प्रत्येक हानि बोली (बुकिंग) पर 5% कमीशन राशि प्राप्त करें रेफरल कोड का उपयोग करके | रेफरल कोड ${refCode} https://24x7good.com/`,
    [refCode]
  )

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText })
        return
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText)
        setDialog({
          open: true,
          type: 'success',
          title: 'Copied',
          message: 'Share message copied. Now paste it anywhere.',
        })
        return
      }

      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer')
    } catch {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Unable to share right now.',
      })
    }
  }

  if (!session?.userId) return null

  return (
    <div className="refer-share-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <main className="refer-share-content">
        <h2>Refer &amp; Earn</h2>
        <p>अगर आप को अपने friend को डाउनलोड करवाते हो तो आपको 5% कमीशन कमा सकते हो | ये 5% कमीशन आपको लाइफ टाइम मिलेगा |</p>
        <p>
          नोट : आपको 5% कमीशन तभी मिलेगा अगर आपका कोई friend गेम खेलता है । और उस गेम से कंपनी को जो
          Profit हुआ उसका 5% आपको मिलेगा ।
        </p>

        <button type="button" className="refer-share-btn" onClick={onShare}>
          Share &amp; Earn
        </button>
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

export default ReferSharePage
