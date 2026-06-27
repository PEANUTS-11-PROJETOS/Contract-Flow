function Sk({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--card-border)', animation: 'pulse 1.4s ease-in-out infinite' }} />
}

export default function Loading() {
  return (
    <div style={{ maxWidth: 800 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Sk w={160} h={26} r={7} />
        <Sk w={130} h={36} r={9} />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[80, 70, 80, 75].map((w, i) => <Sk key={i} w={w} h={32} r={20} />)}
      </div>

      {/* Lista */}
      <div style={{ borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
        {[1, 2, 3, 4, 5].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: '1px solid var(--card-border)' }}>
            <Sk w={40} h={40} r={10} />
            <div style={{ flex: 1.5 }}>
              <Sk w="60%" h={13} r={5} />
              <div style={{ marginTop: 6 }}><Sk w="35%" h={10} r={5} /></div>
            </div>
            <div style={{ flex: 1 }}>
              <Sk w="50%" h={13} r={5} />
            </div>
            <Sk w={60} h={22} r={20} />
          </div>
        ))}
      </div>
    </div>
  )
}
