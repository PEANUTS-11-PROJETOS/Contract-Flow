'use client'

export function BotaoPrint() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: '10px 20px', borderRadius: 9, fontSize: 14, fontWeight: 700,
        color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer',
      }}
    >
      🖨️ Salvar PDF
    </button>
  )
}
