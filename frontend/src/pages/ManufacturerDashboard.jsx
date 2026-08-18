import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// ─── Status badge ────────────────────────────────────────────
const STATUS_COLORS = {
  IN_PRODUCTION: { bg: '#6B7280', label: 'In Production' },
  LAB_TESTING:   { bg: '#3B82F6', label: 'Lab Testing' },
  APPROVED:      { bg: '#22C55E', label: 'Approved' },
  REJECTED:      { bg: '#EF4444', label: 'Rejected' },
  DISTRIBUTED:   { bg: '#14B8A6', label: 'Distributed' },
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#999', label: status }
  return (
    <span style={{
      background: s.bg, color: '#fff',
      padding: '2px 10px', borderRadius: '12px',
      fontSize: '11px', fontWeight: '500'
    }}>
      {s.label}
    </span>
  )
}

// ─── Navbar ──────────────────────────────────────────────────
function Navbar({ onLogout }) {
  return (
    <div style={s.navbar}>
      <span style={s.navTitle}>PharmaFlowX</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: '#555' }}>Manufacturer</span>
        <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
      </div>
    </div>
  )
}

// ─── Create Medicine Modal ────────────────────────────────────
function CreateMedicineModal({ onClose, onCreated, medicines }) {
  const [form, setForm] = useState({
    generic_name: '', brand_name: '', composition: '',
    strength: '', dosage_form: 'TABLET', unit_type: 'STRIP',
    description: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('medicines/', form)
      onCreated()
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m[0] : m}`)
          .join('\n')
        setError(msg)
      } else {
        setError('Failed to create medicine.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Create Medicine</h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            { name: 'brand_name', label: 'Brand Name' },
            { name: 'generic_name', label: 'Generic Name' },
            { name: 'composition', label: 'Composition' },
            { name: 'strength', label: 'Strength (e.g. 500mg)' },
            { name: 'description', label: 'Description', required: false },
          ].map(({ name, label, required = true }) => (
            <div style={s.field} key={name}>
              <label style={s.label}>{label}</label>
              <input
                style={s.input}
                value={form[name]}
                onChange={e => setForm({ ...form, [name]: e.target.value })}
                placeholder={label}
                required={required}
              />
            </div>
          ))}

          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Dosage Form</label>
              <select style={s.input} value={form.dosage_form}
                onChange={e => setForm({ ...form, dosage_form: e.target.value })}>
                {['TABLET','CAPSULE','SYRUP','INJECTION','CREAM','DROPS','INHALER']
                  .map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Unit Type</label>
              <select style={s.input} value={form.unit_type}
                onChange={e => setForm({ ...form, unit_type: e.target.value })}>
                {['STRIP','BOTTLE','VIAL','BOX','TUBE']
                  .map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div style={s.modalFooter}>
            <button type="button" onClick={onClose} style={s.cancelBtn}>Cancel</button>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? 'Creating...' : 'Create Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Create Batch Modal ───────────────────────────────────────
function CreateBatchModal({ onClose, onCreated, medicines }) {
  const [form, setForm] = useState({
    medicine: '',
    batch_number: '',
    manufacture_date: '',
    expiry_date: '',
    initial_quantity: '',
    current_quantity: '',
    mrp: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('batches/', form)
      onCreated()
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m[0] : m}`)
          .join('\n')
        setError(msg)
      } else {
        setError('Failed to create batch.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Create Batch</h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Medicine</label>
            <select style={s.input} value={form.medicine}
              onChange={e => setForm({ ...form, medicine: e.target.value })} required>
              <option value="">Select medicine</option>
              {medicines.map(m => (
                <option key={m.id} value={m.id}>{m.brand_name} ({m.generic_name})</option>
              ))}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Batch Number</label>
            <input style={s.input} value={form.batch_number}
              onChange={e => setForm({ ...form, batch_number: e.target.value })}
              placeholder="e.g. PCM-2026-001" required />
          </div>

          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Manufacture Date</label>
              <input style={s.input} type="date" value={form.manufacture_date}
                onChange={e => setForm({ ...form, manufacture_date: e.target.value })} required />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Expiry Date</label>
              <input style={s.input} type="date" value={form.expiry_date}
                onChange={e => setForm({ ...form, expiry_date: e.target.value })} required />
            </div>
          </div>

          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Initial Quantity</label>
              <input style={s.input} type="number" value={form.initial_quantity}
                onChange={e => setForm({ ...form, initial_quantity: e.target.value })} required />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Current Quantity</label>
              <input style={s.input} type="number" value={form.current_quantity}
                onChange={e => setForm({ ...form, current_quantity: e.target.value })} required />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>MRP (per unit)</label>
              <input style={s.input} type="number" step="0.01" value={form.mrp}
                onChange={e => setForm({ ...form, mrp: e.target.value })} required />
            </div>
          </div>

          <div style={s.modalFooter}>
            <button type="button" onClick={onClose} style={s.cancelBtn}>Cancel</button>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function ManufacturerDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState([])
  const [batches, setBatches] = useState([])
  const [showMedModal, setShowMedModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [loadingMed, setLoadingMed] = useState(true)
  const [loadingBatch, setLoadingBatch] = useState(true)

  const fetchMedicines = async () => {
    setLoadingMed(true)
    try {
      const res = await api.get('medicines/')
      setMedicines(res.data.results || [])
    } catch {
      console.error('Failed to fetch medicines')
    } finally {
      setLoadingMed(false)
    }
  }

  const fetchBatches = async () => {
    setLoadingBatch(true)
    try {
      const res = await api.get('batches/')
      setBatches(res.data.results || [])
    } catch {
      console.error('Failed to fetch batches')
    } finally {
      setLoadingBatch(false)
    }
  }

  useEffect(() => {
    fetchMedicines()
    fetchBatches()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={s.page}>
      <Navbar onLogout={handleLogout} />

      <div style={s.content}>

        {/* ── Medicines Section ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Medicines</h2>
            <button style={s.primaryBtn} onClick={() => setShowMedModal(true)}>
              + Create Medicine
            </button>
          </div>

          {loadingMed ? (
            <p style={s.loading}>Loading...</p>
          ) : medicines.length === 0 ? (
            <p style={s.empty}>No medicines yet. Create your first one.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Brand Name', 'Generic Name', 'Composition', 'Strength', 'Dosage Form', 'Unit Type'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {medicines.map(m => (
                    <tr key={m.id} style={s.tr}>
                      <td style={s.td}>{m.brand_name}</td>
                      <td style={s.td}>{m.generic_name}</td>
                      <td style={s.td}>{m.strength}</td>
                      <td style={s.td}>{m.dosage_form}</td>
                      <td style={s.td}>{m.unit_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Batches Section ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Batches</h2>
            <button style={s.primaryBtn} onClick={() => setShowBatchModal(true)}>
              + Create Batch
            </button>
          </div>

          {loadingBatch ? (
            <p style={s.loading}>Loading...</p>
          ) : batches.length === 0 ? (
            <p style={s.empty}>No batches yet. Create your first one.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Batch No.', 'Medicine', 'Status', 'Manufacture Date', 'Expiry Date', 'Qty', 'MRP'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {batches.map(b => (
                    <tr key={b.id} style={s.tr}>
                      <td style={s.td}>{b.batch_number}</td>
                      <td style={s.td}>{b.medicine_name}</td>
                      <td style={s.td}><StatusBadge status={b.status} /></td>
                      <td style={s.td}>{b.manufacture_date}</td>
                      <td style={s.td}>{b.expiry_date}</td>
                      <td style={s.td}>{b.current_quantity}</td>
                      <td style={s.td}>Rs. {b.mrp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showMedModal && (
        <CreateMedicineModal
          onClose={() => setShowMedModal(false)}
          onCreated={fetchMedicines}
          medicines={medicines}
        />
      )}
      {showBatchModal && (
        <CreateBatchModal
          onClose={() => setShowBatchModal(false)}
          onCreated={fetchBatches}
          medicines={medicines}
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
  primaryBtn: {
    padding: '7px 16px', background: '#1a1a1a', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '13px',
    fontWeight: '500', cursor: 'pointer',
  },
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
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  modal: {
    background: '#fff', borderRadius: '12px', padding: '1.5rem',
    width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1.25rem',
  },
  modalTitle: { fontSize: '16px', fontWeight: '600', margin: 0 },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '18px',
    cursor: 'pointer', color: '#888',
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end',
    gap: '8px', marginTop: '1.25rem',
  },
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
  label: {
    display: 'block', fontSize: '12px',
    fontWeight: '500', color: '#555', marginBottom: '5px',
  },
  input: {
    width: '100%', padding: '9px 12px',
    border: '1px solid #e0e0e0', borderRadius: '8px',
    fontSize: '13px', outline: 'none',
    boxSizing: 'border-box', background: '#fff',
  },
  row: { display: 'flex', gap: '12px' },
}