'use client'

export function LimiteBanner() {
  return (
    <div style={{
      background: '#FEF3C7', border: '1px solid #FCD34D',
      borderRadius: 14, padding: '36px 32px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#92400E', marginBottom: 10 }}>
        Limite de 5 contratos atingido
      </h2>
      <p style={{ fontSize: 14, color: '#78350F', lineHeight: 1.6, marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
        O plano Gratuito permite até 5 contratos. Faça upgrade para o plano Pro e crie contratos ilimitados por apenas R$ 29,90/mês.
      </p>
      <a
        href="https://wa.me/5511989408375?text=Olá!%20Quero%20assinar%20o%20plano%20Pro%20do%20ContractFlow."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block', padding: '12px 28px', borderRadius: 10,
          background: '#1E9E6A', color: '#fff', fontWeight: 700, fontSize: 15,
          textDecoration: 'none',
        }}
      >
        💬 Assinar Pro via WhatsApp
      </a>
    </div>
  )
}
