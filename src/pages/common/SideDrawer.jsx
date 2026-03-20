import { useEffect, useMemo, useState } from 'react'
import logo from '../../assets/hero.png'
import { clearSession, getSession } from '../../services/sessionService'
import { getHelpNumber, getUserProfile } from '../../services/homeService'
import { ROUTE_PATHS } from '../routes'
import AppIcon from './AppIcon'
import './sideDrawer.css'

const menuItems = [
  { key: 'profile', label: 'Profile', icon: 'person' },
  { key: 'commission', label: 'App Commission', icon: 'account_balance_wallet' },
  { key: 'history', label: 'Game History', icon: 'history' },
  { key: 'resultHistory', label: 'Result History', icon: 'sports_score' },
  { key: 'terms', label: 'Terms And Condition', icon: 'description' },
  { key: 'refer', label: 'my Refer List', icon: 'group' },
  { key: 'whatsapp', label: 'whatsapp Number', icon: 'chat' },
]

function SideDrawer({
  isOpen,
  onClose,
  navigate,
  name = 'User',
  mobile = '--',
  refCode = '--',
  helpNumber = '+91 9257191421',
}) {
  const [session] = useState(() => getSession())
  const [profileData, setProfileData] = useState(null)
  const [helpData, setHelpData] = useState(null)

  useEffect(() => {
    if (!session?.userId) return

    let isMounted = true
    const loadDrawerData = async () => {
      try {
        const [profileResult, helpResult] = await Promise.all([
          getUserProfile(session.userId),
          getHelpNumber(),
        ])
        if (!isMounted) return
        setProfileData(profileResult || null)
        setHelpData(helpResult || null)
      } catch {
        // Keep fallback props/session data when drawer APIs fail.
      }
    }

    loadDrawerData()
    return () => {
      isMounted = false
    }
  }, [session?.userId])

  const resolvedHelpNumber = useMemo(
    () =>
      profileData?.genral_setting_whatsapp ||
      helpData?.help_line_number ||
      helpData?.whatsapp ||
      helpNumber,
    [helpData?.help_line_number, helpData?.whatsapp, helpNumber, profileData?.genral_setting_whatsapp]
  )

  const resolvedName = profileData?.name || session?.name || name
  const resolvedMobile = profileData?.mob || session?.mobileNum || mobile
  const resolvedRefCode = profileData?.refCode || refCode

  const onClickMenuItem = (itemKey) => {
    if (itemKey === 'profile') {
      onClose()
      navigate(ROUTE_PATHS.profile)
      return
    }

    if (itemKey === 'commission') {
      onClose()
      navigate(ROUTE_PATHS.commission)
      return
    }

    if (itemKey === 'history') {
      onClose()
      navigate(ROUTE_PATHS.history)
      return
    }

    if (itemKey === 'resultHistory') {
      onClose()
      navigate(ROUTE_PATHS.resultHistory)
      return
    }

    if (itemKey === 'terms') {
      onClose()
      navigate(ROUTE_PATHS.terms)
      return
    }

    if (itemKey === 'refer') {
      onClose()
      navigate(ROUTE_PATHS.refer)
      return
    }

    if (itemKey === 'whatsapp') {
      onClose()
      const waUrl = `https://wa.me/${resolvedHelpNumber.replace(/[^\d]/g, '')}`
      window.open(waUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const onLogout = () => {
    clearSession()
    onClose()
    navigate(ROUTE_PATHS.login)
  }

  return (
    <div className={`sd-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
      <aside className={`sd-drawer ${isOpen ? 'open' : ''}`} onClick={(event) => event.stopPropagation()}>
        <div className="sd-head">
          <img src={logo} alt="POD" className="sd-logo" />
          <button type="button" className="sd-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sd-profile">
          <p>name : {resolvedName}</p>
          <p>No : {resolvedMobile}</p>
          <p>Refcode : {resolvedRefCode}</p>
        </div>

        <div className="sd-menu">
          {menuItems.map((item) => (
            <button key={item.key} type="button" className="sd-item" onClick={() => onClickMenuItem(item.key)}>
              <AppIcon name={item.icon} className="sd-item-icon" />
              <span>{item.label}</span>
            </button>
          ))}
          <a
            href={`https://wa.me/${resolvedHelpNumber.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="sd-item"
          >
            <AppIcon name="support_agent" className="sd-item-icon" />
            <span>Help: {resolvedHelpNumber}</span>
          </a>
          <button type="button" className="sd-item logout" onClick={onLogout}>
            <AppIcon name="logout" className="sd-item-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </div>
  )
}

export default SideDrawer
