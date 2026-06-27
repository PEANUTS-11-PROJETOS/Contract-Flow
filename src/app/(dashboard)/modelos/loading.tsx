function Sk({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--card-border)', animation: 'pulse 1.4s ease-in-out infinite' }} />
}

export default function Loading() {
  return (
    <div style={{ maxWidth: 800 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <Sk w={120} h={26} r={7} />
      <div style={{ marginTop: 6 }}><Sk w={240} h={12} r={5} /></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 28 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ padding: 24, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
            <Sk w={44} h={44} r={12} />
            <div style={{ marginTop: 14 }}><Sk w="60%" h={16} r={6} /></div>
            <div style={{ marginTop: 8 }}><Sk w="90%" h={11} r={5} /></div>
            <div style={{ marginTop: 4 }}><Sk w="75%" h={11} r={5} /></div>
            <div style={{ marginTop: 20 }}><Sk w={120} h={34} r={9} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}
