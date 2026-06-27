function Sk({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--card-border)', animation: 'pulse 1.4s ease-in-out infinite' }} />
}

export default function Loading() {
  return (
    <div style={{ maxWidth: 900 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ padding: 20, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
            <Sk w={80} h={12} r={6} />
            <div style={{ marginTop: 14 }}><Sk w={100} h={28} r={6} /></div>
            <div style={{ marginTop: 8 }}><Sk w={60} h={10} r={5} /></div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div style={{ padding: 24, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)', marginBottom: 24 }}>
        <Sk w={140} h={14} r={6} />
        <div style={{ marginTop: 20 }}><Sk w="100%" h={180} r={10} /></div>
      </div>

      {/* Linha inferior */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[1, 2].map(i => (
          <div key={i} style={{ padding: 20, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
            <Sk w={120} h={13} r={6} />
            {[1, 2, 3].map(j => (
              <div key={j} style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
                <Sk w={36} h={36} r={9} />
                <div style={{ flex: 1 }}>
                  <Sk w="70%" h={12} r={5} />
                  <div style={{ marginTop: 6 }}><Sk w="45%" h={10} r={5} /></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
