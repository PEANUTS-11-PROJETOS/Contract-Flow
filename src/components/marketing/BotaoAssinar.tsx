'use client'
import { useState } from 'react'

export function BotaoAssinar() {
  const [loading, setLoading] = useState(false)

  async function assinar() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        // Fallback WhatsApp se não estiver logado
        window.open(
          'https://wa.me/5511989408375?text=Olá!%20Quero%20assinar%20o%20plano%20Pro%20do%20ContractFlow.',
          '_blank'
        )
      }
    } catch {
      window.open(
        'https://wa.me/5511989408375?text=Olá!%20Quero%20assinar%20o%20plano%20Pro%20do%20ContractFlow.',
        '_blank'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={assinar}
      disabled={loading}
      style={{
        display: 'block', width: '100%', textAlign: 'center',
        padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
        color: 'var(--primary)', background: '#fff', border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 28,
        opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
      }}
    >
      {loading ? 'Redirecionando...' : 'Assinar agora'}
    </button>
  )
}
