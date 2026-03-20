import { useState } from 'react'
import AuthLayout from './AuthLayout'
import { registerStep1, registerUser } from '../../services/authService'
import { ROUTE_PATHS } from '../routes'
import './auth.css'

const initialSignupForm = { name: '', mobileNum: '', pss: '', refercode: '' }

function SignupPage({ navigate }) {
  const [form, setForm] = useState(initialSignupForm)
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSendOtp = async (event) => {
    event.preventDefault()

    if (!form.name || !form.mobileNum || !form.pss) {
      setMessage({ type: 'error', text: 'Please fill name, mobile number, and password.' })
      return
    }

    setLoading('otp')
    setMessage({ type: '', text: '' })

    try {
      const successMessage = await registerStep1(form)
      setOtpSent(true)
      setMessage({ type: 'success', text: successMessage })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to send OTP.',
      })
    } finally {
      setLoading('')
    }
  }

  const handleSignup = async (event) => {
    event.preventDefault()

    if (!otp) {
      setMessage({ type: 'error', text: 'Please enter OTP to complete registration.' })
      return
    }

    setLoading('signup')
    setMessage({ type: '', text: '' })

    try {
      const result = await registerUser({ ...form, otp })
      setForm(initialSignupForm)
      setOtp('')
      setOtpSent(false)
      setMessage({ type: 'success', text: result.message })
      navigate(ROUTE_PATHS.home)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to register.',
      })
    } finally {
      setLoading('')
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={otpSent ? handleSignup : handleSendOtp}>
        <h1>Create Your Account</h1>

        <label className="field-label" htmlFor="name">
          Full Name
        </label>
        <div className="input-wrap">
          <input
            id="name"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <label className="field-label" htmlFor="mobileNum">
          Mobile Number
        </label>
        <div className="input-wrap">
          <input
            id="mobileNum"
            type="tel"
            name="mobileNum"
            placeholder="Enter mobile number"
            value={form.mobileNum}
            onChange={handleChange}
          />
        </div>

        <label className="field-label" htmlFor="pss">
          Password
        </label>
        <div className="input-wrap">
          <input
            id="pss"
            type="password"
            name="pss"
            placeholder="Enter password"
            value={form.pss}
            onChange={handleChange}
          />
        </div>

        <label className="field-label" htmlFor="refercode">
          Refer Code (Optional)
        </label>
        <div className="input-wrap">
          <input
            id="refercode"
            name="refercode"
            placeholder="Enter refer code"
            value={form.refercode}
            onChange={handleChange}
          />
        </div>

        {otpSent ? (
          <>
            <label className="field-label" htmlFor="otp">
              OTP
            </label>
            <div className="input-wrap">
              <input
                id="otp"
                name="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
              />
            </div>
          </>
        ) : null}

        <button
          type="submit"
          className="primary-btn"
          disabled={loading === 'otp' || loading === 'signup'}
        >
          {loading === 'otp' && 'Please wait...'}
          {loading === '' && !otpSent && 'Send OTP'}
          {loading === 'signup' && 'Please wait...'}
          {loading === '' && otpSent && 'Create Account'}
        </button>

        <p className="switch-text">
          have an Account?{' '}
          <button type="button" onClick={() => navigate(ROUTE_PATHS.login)}>
            Signin Here
          </button>
        </p>
      </form>

      {message.text ? (
        <p className={`api-message ${message.type === 'error' ? 'error' : 'success'}`}>
          {message.text}
        </p>
      ) : null}
    </AuthLayout>
  )
}

export default SignupPage
