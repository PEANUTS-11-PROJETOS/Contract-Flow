function Sk({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--card-border)', animation: 'pulse 1.4s ease-in-out infinite' }} />
}

export default function Loading() {
  return (
    <div style={{ maxWidth: 800 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <Sk w={180} h={26} r={7} />
          <div style={{ marginTop: 8 }}><Sk w={120} h={12} r={5} /></div>
        </div>
        <Sk w={120} h={36} r={9} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ padding: 18, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
            <Sk w={90} h={11} r={5} />
            <div style={{ marginTop: 10 }}><Sk w={110} h={28} r={6} /></div>
          </div>
        ))}
      </div>

      <div style={{ padding: 20, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)', marginBottom: 20 }}>
        <Sk w={140} h={13} r={5} />
        <div style={{ marginTop: 16 }}><Sk w="100%" h={160} r={8} /></div>
      </div>

      <div style={{ padding: 20, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
        <Sk w={160} h={13} r={5} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 16 }}>
            <Sk w={40} h={40} r={10} />
            <div style={{ flex: 1 }}><Sk w="55%" h={13} r={5} /></div>
            <Sk w={80} h={13} r={5} />
          </div>
        ))}
      </div>
    </div>
  )
}
