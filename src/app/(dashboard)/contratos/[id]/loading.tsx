function Sk({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--card-border)', animation: 'pulse 1.4s ease-in-out infinite' }} />
}

export default function Loading() {
  return (
    <div style={{ maxWidth: 880 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <Sk w={80} h={13} r={6} />

      {/* Header card */}
      <div style={{ padding: 24, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)', margin: '20px 0' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Sk w={60} h={60} r={14} />
          <div style={{ flex: 1 }}>
            <Sk w="40%" h={20} r={6} />
            <div style={{ marginTop: 8 }}><Sk w="60%" h={12} r={5} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Sk w={80} h={34} r={9} />
            <Sk w={90} h={34} r={9} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Partes */}
          <div style={{ padding: 20, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
            <Sk w={120} h={12} r={5} />
            <div style={{ marginTop: 16 }}><Sk w="100%" h={70} r={10} /></div>
            <div style={{ marginTop: 12 }}><Sk w="100%" h={70} r={10} /></div>
          </div>
          {/* Pagamentos */}
          <div style={{ padding: 20, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
            <Sk w={160} h={12} r={5} />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <Sk w={10} h={10} r={5} />
                <div style={{ flex: 1 }}>
                  <Sk w="50%" h={12} r={5} />
                  <div style={{ marginTop: 6 }}><Sk w="30%" h={10} r={5} /></div>
                </div>
                <Sk w={60} h={24} r={7} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ padding: 20, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
            <Sk w={80} h={12} r={5} />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <Sk w="40%" h={12} r={5} />
                <Sk w="30%" h={12} r={5} />
              </div>
            ))}
          </div>
          <Sk w="100%" h={100} r={13} />
        </div>
      </div>
    </div>
  )
}
