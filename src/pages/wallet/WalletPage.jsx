import { useEffect, useMemo, useState } from 'react'
import logo from '../../assets/hero.png'
import { ROUTE_PATHS } from '../routes'
import { getUserCredit } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import { deductWithdrawWeb, getAppManager } from '../../services/walletService'
import SideDrawer from '../common/SideDrawer'
import MessageDialog from '../common/MessageDialog'
import AppIcon from '../common/AppIcon'
import './wallet.css'

const sampleWalletRows = [
  { id: 1, mode: 'Deposit By Admin', date: '7/3/2026, 7:06:42 am', points: 100 },
  { id: 2, mode: 'Game Bet MATKANIGHT', date: '6/1/2026, 7:11:09 pm', points: 10 },
  { id: 3, mode: 'Game Bet VIPMATKA', date: '6/1/2026, 7:09:58 pm', points: 1 },
  { id: 4, mode: 'Deposit By Admin', date: '6/1/2026, 7:09:41 pm', points: 100 },
]

const sampleWithdrawRows = [
  { id: 1, date: '6/1/2026, 10:40:09 pm', points: 5, closing: 0, status: 'Success' },
  { id: 2, date: '6/1/2026, 10:40:09 pm', points: 5, closing: 0, status: 'Success' },
  { id: 3, date: '6/1/2026, 10:39:58 pm', points: 25, closing: 5, status: 'Success' },
]

function WalletPage({ navigate }) {
  const [session] = useState(() => getSession())
  const [activeTab, setActiveTab] = useState('withdraw')
  const [amount, setAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState('bank')
  const [upiId, setUpiId] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [confirmIfscCode, setConfirmIfscCode] = useState('')
  const [credit, setCredit] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [managerData, setManagerData] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
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
        const [managerResponse, creditValue] = await Promise.all([
          getAppManager(session.userId),
          getUserCredit(session.userId),
        ])

        setManagerData(managerResponse?.data || null)
        setCredit(Number(creditValue || 0))
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to fetch wallet details.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  const withdrawTimeText = useMemo(() => {
    const open = managerData?.withdraw_open_time || '07:00'
    const close = managerData?.withdraw_close_time || '13:30'
    return `Withdrawal Time ${open} to ${close}`
  }, [managerData?.withdraw_close_time, managerData?.withdraw_open_time])

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Please enter valid amount.',
      })
      return
    }

    if (paymentMode === 'bank' && (!accountNumber || !ifscCode)) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Please enter account number and IFSC code.',
      })
      return
    }

    if (paymentMode === 'bank' && accountNumber !== confirmAccountNumber) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Account number and confirm account number should match.',
      })
      return
    }

    if (paymentMode === 'bank' && ifscCode.toUpperCase() !== confirmIfscCode.toUpperCase()) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'IFSC code and confirm IFSC code should match.',
      })
      return
    }

    if (paymentMode === 'upi' && !upiId) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Please enter UPI ID.',
      })
      return
    }

    setWithdrawing(true)
    try {
      const result = await deductWithdrawWeb({
        userId: session.userId,
        amount,
        accountNumber: paymentMode === 'bank' ? accountNumber : '',
        ifscCode: paymentMode === 'bank' ? ifscCode : '',
        bankName: '',
        accountHolderName: '',
        upiId: paymentMode === 'upi' ? upiId : '',
      })

      setCredit(Number(result.credit || credit))
      setDialog({
        open: true,
        type: 'success',
        title: 'Success',
        message: result.message || 'Withdrawal request submitted.',
      })
    } catch (apiError) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message:
          apiError instanceof Error ? apiError.message : 'Unable to submit withdrawal request.',
      })
    } finally {
      setWithdrawing(false)
    }
  }

  if (!session?.userId) return null

  return (
    <div className="wallet-page">
      <header className="wallet-topbar">
        <button type="button" className="wallet-icon-btn" onClick={() => setDrawerOpen(true)}>
          ☰
        </button>
        <span className="wallet-bell" onClick={() => navigate(ROUTE_PATHS.notification)}>
          🔔
        </span>
        <img src={logo} alt="POD" className="wallet-logo" />
        <div className="wallet-balance-card">
          <div className="wallet-coin">₹</div>
          <div className="wallet-balance-text">
            <small>Balance</small>
            <strong>{credit}/-</strong>
          </div>
        </div>
      </header>

      <div className="win-strip">
        Win Amount :- <span>{credit}</span>
      </div>

      <main className="wallet-content">
        {loading ? <p className="state-text">Loading wallet data...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        <section className="wallet-card">
          <div className="wallet-tabs">
            <button
              type="button"
              className={`wallet-tab ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => navigate(ROUTE_PATHS.addPoint)}
            >
              Add Point
            </button>
            <button
              type="button"
              className={`wallet-tab ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => setActiveTab('withdraw')}
            >
              Withdraw
            </button>
          </div>

          <div className="input-box">
            <span className="input-icon">🏛️</span>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter Amount"
            />
          </div>

          {activeTab === 'add' ? (
            <>
              <button type="button" className="wallet-submit">
                Add Points
              </button>
              <div className="wallet-note">
                ⏲️ विथड्रावल डालने के 3 घंटे के अंदर आपके अकाउंट में पेमेंट आ जाएगी।
              </div>
            </>
          ) : (
            <>
              <div className="bank-tabs">
                <button
                  type="button"
                  className={paymentMode === 'bank' ? 'active' : ''}
                  onClick={() => setPaymentMode('bank')}
                >
                  Bank
                </button>
                <button
                  type="button"
                  className={paymentMode === 'upi' ? 'active' : ''}
                  onClick={() => setPaymentMode('upi')}
                >
                  UPI ID
                </button>
              </div>
              {paymentMode === 'bank' ? (
                <>
                  <input
                    className="upi-input"
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value.replace(/[^\d]/g, ''))}
                    placeholder="Account Number"
                  />
                  <input
                    className="upi-input"
                    value={confirmAccountNumber}
                    onChange={(event) =>
                      setConfirmAccountNumber(event.target.value.replace(/[^\d]/g, ''))
                    }
                    placeholder="Confirm Account Number"
                  />
                  <input
                    className="upi-input"
                    value={ifscCode}
                    onChange={(event) => setIfscCode(event.target.value.toUpperCase())}
                    placeholder="IFSC CODE"
                  />
                  <input
                    className="upi-input"
                    value={confirmIfscCode}
                    onChange={(event) => setConfirmIfscCode(event.target.value.toUpperCase())}
                    placeholder="CONFIRM IFSC CODE"
                  />
                </>
              ) : (
                <>
                  <label className="upi-label">Enter your UPI ID</label>
                  <input
                    className="upi-input"
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    placeholder={managerData?.upiId || 'UPI ID'}
                  />
                </>
              )}
              <button type="button" className="wallet-submit" onClick={handleWithdraw} disabled={withdrawing}>
                {withdrawing ? 'Please wait...' : 'Withdrawal'}
              </button>
              <div className="wallet-note">⏲️ {withdrawTimeText}</div>
            </>
          )}
        </section>

        <section className="history-card">
          <h3>{activeTab === 'add' ? 'Wallet History' : 'Withdraw History'}</h3>
          <div className="history-table-wrap">
            {activeTab === 'add' ? (
              <table>
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Pay Mode</th>
                    <th>Date</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleWalletRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.mode}</td>
                      <td>{row.date}</td>
                      <td>{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>S No</th>
                    <th>Date</th>
                    <th>Points</th>
                    <th>Closing Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleWithdrawRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.date}</td>
                      <td>{row.points}</td>
                      <td>{row.closing}</td>
                      <td className="success">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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

export default WalletPage
