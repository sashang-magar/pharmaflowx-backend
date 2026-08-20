import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// ─── Badges ───────────────────────────────────────────────────
function Badge({ text, color }) {
  return (
    <span style={{
      background: color, color: '#fff',
      padding: '2px 10px', borderRadius: '12px',
      fontSize: '11px', fontWeight: '500'
    }}>{text}</span>
  )
}

function OrderStatusBadge({ status }) {
  const map = {
    PENDING:   { color: '#F59E0B', label: 'Pending' },
    CONFIRMED: { color: '#3B82F6', label: 'Confirmed' },
    SHIPPED:   { color: '#8B5CF6', label: 'Shipped' },
    DELIVERED: { color: '#22C55E', label: 'Delivered' },
    CANCELLED: { color: '#EF4444', label: 'Cancelled' },
  }
  const s = map[status] || { color: '#999', label: status }
  return <Badge text={s.label} color={s.color} />
}

// ─── Navbar ───────────────────────────────────────────────────
function Navbar({ onLogout }) {
  return (
    <div style={s.navbar}>
      <span style={s.navTitle}>PharmaFlowX</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: '#555' }}>Distributor</span>
        <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
      </div>
    </div>
  )
}

// ─── Add to Inventory Modal ───────────────────────────────────
function AddInventoryModal({ onClose, onAdded }) {
  const [approvedBatches, setApprovedBatches] = useState([])
  const [form, setForm] = useState({
    batch: '',
    quantity: '',
    location: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingBatches, setFetchingBatches] = useState(true)

  // fetch APPROVED batches — backend filters by role so distributor sees all approved
  useEffect(() => {
    api.get('batches/')
      .then(res => {
        const data = res.data.results || res.data
        setApprovedBatches(data)
      })
      .catch(() => setError('Failed to load batches.'))
      .finally(() => setFetchingBatches(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('inventory/', form)
      onAdded()
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m[0] : m}`)
          .join('\n')
        setError(msg)
      } else {
        setError('Failed to add inventory.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Add to Inventory</h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Approved Batch</label>
            {fetchingBatches ? (
              <p style={{ fontSize: '13px', color: '#888' }}>Loading batches...</p>
            ) : (
              <select style={s.input} value={form.batch}
                onChange={e => setForm({ ...form, batch: e.target.value })} required>
                <option value="">Select batch</option>
                {approvedBatches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.batch_number} — {b.medicine_name} (Qty: {b.current_quantity})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={s.field}>
            <label style={s.label}>Quantity</label>
            <input style={s.input} type="number" min="1"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              placeholder="Enter quantity" required />
          </div>

          <div style={s.field}>
            <label style={s.label}>Location (optional)</label>
            <input style={s.input} type="text"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Warehouse A, Kathmandu" />
          </div>

          <div style={s.modalFooter}>
            <button type="button" onClick={onClose} style={s.cancelBtn}>Cancel</button>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? 'Adding...' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function DistributorDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [inventory, setInventory] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [expiringSoon, setExpiringSoon] = useState([])
  const [orders, setOrders] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)

  const [loading, setLoading] = useState({
    inventory: true, lowStock: true,
    expiring: true, orders: true,
  })
  const [actionLoading, setActionLoading] = useState(null) // order id being actioned

  const fetchInventory = async () => {
    setLoading(prev => ({ ...prev, inventory: true }))
    try {
      const res = await api.get('inventory/')
      setInventory(res.data.results || res.data)
    } catch { console.error('Failed to fetch inventory') }
    finally { setLoading(prev => ({ ...prev, inventory: false })) }
  }

  const fetchLowStock = async () => {
    setLoading(prev => ({ ...prev, lowStock: true }))
    try {
      const res = await api.get('inventory/low-stock/')
      setLowStock(res.data.results || res.data)
    } catch { console.error('Failed to fetch low stock') }
    finally { setLoading(prev => ({ ...prev, lowStock: false })) }
  }

  const fetchExpiring = async () => {
    setLoading(prev => ({ ...prev, expiring: true }))
    try {
      const res = await api.get('inventory/expiring-soon/')
      setExpiringSoon(res.data.results || res.data)
    } catch { console.error('Failed to fetch expiring') }
    finally { setLoading(prev => ({ ...prev, expiring: false })) }
  }

  const fetchOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }))
    try {
      const res = await api.get('orders/')
      setOrders(res.data.results || res.data)
    } catch { console.error('Failed to fetch orders') }
    finally { setLoading(prev => ({ ...prev, orders: false })) }
  }

  useEffect(() => {
    fetchInventory()
    fetchLowStock()
    fetchExpiring()
    fetchOrders()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleConfirmOrder = async (orderId) => {
    setActionLoading(orderId)
    try {
      await api.patch(`orders/${orderId}/`, { status: 'CONFIRMED' })
      fetchOrders()
      fetchInventory()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to confirm order.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeliverOrder = async (orderId) => {
    setActionLoading(orderId)
    try {
      await api.post(`orders/${orderId}/deliver/`)
      fetchOrders()
      fetchInventory()
      fetchLowStock()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to deliver order.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div style={s.page}>
      <Navbar onLogout={handleLogout} />

      <div style={s.content}>

        {/* ── Alert Cards Row ── */}
        <div style={s.alertRow}>

          {/* Low Stock */}
          <div style={{ ...s.alertCard, borderColor: '#FCA5A5', background: '#FEF2F2' }}>
            <div style={s.alertIcon}>⚠️</div>
            <div>
              <p style={{ ...s.alertTitle, color: '#991B1B' }}>
                Low Stock Alert
              </p>
              {loading.lowStock ? (
                <p style={s.alertCount}>Loading...</p>
              ) : (
                <>
                  <p style={{ ...s.alertCount, color: '#EF4444' }}>
                    {lowStock.length} item{lowStock.length !== 1 ? 's' : ''} below threshold
                  </p>
                  {lowStock.slice(0, 3).map(item => (
                    <p key={item.id} style={s.alertItem}>
                      {item.medicine_name} — {item.quantity} left
                      (threshold: {item.reorder_threshold})
                    </p>
                  ))}
                  {lowStock.length > 3 && (
                    <p style={s.alertItem}>+{lowStock.length - 3} more...</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Expiring Soon */}
          <div style={{ ...s.alertCard, borderColor: '#FCD34D', background: '#FFFBEB' }}>
            <div style={s.alertIcon}>📅</div>
            <div>
              <p style={{ ...s.alertTitle, color: '#92400E' }}>
                Expiring Soon
              </p>
              {loading.expiring ? (
                <p style={s.alertCount}>Loading...</p>
              ) : (
                <>
                  <p style={{ ...s.alertCount, color: '#F59E0B' }}>
                    {expiringSoon.length} batch{expiringSoon.length !== 1 ? 'es' : ''} within 30 days
                  </p>
                  {expiringSoon.slice(0, 3).map(item => (
                    <p key={item.id} style={s.alertItem}>
                      {item.medicine_name} — expires {item.expiry_date}
                    </p>
                  ))}
                  {expiringSoon.length > 3 && (
                    <p style={s.alertItem}>+{expiringSoon.length - 3} more...</p>
                  )}
                </>
              )}
            </div>
          </div>

        </div>

        {/* ── Inventory ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>My Inventory</h2>
            <button style={s.primaryBtn} onClick={() => setShowAddModal(true)}>
              + Add to Inventory
            </button>
          </div>

          {loading.inventory ? (
            <p style={s.loading}>Loading...</p>
          ) : inventory.length === 0 ? (
            <p style={s.empty}>No inventory yet. Add approved batches.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Medicine', 'Batch', 'Total Qty', 'Reserved',
                      'Available', 'Reorder Threshold', 'Expiry', 'Location'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id} style={s.tr}>
                      <td style={s.td}>{item.medicine_name}</td>
                      <td style={s.td}>{item.batch_number}</td>
                      <td style={s.td}>{item.quantity}</td>
                      <td style={s.td}>{item.reserved_quantity}</td>
                      <td style={s.td}>
                        <strong>{item.available_quantity}</strong>
                      </td>
                      <td style={s.td}>{item.reorder_threshold}</td>
                      <td style={s.td}>{item.expiry_date}</td>
                      <td style={s.td}>{item.location || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Orders ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Incoming Orders</h2>
            <span style={{ fontSize: '13px', color: '#888' }}>
              {orders.filter(o => o.status === 'PENDING').length} pending
            </span>
          </div>

          {loading.orders ? (
            <p style={s.loading}>Loading...</p>
          ) : orders.length === 0 ? (
            <p style={s.empty}>No orders yet.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Order #', 'Pharmacy', 'Status', 'Payment',
                      'Ordered At', 'Delivered At', 'Actions'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={s.tr}>
                      <td style={s.td}>#{order.id}</td>
                      <td style={s.td}>{order.pharmacy_name}</td>
                      <td style={s.td}><OrderStatusBadge status={order.status} /></td>
                      <td style={s.td}>{order.payment_method}</td>
                      <td style={s.td}>
                        {order.ordered_at
                          ? new Date(order.ordered_at).toLocaleDateString()
                          : '—'}
                      </td>
                      <td style={s.td}>
                        {order.delivered_at
                          ? new Date(order.delivered_at).toLocaleDateString()
                          : '—'}
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {order.status === 'PENDING' && (
                            <button
                              style={s.confirmBtn}
                              disabled={actionLoading === order.id}
                              onClick={() => handleConfirmOrder(order.id)}
                            >
                              {actionLoading === order.id ? '...' : 'Confirm'}
                            </button>
                          )}
                          {order.status === 'CONFIRMED' && (
                            <button
                              style={s.deliverBtn}
                              disabled={actionLoading === order.id}
                              onClick={() => handleDeliverOrder(order.id)}
                            >
                              {actionLoading === order.id ? '...' : 'Deliver'}
                            </button>
                          )}
                          {['DELIVERED', 'CANCELLED'].includes(order.status) && (
                            <span style={{ fontSize: '12px', color: '#aaa' }}>
                              {order.status === 'DELIVERED' ? 'Done' : 'Cancelled'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {showAddModal && (
        <AddInventoryModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            fetchInventory()
            fetchLowStock()
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
  content: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' },
  alertRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  alertCard: {
    flex: 1, minWidth: '260px',
    border: '1px solid', borderRadius: '12px',
    padding: '1.25rem', display: 'flex', gap: '12px', alignItems: 'flex-start',
  },
  alertIcon: { fontSize: '20px' },
  alertTitle: { fontSize: '13px', fontWeight: '600', marginBottom: '4px' },
  alertCount: { fontSize: '13px', fontWeight: '500', marginBottom: '6px' },
  alertItem: { fontSize: '12px', color: '#666', marginBottom: '2px' },
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
  confirmBtn: {
    padding: '5px 12px', background: '#3B82F6', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
  },
  deliverBtn: {
    padding: '5px 12px', background: '#22C55E', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
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
    width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1.25rem',
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