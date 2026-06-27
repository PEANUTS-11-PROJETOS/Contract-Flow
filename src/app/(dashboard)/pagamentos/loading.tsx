function Sk({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--card-border)', animation: 'pulse 1.4s ease-in-out infinite' }} />
}

export default function Loading() {
  return (
    <div style={{ maxWidth: 800 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <Sk w={140} h={26} r={7} />
      <div style={{ marginTop: 6 }}><Sk w={200} h={12} r={5} /></div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, margin: '24px 0' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ padding: 18, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
            <Sk w={80} h={11} r={5} />
            <div style={{ marginTop: 10 }}><Sk w={100} h={24} r={6} /></div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ padding: 20, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
        <Sk w={120} h={13} r={5} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', gap: 14, marginTop: 20 }}>
            <Sk w={10} h={10} r={5} />
            <div style={{ flex: 1 }}>
              <Sk w="45%" h={13} r={5} />
              <div style={{ marginTop: 6 }}><Sk w="30%" h={10} r={5} /></div>
            </div>
            <Sk w={70} h={28} r={7} />
          </div>
        ))}
      </div>
    </div>
  )
}
