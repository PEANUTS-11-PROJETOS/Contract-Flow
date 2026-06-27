function Sk({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--card-border)', animation: 'pulse 1.4s ease-in-out infinite' }} />
}

export default function Loading() {
  return (
    <div style={{ maxWidth: 800 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Sk w={100} h={26} r={7} />
        <Sk w={200} h={36} r={9} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ padding: 20, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Sk w={48} h={48} r={12} />
              <div style={{ flex: 1 }}>
                <Sk w="40%" h={14} r={5} />
                <div style={{ marginTop: 8 }}><Sk w="25%" h={10} r={5} /></div>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                {[1, 2, 3].map(j => (
                  <div key={j} style={{ textAlign: 'right' }}>
                    <Sk w={50} h={16} r={5} />
                    <div style={{ marginTop: 6 }}><Sk w={40} h={10} r={5} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
