function Sk({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--card-border)', animation: 'pulse 1.4s ease-in-out infinite' }} />
}

export default function Loading() {
  return (
    <div style={{ maxWidth: 560 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <Sk w={160} h={26} r={7} />
      <div style={{ marginTop: 6 }}><Sk w={240} h={12} r={5} /></div>
      <div style={{ marginTop: 28, padding: 24, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
        <Sk w={80} h={13} r={5} />
        <div style={{ marginTop: 20 }}><Sk w="100%" h={42} r={9} /></div>
        <div style={{ marginTop: 16 }}><Sk w="100%" h={42} r={9} /></div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}><Sk w={120} h={36} r={9} /></div>
      </div>
    </div>
  )
}
