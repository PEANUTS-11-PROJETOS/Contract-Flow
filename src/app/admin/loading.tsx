function Sk({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: '#1F2937', animation: 'pulse 1.4s ease-in-out infinite' }} />
}

export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F1117', color: '#E5E7EB' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1F2937', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', background: '#161B25' }}>
        <Sk w={140} h={18} r={6} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 40 }}>
        <Sk w={220} h={24} r={7} />
        <div style={{ marginTop: 6 }}><Sk w={280} h={13} r={5} /></div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, margin: '32px 0 36px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ padding: 18, borderRadius: 12, background: '#161B25', border: '1px solid #1F2937' }}>
              <Sk w={24} h={24} r={6} />
              <div style={{ marginTop: 10 }}><Sk w="70%" h={10} r={4} /></div>
              <div style={{ marginTop: 8 }}><Sk w="55%" h={22} r={5} /></div>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div style={{ borderRadius: 12, background: '#161B25', border: '1px solid #1F2937' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #1F2937' }}>
            <Sk w={120} h={14} r={5} />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1F2937' }}>
              <Sk w={32} h={32} r={8} />
              <Sk w={180} h={13} r={5} />
              <Sk w={80} h={13} r={5} />
              <Sk w={60} h={22} r={20} />
              <Sk w={40} h={13} r={5} />
              <Sk w={50} h={22} r={20} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
