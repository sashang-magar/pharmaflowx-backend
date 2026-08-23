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
        <span style={{ fontSize: '13px', color: '#555' }}>Pharmacy</span>
        <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
      </div>
    </div>
  )
}

// ─── Place Order Modal ────────────────────────────────────────
function PlaceOrderModal({ inventory, onClose, onOrdered }) {
  // cart: { [inventoryId]: { item, quantity } }
  const [cart, setCart] = useState({})
  const [distributorId, setDistributorId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // group inventory by distributor for the selector
  const distributors = [...new Map(
    inventory.map(i => [i.distributor_id, {
      id: i.distributor_id,
      name: i.distributor_name
    }])
  ).values()]

  const filteredInventory = distributorId
    ? inventory.filter(i => String(i.distributor_id) === String(distributorId))
    : []

  const updateCart = (item, qty) => {
    const quantity = parseInt(qty, 10)
    if (!qty || quantity <= 0) {
      const updated = { ...cart }
      delete updated[item.id]
      setCart(updated)
    } else {
      setCart({ ...cart, [item.id]: { item, quantity } })
    }
  }

  const cartItems = Object.values(cart)
  const totalItems = cartItems.reduce((sum, c) => sum + c.quantity, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!distributorId) {
      setError('Please select a distributor.')
      return
    }
    if (cartItems.length === 0) {
      setError('Please add at least one item to your order.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        distributor: parseInt(distributorId, 10),
        payment_method: paymentMethod,
        items: cartItems.map(c => ({
          inventory: c.item.id,
          quantity: c.quantity,
          unit_price: c.item.mrp,
        }))
      }
      await api.post('orders/', payload)
      onOrdered()
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m[0] : m}`)
          .join('\n')
        setError(msg)
      } else {
        setError('Failed to place order. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={{ ...s.modal, maxWidth: '600px' }}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Place Order</h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* Step 1 — Select distributor */}
          <div style={s.field}>
            <label style={s.label}>Step 1 — Select Distributor</label>
            <select style={s.input} value={distributorId}
              onChange={e => { setDistributorId(e.target.value); setCart({}) }}>
              <option value="">Choose distributor...</option>
              {distributors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Step 2 — Select items */}
          {distributorId && (
            <div style={s.field}>
              <label style={s.label}>Step 2 — Select Items & Quantities</label>
              {filteredInventory.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#aaa' }}>
                  No stock available from this distributor.
                </p>
              ) : (
                <div style={s.itemList}>
                  {filteredInventory.map(item => (
                    <div key={item.id} style={s.itemRow}>
                      <div style={s.itemInfo}>
                        <span style={s.itemName}>{item.medicine_name}</span>
                        <span style={s.itemMeta}>
                          Batch: {item.batch_number} •
                          Available: {item.available_quantity} •
                          MRP: Rs.{item.mrp}
                        </span>
                      </div>
                      <input
                        style={s.qtyInput}
                        type="number"
                        min="0"
                        max={item.available_quantity}
                        placeholder="Qty"
                        value={cart[item.id]?.quantity || ''}
                        onChange={e => updateCart(item, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cart summary */}
          {cartItems.length > 0 && (
            <div style={s.cartSummary}>
              <p style={s.cartTitle}>Order Summary — {cartItems.length} item type(s), {totalItems} units total</p>
              {cartItems.map(c => (
                <p key={c.item.id} style={s.cartLine}>
                  {c.item.medicine_name} × {c.quantity}
                  {' '}= Rs.{(c.quantity * parseFloat(c.item.mrp)).toFixed(2)}
                </p>
              ))}
            </div>
          )}

          {/* Payment method */}
          <div style={s.field}>
            <label style={s.label}>Payment Method</label>
            <select style={s.input} value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}>
              <option value="CASH">Cash on Delivery</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>

          <div style={s.modalFooter}>
            <button type="button" onClick={onClose} style={s.cancelBtn}>Cancel</button>
            <button type="submit" style={s.submitBtn} disabled={loading || cartItems.length === 0}>
              {loading ? 'Placing order...' : `Place Order (${totalItems} units)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Review Modal ─────────────────────────────────────────────
function ReviewModal({ order, onClose, onReviewed }) {
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('reviews/', {
        order: order.id,
        rating: parseFloat(rating),
        comment,
      })
      onReviewed()
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m[0] : m}`)
          .join('\n')
        setError(msg)
      } else {
        setError('Failed to submit review.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Review Order #{order.id}</h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Rating (1.0 – 5.0)</label>
            <select style={s.input} value={rating}
              onChange={e => setRating(e.target.value)}>
              {['5', '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1'].map(v => (
                <option key={v} value={v}>{'⭐'.repeat(Math.ceil(parseFloat(v)))} {v}</option>
              ))}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Comment</label>
            <textarea
              style={{ ...s.input, height: '80px', resize: 'vertical' }}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience..."
            />
          </div>

          <div style={s.modalFooter}>
            <button type="button" onClick={onClose} style={s.cancelBtn}>Cancel</button>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function PharmacyDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [inventory, setInventory] = useState([])
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [reviewOrder, setReviewOrder] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const [loading, setLoading] = useState({
    inventory: true, orders: true, reviews: true
  })

  const fetchInventory = async () => {
    setLoading(prev => ({ ...prev, inventory: true }))
    try {
      const res = await api.get('inventory/')
      const data = res.data.results || res.data
      // only show items with available stock
      setInventory(data.filter(i => i.available_quantity > 0))
    } catch { console.error('Failed to fetch inventory') }
    finally { setLoading(prev => ({ ...prev, inventory: false })) }
  }

  const fetchOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }))
    try {
      const res = await api.get('orders/')
      setOrders(res.data.results || res.data)
    } catch { console.error('Failed to fetch orders') }
    finally { setLoading(prev => ({ ...prev, orders: false })) }
  }

  const fetchReviews = async () => {
    setLoading(prev => ({ ...prev, reviews: true }))
    try {
      const res = await api.get('reviews/')
      setReviews(res.data.results || res.data)
    } catch { console.error('Failed to fetch reviews') }
    finally { setLoading(prev => ({ ...prev, reviews: false })) }
  }

  useEffect(() => {
    fetchInventory()
    fetchOrders()
    fetchReviews()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleCancel = async (orderId) => {
    setActionLoading(orderId)
    try {
      await api.post(`orders/${orderId}/cancel/`)
      fetchOrders()
      fetchInventory()
    } catch (err) {
      alert(err.response?.data?.detail ||
            err.response?.data?.non_field_errors?.[0] ||
            'Failed to cancel order.')
    } finally {
      setActionLoading(null)
    }
  }

  // find reviewed order ids so we don't show review button twice
  const reviewedOrderIds = new Set(reviews.map(r => r.order))

  return (
    <div style={s.page}>
      <Navbar onLogout={handleLogout} />

      <div style={s.content}>

        {/* ── Available Stock ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Available Stock</h2>
            <button style={s.primaryBtn} onClick={() => setShowOrderModal(true)}>
              + Place Order
            </button>
          </div>

          {loading.inventory ? (
            <p style={s.loading}>Loading...</p>
          ) : inventory.length === 0 ? (
            <p style={s.empty}>No stock available from distributors.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Medicine', 'Batch', 'Distributor',
                      'Available Qty', 'MRP', 'Expiry'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id} style={s.tr}>
                      <td style={s.td}>{item.medicine_name}</td>
                      <td style={s.td}>{item.batch_number}</td>
                      <td style={s.td}>{item.distributor_name}</td>
                      <td style={s.td}><strong>{item.available_quantity}</strong></td>
                      <td style={s.td}>Rs. {item.mrp}</td>
                      <td style={s.td}>{item.expiry_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── My Orders ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>My Orders</h2>
            <span style={{ fontSize: '13px', color: '#888' }}>
              {orders.length} total
            </span>
          </div>

          {loading.orders ? (
            <p style={s.loading}>Loading...</p>
          ) : orders.length === 0 ? (
            <p style={s.empty}>No orders placed yet.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Order #', 'Distributor', 'Status',
                      'Payment', 'Ordered At', 'Delivered At', 'Actions'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={s.tr}>
                      <td style={s.td}>#{order.id}</td>
                      <td style={s.td}>{order.distributor_name}</td>
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
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {/* Cancel — only for PENDING or CONFIRMED */}
                          {['PENDING', 'CONFIRMED'].includes(order.status) && (
                            <button
                              style={s.cancelOrderBtn}
                              disabled={actionLoading === order.id}
                              onClick={() => handleCancel(order.id)}
                            >
                              {actionLoading === order.id ? '...' : 'Cancel'}
                            </button>
                          )}
                          {/* Review — only for DELIVERED and not yet reviewed */}
                          {order.status === 'DELIVERED' &&
                            !reviewedOrderIds.has(order.id) && (
                            <button
                              style={s.reviewBtn}
                              onClick={() => setReviewOrder(order)}
                            >
                              Review
                            </button>
                          )}
                          {/* Already reviewed */}
                          {order.status === 'DELIVERED' &&
                            reviewedOrderIds.has(order.id) && (
                            <span style={{ fontSize: '12px', color: '#22C55E' }}>
                              ✓ Reviewed
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

        {/* ── My Reviews ── */}
        {reviews.length > 0 && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>My Reviews</h2>
            </div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Order #', 'Rating', 'Comment', 'Date'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(r => (
                    <tr key={r.id} style={s.tr}>
                      <td style={s.td}>#{r.order}</td>
                      <td style={s.td}>{'⭐'.repeat(Math.ceil(parseFloat(r.rating)))} {r.rating}</td>
                      <td style={s.td}>{r.comment || '—'}</td>
                      <td style={s.td}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {showOrderModal && (
        <PlaceOrderModal
          inventory={inventory}
          onClose={() => setShowOrderModal(false)}
          onOrdered={() => {
            fetchOrders()
            fetchInventory()
          }}
        />
      )}

      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onReviewed={() => {
            fetchReviews()
            fetchOrders()
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
  cancelOrderBtn: {
    padding: '5px 12px', background: '#EF4444', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
  },
  reviewBtn: {
    padding: '5px 12px', background: '#F59E0B', color: '#fff',
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
    width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
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
  itemList: {
    border: '1px solid #e0e0e0', borderRadius: '8px',
    overflow: 'hidden',
  },
  itemRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '10px 12px',
    borderBottom: '1px solid #f0f0f0',
  },
  itemInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  itemName: { fontSize: '13px', fontWeight: '500' },
  itemMeta: { fontSize: '11px', color: '#888' },
  qtyInput: {
    width: '70px', padding: '6px 8px',
    border: '1px solid #e0e0e0', borderRadius: '6px',
    fontSize: '13px', outline: 'none', textAlign: 'center',
  },
  cartSummary: {
    background: '#f9f9f7', borderRadius: '8px',
    padding: '12px', marginBottom: '1rem',
    border: '1px solid #e0e0e0',
  },
  cartTitle: { fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  cartLine: { fontSize: '12px', color: '#444', marginBottom: '3px' },
}