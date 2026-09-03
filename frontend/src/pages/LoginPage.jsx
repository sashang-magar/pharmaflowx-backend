import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_ROUTES = {
  MANUFACTURER: '/manufacturer',
  LAB: '/lab',
  REGULATOR: '/regulator',
  DISTRIBUTOR: '/distributor',
  PHARMACY: '/pharmacy',
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      const route = ROLE_ROUTES[user.role] || '/login'
      navigate(route, { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Login failed. Check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>PharmaFlowX</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="Enter username"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.registerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    width: '100%',
    maxWidth: '380px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  title: { fontSize: '22px', fontWeight: '700', marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: '#888', marginBottom: '1.5rem' },
  error: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '1rem',
  },
  field: { marginBottom: '1rem' },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#1a1a1a',
  },
  button: {
    width: '100%',
    padding: '10px',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  registerText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#888',
    marginTop: '1.25rem',
  },
  link: { color: '#1a1a1a', fontWeight: '500' },
}