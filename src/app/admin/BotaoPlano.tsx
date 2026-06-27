'use client'
import { useTransition } from 'react'
import { setPlano } from './actions'

export function BotaoPlano({ userId, email, planoAtual }: { userId: string; email: string; planoAtual: string }) {
  const [pending, startTransition] = useTransition()
  const viraPro = planoAtual !== 'pro'

  function handleClick() {
    if (viraPro) {
      if (!confirm(`Ativar plano Pro para ${email}?`)) return
    }
    startTransition(() => setPlano(userId, viraPro ? 'pro' : 'gratuito'))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      style={{
        padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
        cursor: pending ? 'not-allowed' : 'pointer', border: '1px solid #374151',
        background: viraPro ? '#7C3AED22' : '#1F2937',
        color: viraPro ? '#A78BFA' : '#9CA3AF',
        opacity: pending ? 0.6 : 1,
      }}
    >
      {pending ? '...' : viraPro ? '↑ Pro' : '↓ Free'}
    </button>
  )
}
