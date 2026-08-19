import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// ─── Status Badge ─────────────────────────────────────────────
function Badge({ text, color }) {
  return (
    <span style={{
      background: color, color: '#fff',
      padding: '2px 10px', borderRadius: '12px',
      fontSize: '11px', fontWeight: '500'
    }}>{text}</span>
  )
}

function ReportStatusBadge({ status }) {
  const map = {
    PENDING:   { color: '#F59E0B', label: 'Pending' },
    SUBMITTED: { color: '#3B82F6', label: 'Submitted' },
    REVIEWED:  { color: '#22C55E', label: 'Reviewed' },
  }
  const s = map[status] || { color: '#999', label: status }
  return <Badge text={s.label} color={s.color} />
}

function ResultBadge({ result }) {
  const map = {
    PASS:         { color: '#22C55E', label: 'Pass' },
    FAIL:         { color: '#EF4444', label: 'Fail' },
    INCONCLUSIVE: { color: '#F59E0B', label: 'Inconclusive' },
  }
  const r = map[result] || { color: '#999', label: result }
  return <Badge text={r.label} color={r.color} />
}

// ─── Navbar ───────────────────────────────────────────────────
function Navbar({ onLogout }) {
  return (
    <div style={s.navbar}>
      <span style={s.navTitle}>PharmaFlowX</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: '#555' }}>Lab</span>
        <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
      </div>
    </div>
  )
}

// ─── Submit Report Modal ──────────────────────────────────────
function SubmitReportModal({ batch, onClose, onSubmitted }) {
  const [form, setForm] = useState({
    result: 'PASS',
    remark: '',
    tested_at: '',
  })
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // multipart/form-data for file upload
      const formData = new FormData()
      formData.append('batch', batch.id)
      formData.append('result', form.result)
      formData.append('remark', form.remark)
      formData.append('tested_at', form.tested_at)
      if (file) formData.append('report_files', file)

      await api.post('lab-reports/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onSubmitted()
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m[0] : m}`)
          .join('\n')
        setError(msg)
      } else {
        setError('Failed to submit report.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Submit Report — {batch.batch_number}</h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        <p style={{ fontSize: '13px', color: '#888', marginBottom: '1rem' }}>
          Medicine: {batch.medicine_name}
        </p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Result</label>
            <select style={s.input} value={form.result}
              onChange={e => setForm({ ...form, result: e.target.value })}>
              <option value="PASS">Pass</option>
              <option value="FAIL">Fail</option>
              <option value="INCONCLUSIVE">Inconclusive</option>
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Tested At</label>
            <input style={s.input} type="datetime-local" value={form.tested_at}
              onChange={e => setForm({ ...form, tested_at: e.target.value })}
              required />
          </div>

          <div style={s.field}>
            <label style={s.label}>Remarks</label>
            <textarea style={{ ...s.input, height: '80px', resize: 'vertical' }}
              value={form.remark}
              onChange={e => setForm({ ...form, remark: e.target.value })}
              placeholder="Enter test remarks..." />
          </div>

          <div style={s.field}>
            <label style={s.label}>Report File (PDF)</label>
            <input type="file" accept=".pdf,.doc,.docx"
              onChange={e => setFile(e.target.files[0])}
              style={{ fontSize: '13px' }} />
          </div>

          <div style={s.modalFooter}>
            <button type="button" onClick={onClose} style={s.cancelBtn}>Cancel</button>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function LabDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [batches, setBatches] = useState([])
  const [reports, setReports] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [loadingBatches, setLoadingBatches] = useState(true)
  const [loadingReports, setLoadingReports] = useState(true)

  const fetchBatches = async () => {
    setLoadingBatches(true)
    try {
      const res = await api.get('batches/')
      const data = res.data.results || res.data
      // backend already filters LAB_TESTING for lab role
      setBatches(data)
    } catch {
      console.error('Failed to fetch batches')
    } finally {
      setLoadingBatches(false)
    }
  }

  const fetchReports = async () => {
    setLoadingReports(true)
    try {
      const res = await api.get('lab-reports/')
      const data = res.data.results || res.data
      setReports(data)
    } catch {
      console.error('Failed to fetch reports')
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    fetchBatches()
    fetchReports()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={s.page}>
      <Navbar onLogout={handleLogout} />

      <div style={s.content}>

        {/* ── Batches Pending Testing ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Batches Pending Testing</h2>
            <span style={{ fontSize: '13px', color: '#888' }}>
              {batches.length} batch{batches.length !== 1 ? 'es' : ''} in queue
            </span>
          </div>

          {loadingBatches ? (
            <p style={s.loading}>Loading...</p>
          ) : batches.length === 0 ? (
            <p style={s.empty}>No batches waiting for testing.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Batch No.', 'Medicine', 'Manufacturer',
                      'Manufacture Date', 'Expiry Date', 'Quantity', 'Action'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {batches.map(b => (
                    <tr key={b.id} style={s.tr}>
                      <td style={s.td}>{b.batch_number}</td>
                      <td style={s.td}>{b.medicine_name}</td>
                      <td style={s.td}>{b.manufacturer_name}</td>
                      <td style={s.td}>{b.manufacture_date}</td>
                      <td style={s.td}>{b.expiry_date}</td>
                      <td style={s.td}>{b.current_quantity}</td>
                      <td style={s.td}>
                        <button
                          style={s.actionBtn}
                          onClick={() => setSelectedBatch(b)}
                        >
                          Submit Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── My Reports ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>My Reports</h2>
          </div>

          {loadingReports ? (
            <p style={s.loading}>Loading...</p>
          ) : reports.length === 0 ? (
            <p style={s.empty}>No reports submitted yet.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Batch No.', 'Medicine', 'Result',
                      'Status', 'Tested At', 'File'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id} style={s.tr}>
                      <td style={s.td}>{r.batch_number}</td>
                      <td style={s.td}>{r.medicine_name}</td>
                      <td style={s.td}><ResultBadge result={r.result} /></td>
                      <td style={s.td}><ReportStatusBadge status={r.report_status} /></td>
                      <td style={s.td}>{r.tested_at ? new Date(r.tested_at).toLocaleDateString() : '—'}</td>
                      <td style={s.td}>
                        {r.report_files
                          ? <a href={`http://localhost:8000${r.report_files}`}
                              target="_blank" rel="noreferrer"
                              style={{ color: '#3B82F6', fontSize: '13px' }}>
                              View
                            </a>
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedBatch && (
        <SubmitReportModal
          batch={selectedBatch}
          onClose={() => setSelectedBatch(null)}
          onSubmitted={() => {
            fetchReports()
            fetchBatches()
          }}
        />
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────
const s = {
  page: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, sans-serif' },
  navbar: {
    background: '#fff', borderBottom: '1px solid #e0e0e0',
    padding: '0 2rem', height: '56px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  navTitle: { fontSize: '16px', fontWeight: '700' },
  logoutBtn: {
    padding: '6px 14px', background: 'transparent',
    border: '1px solid #e0e0e0', borderRadius: '8px',
    fontSize: '13px', cursor: 'pointer',
  },
  content: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  section: {
    background: '#fff', borderRadius: '12px',
    border: '1px solid #e0e0e0', padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1rem',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '600', margin: 0 },
  loading: { color: '#888', fontSize: '13px' },
  empty: { color: '#aaa', fontSize: '13px', textAlign: 'center', padding: '2rem 0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    textAlign: 'left', padding: '10px 12px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '11px', fontWeight: '600',
    color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '10px 12px', color: '#1a1a1a' },
  actionBtn: {
    padding: '5px 12px', background: '#1a1a1a', color: '#fff',
    border: 'none', borderRadius: '6px',
    fontSize: '12px', cursor: 'pointer',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  modal: {
    background: '#fff', borderRadius: '12px', padding: '1.5rem',
    width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1rem',
  },
  modalTitle: { fontSize: '16px', fontWeight: '600', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.25rem' },
  cancelBtn: {
    padding: '8px 16px', background: 'transparent',
    border: '1px solid #e0e0e0', borderRadius: '8px',
    fontSize: '13px', cursor: 'pointer',
  },
  submitBtn: {
    padding: '8px 16px', background: '#1a1a1a', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
  },
  error: {
    background: '#fef2f2', border: '1px solid #fca5a5',
    color: '#991b1b', padding: '10px 12px',
    borderRadius: '8px', fontSize: '13px',
    marginBottom: '1rem', whiteSpace: 'pre-line',
  },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '12px', fontWeight: '500', color: '#555', marginBottom: '5px' },
  input: {
    width: '100%', padding: '9px 12px',
    border: '1px solid #e0e0e0', borderRadius: '8px',
    fontSize: '13px', outline: 'none',
    boxSizing: 'border-box', background: '#fff',
  },
}