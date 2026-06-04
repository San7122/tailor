'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, type Order } from '@/lib/supabase'

export default function RiderView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)

  const fetchRiderOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, customers(full_name, phone_number, delivery_address, sector), service_types(name)')
      .in('order_status', ['RIDER_ASSIGNED', 'DISPATCHED'])
      .order('created_at', { ascending: true })
    setOrders((data as Order[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRiderOrders()
    const channel = supabase
      .channel('rider-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchRiderOrders)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const completeJob = async (order: Order) => {
    const next = order.order_status === 'RIDER_ASSIGNED' ? 'INWARDED' : 'DELIVERED'
    setCompleting(order.id)
    await supabase.from('orders').update({ order_status: next }).eq('id', order.id)
    setCompleting(null)
    fetchRiderOrders()
  }

  const openMaps = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Dwarka, Delhi')}`, '_blank')
  }

  return (
    <div className="min-h-dvh bg-[#060d0a]">
      <header className="bg-[#0a1713] border-b border-[#D4AF37]/10 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏍️</span>
            <div>
              <h1 className="text-base font-bold">Rider Dashboard</h1>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-widest">QUICKSTITCH DELIVERY</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold">ONLINE</span>
            </div>
            <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">← Home</Link>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="glass-card rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-[#D4AF37]">{orders.length}</p>
            <p className="text-xs text-gray-400">Active Jobs</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-amber-400">{orders.filter(o => o.order_status === 'RIDER_ASSIGNED').length} Pickups</p>
            <p className="text-sm font-semibold text-teal-400">{orders.filter(o => o.order_status === 'DISPATCHED').length} Deliveries</p>
          </div>
        </div>

        {loading && <p className="text-center text-gray-500 text-sm py-8">Loading jobs...</p>}
        {!loading && orders.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl">
            <p className="text-4xl mb-3">😴</p>
            <p className="text-gray-400 text-sm">No active jobs right now.</p>
            <p className="text-gray-600 text-xs mt-1">New pickups appear here automatically.</p>
          </div>
        )}

        <div className="space-y-4">
          {orders.map(order => {
            const isPickup = order.order_status === 'RIDER_ASSIGNED'
            return (
              <div key={order.id} className={`glass-card rounded-2xl p-4 border-l-4 ${isPickup ? 'border-l-amber-400' : 'border-l-teal-400'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isPickup ? 'bg-amber-900/30 border-amber-500/30 text-amber-400' : 'bg-teal-900/30 border-teal-500/30 text-teal-400'}`}>
                    {isPickup ? '📦 PICKUP JOB' : '🚀 DELIVERY JOB'}
                  </span>
                  <span className="text-xs font-mono text-gray-600">#…{order.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="mb-3">
                  <p className="font-bold text-white">{order.customers?.full_name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{order.customers?.sector}</p>
                  <p className="text-xs text-gray-500 mt-1">{order.pickup_address || order.customers?.delivery_address}</p>
                </div>
                <div className="bg-[#060d0a]/60 rounded-xl p-3 mb-4">
                  <p className="text-xs text-[#D4AF37] font-semibold">{order.service_types?.name}</p>
                  {isPickup && <p className="text-xs text-gray-500 mt-1">📌 Collect: fabric bag + reference garment from wardrobe</p>}
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${order.customers?.phone_number}`} className="flex-1 py-2.5 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold text-center hover:bg-[#D4AF37]/5 transition-all">
                    📞 Call
                  </a>
                  <button onClick={() => openMaps(order.pickup_address || order.customers?.delivery_address || '')} className="flex-1 py-2.5 rounded-xl border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-900/10 transition-all">
                    🗺️ Navigate
                  </button>
                  <button
                    onClick={() => completeJob(order)}
                    disabled={completing === order.id}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${isPickup ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20' : 'bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20'}`}
                  >
                    {completing === order.id ? '...' : isPickup ? '✅ Collected' : '✅ Delivered'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
