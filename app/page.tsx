import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#060d0a] flex flex-col">

      {/* NAV */}
      <nav className="sticky top-0 z-20 bg-[#060d0a]/80 backdrop-blur border-b border-[#D4AF37]/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <div>
              <span className="text-base font-bold text-white">QuickStitch</span>
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest block leading-none">DELHI</span>
            </div>
          </div>
          <Link
            href="/book"
            className="bg-[#D4AF37] text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-yellow-400 transition-all"
          >
            Book Now
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto w-full">

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-1.5 rounded-full mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Now serving Dwarka, Delhi
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6 animate-fade-up" style={{animationDelay:'0.05s'}}>
          Your tailor,<br />
          <span className="text-[#D4AF37]">at your door.</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed animate-fade-up" style={{animationDelay:'0.1s'}}>
          30-minute fabric pickup. 48-hour perfect-fit delivery.
          No boutique visits. No measurement guesswork.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{animationDelay:'0.15s'}}>
          <Link
            href="/book"
            className="px-8 py-4 bg-[#D4AF37] text-black font-bold text-base rounded-2xl hover:bg-yellow-400 transition-all glow-pulse"
          >
            Book a Pickup →
          </Link>
          <a
            href="https://wa.me/919999999999?text=Hi%2C%20I%27d%20like%20to%20book%20a%20stitching%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 glass-card text-white font-semibold text-base rounded-2xl hover:border-[#D4AF37]/40 transition-all"
          >
            💬 WhatsApp Us
          </a>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
        <h2 className="text-center text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-10">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: '📱', step: '01', title: 'Book Online', desc: 'Pick your service and schedule a pickup in under 2 minutes.' },
            { icon: '🏍️', step: '02', title: 'Rider Arrives', desc: 'Our rider picks up your fabric + a reference garment from your home in 30 min.' },
            { icon: '✂️', step: '03', title: 'Hub Stitches', desc: 'Expert cutters and tailors stitch to your exact fit at our Dwarka dark hub.' },
            { icon: '📦', step: '04', title: 'Delivered Back', desc: 'Steam-pressed in a premium canvas bag, back at your door in 48 hours.' },
          ].map((s) => (
            <div key={s.step} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{s.icon}</span>
                <span className="text-4xl font-black text-[#D4AF37]/20">{s.step}</span>
              </div>
              <h3 className="font-bold text-white mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
        <h2 className="text-center text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-10">Services & Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Ladies Kurta', price: '₹899', time: '48h', cat: 'Stitching' },
            { name: 'Salwar Suit (Full Set)', price: '₹1,299', time: '48h', cat: 'Stitching' },
            { name: 'Lehenga Blouse', price: '₹1,499', time: '48h', cat: 'Stitching' },
            { name: 'Gents Shirt', price: '₹699', time: '48h', cat: 'Stitching' },
            { name: 'Hemming / Tapering', price: '₹199', time: '12h', cat: 'Alteration' },
            { name: 'Waist Adjustment', price: '₹249', time: '12h', cat: 'Alteration' },
            { name: 'Zipper Replacement', price: '₹299', time: '12h', cat: 'Alteration' },
            { name: 'Premium Express', price: '₹1,799', time: '24h', cat: 'Express' },
            { name: 'Bridal Blouse (Designer)', price: '₹2,499', time: '36h', cat: 'Bridal' },
          ].map((s) => (
            <Link
              href="/book"
              key={s.name}
              className="glass-card rounded-xl p-4 flex items-center justify-between hover:border-[#D4AF37]/40 transition-all group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-500 mb-1 block">{s.cat}</span>
                <p className="font-semibold text-sm text-white group-hover:text-[#D4AF37] transition-colors">{s.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">⏱ {s.time} turnaround</p>
              </div>
              <span className="text-[#D4AF37] font-bold text-base ml-4 whitespace-nowrap">{s.price}</span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/book" className="inline-block px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-yellow-400 transition-all">
            Book Any Service →
          </Link>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-t border-[#D4AF37]/10 px-6 py-10">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🏍️', label: '30-Min Pickup' },
            { icon: '📐', label: 'Perfect Fit Guarantee' },
            { icon: '💎', label: 'Premium Packaging' },
            { icon: '🔄', label: 'Free Alteration Trial' },
          ].map((t) => (
            <div key={t.label}>
              <div className="text-2xl mb-2">{t.icon}</div>
              <p className="text-xs font-semibold text-gray-300">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#D4AF37]/10 px-6 py-6 text-center">
        <p className="text-xs text-gray-600">© 2026 QuickStitch Delhi · Dwarka, New Delhi</p>
        <div className="flex justify-center gap-6 mt-2 text-xs text-gray-700">
          <Link href="/book" className="hover:text-[#D4AF37]">Book</Link>
          <Link href="/hub" className="hover:text-[#D4AF37]">Hub Dashboard</Link>
          <Link href="/rider" className="hover:text-[#D4AF37]">Rider View</Link>
        </div>
      </footer>

    </div>
  )
}
