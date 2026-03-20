import logo from '../../assets/hero.png'

function AuthLayout({ children }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="logo-wrap">
          <img src={logo} alt="POD" className="logo" />
        </div>
        {children}
      </section>
    </main>
  )
}

export default AuthLayout
