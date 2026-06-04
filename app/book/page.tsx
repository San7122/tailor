'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, type ServiceType } from '@/lib/supabase'

const STEPS = ['Service', 'Details', 'Address', 'Confirm']

export default function CustomerBookingPage() {
  const [step, setStep] = useState(0)
  const [services, setServices] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    pickup_address: '',
    sector: '',
    service_type_id: '',
    selected_service: null as ServiceType | null,
    reference_garment_notes: '',
    special_instructions: '',
    payment_method: 'UPI',
  })

  useEffect(() => {
    supabase
      .from('service_types')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .then(({ data }) => setServices(data || []))
  }, [])

  const categories = ['stitching', 'alteration', 'express']
  const categoryLabels: Record<string, string> = {
    stitching: '✂️ Custom Stitching',
    alteration: '🪡 Express Alterations',
    express: '⚡ Premium & Bridal',
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      let { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone_number', form.phone_number)
        .single()

      if (!customer) {
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert({
            full_name: form.full_name,
            phone_number: form.phone_number,
            whatsapp_number: form.phone_number,
            delivery_address: form.pickup_address,
            sector: form.sector,
          })
          .select('id')
          .single()
        customer = newCustomer
      }

      const { data: hub } = await supabase
        .from('hubs')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()

      await supabase.from('orders').insert({
        customer_id: customer?.id,
        hub_id: hub?.id,
        service_type_id: form.service_type_id,
        order_status: 'BOOKED',
        price: form.selected_service?.base_price,
        payment_method: form.payment_method,
        payment_status: form.payment_method === 'UPI' ? 'PAID' : 'PENDING',
        reference_garment_notes: form.reference_garment_notes,
        special_instructions: form.special_instructions || null,
        pickup_address: form.pickup_address,
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setStep(0)
    setForm({ full_name: '', phone_number: '', pickup_address: '', sector: '', service_type_id: '', selected_service: null, reference_garment_notes: '', special_instructions: '', payment_method: 'UPI' })
  }

  if (submitted) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4 bg-[#060d0a]">
        <div className="glass-card rounded-2xl p-8 max-w-sm w-full text-center animate-fade-up">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">Order Placed!</h2>
          <p className="text-gray-400 text-sm mb-6">Our rider is on the way to pick up your fabric. You'll get a WhatsApp update shortly.</p>
          <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-xl p-4 mb-6">
            <p className="text-emerald-400 text-sm font-semibold">✅ 30-min Pickup Guaranteed</p>
            <p className="text-emerald-400 text-sm font-semibold mt-1">✅ 48-hour Perfect Fit Delivery</p>
          </div>
          <button onClick={resetForm} className="w-full py-3 rounded-xl bg-[#D4AF37] text-black font-bold text-sm hover:bg-yellow-400 transition-all">
            Book Another Order
          </button>
          <Link href="/" className="block mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors">← Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#060d0a] flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a1713]/90 backdrop-blur border-b border-[#D4AF37]/10 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <div>
              <h1 className="text-base font-bold leading-none text-white">QuickStitch</h1>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-widest">DWARKA DELHI</p>
            </div>
          </Link>
          <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
            🟢 Open Now
          </span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= step ? 'bg-[#D4AF37] text-black' : 'bg-[#1d302a] text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i <= step ? 'text-[#D4AF37]' : 'text-gray-600'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px transition-all ${i < step ? 'bg-[#D4AF37]' : 'bg-[#1d302a]'}`} />}
            </div>
          ))}
        </div>

        {/* STEP 0: Pick a Service */}
        {step === 0 && (
          <div className="animate-fade-up">
            <h2 className="text-xl font-bold mb-1">What do you need?</h2>
            <p className="text-gray-400 text-sm mb-5">Select a service to get started.</p>
            {services.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">Loading services...</p>
            )}
            {categories.map(cat => (
              <div key={cat} className="mb-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-3">{categoryLabels[cat]}</h3>
                <div className="space-y-2">
                  {services.filter(s => s.category === cat).map(service => (
                    <button
                      key={service.id}
                      onClick={() => { setForm(f => ({ ...f, service_type_id: service.id, selected_service: service })); setStep(1) }}
                      className="w-full glass-card rounded-xl p-4 flex items-center justify-between hover:border-[#D4AF37]/40 transition-all text-left group"
                    >
                      <div>
                        <p className="font-semibold text-sm text-white group-hover:text-[#D4AF37] transition-colors">{service.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">⏱ {service.estimated_hours}h turnaround</p>
                      </div>
                      <span className="text-[#D4AF37] font-bold text-base ml-4">₹{service.base_price}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Garment Details */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h2 className="text-xl font-bold mb-1">Garment Details</h2>
            <p className="text-gray-400 text-sm mb-5">Tell us about your fabric and reference garment.</p>
            <div className="glass-card rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#D4AF37] mb-1">Selected</p>
              <p className="text-white font-semibold">{form.selected_service?.name}</p>
              <p className="text-gray-400 text-sm">₹{form.selected_service?.base_price} · {form.selected_service?.estimated_hours}h delivery</p>
            </div>
            <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 mb-5">
              <p className="text-amber-400 text-xs font-bold mb-1">💡 The Reference Garment Tip</p>
              <p className="text-amber-300/70 text-xs">Keep a well-fitting garment ready. Our rider will collect it. We copy the exact fit and return it with your new outfit.</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Reference Garment Description *</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Pink cotton kurta from my closet — use for size reference"
                  value={form.reference_garment_notes}
                  onChange={e => setForm(f => ({ ...f, reference_garment_notes: e.target.value }))}
                  className="w-full bg-[#0a1713] border border-[#D4AF37]/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/40 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Special Instructions (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Make neck 1 inch deeper"
                  value={form.special_instructions}
                  onChange={e => setForm(f => ({ ...f, special_instructions: e.target.value }))}
                  className="w-full bg-[#0a1713] border border-[#D4AF37]/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/40"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border border-[#D4AF37]/20 text-gray-400 text-sm font-semibold hover:border-[#D4AF37]/40 transition-all">← Back</button>
              <button disabled={!form.reference_garment_notes} onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl bg-[#D4AF37] text-black text-sm font-bold disabled:opacity-40 hover:bg-yellow-400 transition-all">Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 2: Address & Contact */}
        {step === 2 && (
          <div className="animate-fade-up">
            <h2 className="text-xl font-bold mb-1">Pickup Address</h2>
            <p className="text-gray-400 text-sm mb-5">Where should our rider come?</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full Name *</label>
                <input type="text" placeholder="Priya Malhotra" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="w-full bg-[#0a1713] border border-[#D4AF37]/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/40" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">WhatsApp Number *</label>
                <input type="tel" placeholder="9810000001" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} className="w-full bg-[#0a1713] border border-[#D4AF37]/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/40" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full Pickup Address *</label>
                <textarea rows={2} placeholder="Flat 204, Pushpanjali Apartments, Sector 11, Dwarka" value={form.pickup_address} onChange={e => setForm(f => ({ ...f, pickup_address: e.target.value }))} className="w-full bg-[#0a1713] border border-[#D4AF37]/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/40 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Dwarka Sector</label>
                <select value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} className="w-full bg-[#0a1713] border border-[#D4AF37]/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/40">
                  <option value="">Select your Sector</option>
                  {['Sector 1','Sector 2','Sector 4','Sector 6','Sector 7','Sector 10','Sector 11','Sector 12','Sector 13','Sector 14','Sector 18','Sector 19','Sector 22','Sector 23','Palam'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Payment Method</label>
                <div className="flex gap-3">
                  {['UPI', 'COD'].map(m => (
                    <button key={m} onClick={() => setForm(f => ({ ...f, payment_method: m }))} className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${form.payment_method === m ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]' : 'border-[#D4AF37]/15 text-gray-500 hover:border-[#D4AF37]/30'}`}>
                      {m === 'UPI' ? '📱 UPI' : '💵 Cash on Delivery'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-[#D4AF37]/20 text-gray-400 text-sm font-semibold">← Back</button>
              <button disabled={!form.full_name || !form.phone_number || !form.pickup_address} onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-[#D4AF37] text-black text-sm font-bold disabled:opacity-40 hover:bg-yellow-400 transition-all">Review →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm */}
        {step === 3 && (
          <div className="animate-fade-up">
            <h2 className="text-xl font-bold mb-1">Review & Confirm</h2>
            <p className="text-gray-400 text-sm mb-5">Everything look correct?</p>
            <div className="glass-card rounded-xl p-5 space-y-3 mb-5">
              {[
                ['Service', form.selected_service?.name],
                ['Reference Garment', form.reference_garment_notes],
                ['Name', form.full_name],
                ['WhatsApp', form.phone_number],
                ['Pickup at', form.pickup_address],
                ['Payment', form.payment_method],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-400 shrink-0">{label}</span>
                  <span className="font-semibold text-right max-w-[55%]">{val}</span>
                </div>
              ))}
              <div className="border-t border-[#D4AF37]/10 pt-3 flex justify-between">
                <span className="font-bold text-[#D4AF37]">Total</span>
                <span className="font-bold text-[#D4AF37] text-lg">₹{form.selected_service?.base_price}</span>
              </div>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 mb-5 text-sm text-emerald-400">
              🏍️ Rider arrives within <strong>30 minutes</strong> · Delivery in <strong>{form.selected_service?.estimated_hours} hours</strong>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-[#D4AF37]/20 text-gray-400 text-sm font-semibold">← Back</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 rounded-xl bg-[#D4AF37] text-black text-sm font-bold disabled:opacity-60 hover:bg-yellow-400 transition-all glow-pulse">
                {loading ? 'Placing...' : '✅ Confirm Order'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto w-full px-4 py-8 text-center">
        <p className="text-xs text-gray-600">💎 Premium stitching · Perfect fit guarantee · Dwarka Delhi</p>
      </div>
    </div>
  )
}
