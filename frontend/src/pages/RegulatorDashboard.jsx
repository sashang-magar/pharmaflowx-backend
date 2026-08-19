import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Badge({ text, color }) {
  return (
    <span style={{
      background: color, color: '#fff',
      padding: '2px 10px', borderRadius: '12px',
      fontSize: '11px', fontWeight: '500'
    }}>{text}</span>
  )
}

function ApprovalStatusBadge({ status }) {
  const map = {
    UNDER_REVIEW: { color: '#F59E0B', label: 'Under Review' },
    APPROVED:     { color: '#22C55E', label: 'Approved' },
    REJECTED:     { color: '#EF4444', label: 'Rejected' },
  }
  const s = map[status] || { color: '#999', label: status }
  return <Badge text={s.label} color={s.color} />
}

function Navbar({ onLogout }) {
  return (
    <div style={s.navbar}>
      <span style={s.navTitle}>PharmaFlowX</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: '#555' }}>Regulator</span>
        <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
      </div>
    </div>
  )
}

// ─── Approve/Reject Modal ─────────────────────────────────────
function ReviewModal({ report, onClose, onActioned }) {
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAction = async (decision) => {
    setError('')
    setLoading(true)
    try {
      // Step 1 — create approval record if not exists
      let approvalId = report.approval_id

      if (!approvalId) {
        const createRes = await api.post('approvals/', {
          lab_report: report.id,
          remarks: remarks,
        })
        approvalId = createRes.data.id
      }

      // Step 2 — update status to APPROVED or REJECTED
      await api.patch(`approvals/${approvalId}/`, {
        status: decision,
        remarks: remarks,
      })

      onActioned()
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m[0] : m}`)
          .join('\n')
        setError(msg)
      } else {
        setError('Action failed. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Review Report</h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        <div style={s.infoBox}>
          <p style={s.infoRow}><strong>Batch:</strong> {report.batch_number}</p>
          <p style={s.infoRow}><strong>Medicine:</strong> {report.medicine_name}</p>
          <p style={s.infoRow}><strong>Lab:</strong> {report.lab_name}</p>
          <p style={s.infoRow}><strong>Result:</strong> {report.result}</p>
          {report.remark && <p style={s.infoRow}><strong>Remarks:</strong> {report.remark}</p>}
          {report.report_files && (
            <p style={s.infoRow}>
              <strong>File:</strong>{' '}
              <a href={`http://localhost:8000${report.report_files}`}
                target="_blank" rel="noreferrer" style={{ color: '#3B82F6' }}>
                View Report
              </a>
            </p>
          )}
        </div>

        {error && <div style={s.error}>{error}</div>}

        <div style={s.field}>
          <label style={s.label}>Remarks (optional)</label>
          <textarea
            style={{ ...s.input, height: '80px', resize: 'vertical' }}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Add your remarks..." />
        </div>

        <div style={s.actionRow}>
          <button type="button" onClick={onClose} style={s.cancelBtn}>Cancel</button>
          <button
            type="button"
            onClick={() => handleAction('REJECTED')}
            style={s.rejectBtn}
            disabled={loading}
          >
            {loading ? '...' : 'Reject'}
          </button>
          <button
            type="button"
            onClick={() => handleAction('APPROVED')}
            style={s.approveBtn}
            disabled={loading}
          >
            {loading ? '...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function RegulatorDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [approvals, setApprovals] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loadingReports, setLoadingReports] = useState(true)
  const [loadingApprovals, setLoadingApprovals] = useState(true)

  const fetchReports = async () => {
    setLoadingReports(true)
    try {
      const res = await api.get('labreports/')
      const data = res.data.results || res.data
      setReports(data)
    } catch {
      console.error('Failed to fetch reports')
    } finally {
      setLoadingReports(false)
    }
  }

  const fetchApprovals = async () => {
    setLoadingApprovals(true)
    try {
      const res = await api.get('approvals/')
      const data = res.data.results || res.data
      setApprovals(data)
    } catch {
      console.error('Failed to fetch approvals')
    } finally {
      setLoadingApprovals(false)
    }
  }

  useEffect(() => {
    fetchReports()
    fetchApprovals()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={s.page}>
      <Navbar onLogout={handleLogout} />
      <div style={s.content}>

        {/* ── Pending Reports ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Submitted Reports — Pending Review</h2>
            <span style={{ fontSize: '13px', color: '#888' }}>
              {reports.length} pending
            </span>
          </div>

          {loadingReports ? (
            <p style={s.loading}>Loading...</p>
          ) : reports.length === 0 ? (
            <p style={s.empty}>No reports pending review.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Batch No.', 'Medicine', 'Lab', 'Result', 'Tested At', 'Action'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id} style={s.tr}>
                      <td style={s.td}>{r.batch_number}</td>
                      <td style={s.td}>{r.medicine_name}</td>
                      <td style={s.td}>{r.lab_name}</td>
                      <td style={s.td}>{r.result}</td>
                      <td style={s.td}>
                        {r.tested_at ? new Date(r.tested_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={s.td}>
                        <button
                          style={s.actionBtn}
                          onClick={() => setSelectedReport(r)}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Approval History ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Approval History</h2>
          </div>

          {loadingApprovals ? (
            <p style={s.loading}>Loading...</p>
          ) : approvals.length === 0 ? (
            <p style={s.empty}>No approvals made yet.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Batch No.', 'Medicine', 'Lab Result', 'Status', 'Approved At', 'Remarks'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {approvals.map(a => (
                    <tr key={a.id} style={s.tr}>
                      <td style={s.td}>{a.batch_number}</td>
                      <td style={s.td}>{a.medicine_name}</td>
                      <td style={s.td}>{a.lab_result}</td>
                      <td style={s.td}><ApprovalStatusBadge status={a.status} /></td>
                      <td style={s.td}>
                        {a.approved_at ? new Date(a.approved_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={s.td}>{a.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedReport && (
        <ReviewModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onActioned={() => {
            fetchReports()
            fetchApprovals()
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
    border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  modal: {
    background: '#fff', borderRadius: '12px', padding: '1.5rem',
    width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1rem',
  },
  modalTitle: { fontSize: '16px', fontWeight: '600', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' },
  infoBox: {
    background: '#f9f9f7', borderRadius: '8px',
    padding: '12px', marginBottom: '1rem',
  },
  infoRow: { fontSize: '13px', color: '#444', marginBottom: '4px' },
  actionRow: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.25rem' },
  cancelBtn: {
    padding: '8px 16px', background: 'transparent',
    border: '1px solid #e0e0e0', borderRadius: '8px',
    fontSize: '13px', cursor: 'pointer',
  },
  rejectBtn: {
    padding: '8px 16px', background: '#EF4444', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
  },
  approveBtn: {
    padding: '8px 16px', background: '#22C55E', color: '#fff',
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