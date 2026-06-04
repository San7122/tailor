'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase, type Order, type OrderStatus } from '@/lib/supabase'

const PIPELINE: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'BOOKED',         label: 'New',       icon: '📋' },
  { status: 'RIDER_ASSIGNED', label: 'Rider Out',  icon: '🏍️' },
  { status: 'INWARDED',       label: 'At Hub',    icon: '📦' },
  { status: 'CUTTING',        label: 'Cutting',   icon: '✂️' },
  { status: 'STITCHING',      label: 'Stitching', icon: '🪡' },
  { status: 'QA_CHECK',       label: 'QA',        icon: '🔍' },
  { status: 'DISPATCHED',     label: 'Out',       icon: '🚀' },
  { status: 'DELIVERED',      label: 'Done',      icon: '✅' },
]

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  BOOKED: 'RIDER_ASSIGNED', RIDER_ASSIGNED: 'INWARDED', INWARDED: 'CUTTING',
  CUTTING: 'STITCHING', STITCHING: 'QA_CHECK', QA_CHECK: 'DISPATCHED', DISPATCHED: 'DELIVERED',
}

function timeAgo(date: string) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

export default function HubDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL')

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, customers(full_name, phone_number, sector), service_types(name, category, base_price, estimated_hours), riders(full_name)')
      .neq('order_status', 'DELIVERED')
      .order('created_at', { ascending: false })
      .limit(100)
    setOrders((data as Order[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
    const channel = supabase
      .channel('hub-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchOrders])

  const advanceOrder = async (order: Order) => {
    const next = NEXT_STATUS[order.order_status]
    if (!next) return
    setAdvancing(order.id)
    await supabase.from('orders').update({ order_status: next }).eq('id', order.id)

    // Send WhatsApp notification
    try {
      await fetch('/api/orders/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, newStatus: next }),
      })
    } catch (err) {
      console.error('Failed to send notification:', err)
    }

    setAdvancing(null)
    fetchOrders()
  }

  const filteredOrders = selectedStatus === 'ALL' ? orders : orders.filter(o => o.order_status === selectedStatus)
  const countByStatus = (s: OrderStatus) => orders.filter(o => o.order_status === s).length
  const totalRevenue = orders.reduce((sum, o) => sum + o.price, 0)

  return (
    <div className="min-h-dvh bg-[#060d0a]">
      <header className="bg-[#0a1713]/90 backdrop-blur border-b border-[#D4AF37]/10 px-4 md:px-8 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏭</span>
            <div>
              <h1 className="text-base font-bold">QuickStitch Hub</h1>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-widest">DWARKA OPERATIONS</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm bg-emerald-900/30 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold text-xs">Live</span>
            </div>
            <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Home</Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 md:px-8 py-4 grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Active', value: orders.length, color: 'text-white' },
          { label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-[#D4AF37]' },
          { label: 'At Hub', value: countByStatus('INWARDED'), color: 'text-orange-400' },
          { label: 'Stitching', value: countByStatus('STITCHING'), color: 'text-purple-400' },
          { label: 'QA', value: countByStatus('QA_CHECK'), color: 'text-yellow-400' },
          { label: 'Dispatched', value: countByStatus('DISPATCHED'), color: 'text-teal-400' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-3 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="px-4 md:px-8 mb-4 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          <button onClick={() => setSelectedStatus('ALL')} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selectedStatus === 'ALL' ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#D4AF37]' : 'border-[#D4AF37]/10 text-gray-500'}`}>
            All ({orders.length})
          </button>
          {PIPELINE.map(p => (
            <button key={p.status} onClick={() => setSelectedStatus(p.status)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selectedStatus === p.status ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#D4AF37]' : 'border-[#D4AF37]/10 text-gray-500'}`}>
              {p.icon} {p.label} {countByStatus(p.status) > 0 ? `(${countByStatus(p.status)})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div className="px-4 md:px-8 pb-8">
        {loading && <div className="text-center py-12 text-gray-500 text-sm">Loading orders...</div>}
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-gray-400 text-sm">No orders in this stage.</p>
          </div>
        )}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="glass-card rounded-2xl p-4 flex flex-col gap-3 hover:border-[#D4AF37]/30 transition-all animate-fade-up">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-gray-600">#…{order.id.slice(-6).toUpperCase()}</p>
                  <p className="font-bold text-sm">{order.customers?.full_name}</p>
                  <p className="text-xs text-gray-500">{order.customers?.sector} · {order.customers?.phone_number}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border status-${order.order_status}`}>
                  {order.order_status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="bg-[#060d0a]/60 rounded-xl p-3">
                <p className="text-xs font-semibold text-[#D4AF37]">{order.service_types?.name}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{order.reference_garment_notes}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#D4AF37] font-bold">₹{order.price}</p>
                  <p className="text-[10px] text-gray-600">{timeAgo(order.created_at)}</p>
                </div>
                {NEXT_STATUS[order.order_status] && (
                  <button
                    onClick={() => advanceOrder(order)}
                    disabled={advancing === order.id}
                    className="px-3 py-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold hover:bg-[#D4AF37]/20 transition-all disabled:opacity-50"
                  >
                    {advancing === order.id ? '...' : `→ ${NEXT_STATUS[order.order_status]?.replace(/_/g, ' ')}`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
