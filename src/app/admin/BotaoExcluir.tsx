'use client'
import { useTransition } from 'react'
import { deletarUsuario } from './actions'

export function BotaoExcluir({ userId, email }: { userId: string; email: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Excluir a conta de ${email}?\n\nIsso apagará todos os contratos e pagamentos. Esta ação não pode ser desfeita.`)) return
    startTransition(() => deletarUsuario(userId))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      style={{
        padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
        cursor: pending ? 'not-allowed' : 'pointer', border: '1px solid #374151',
        background: '#F8717111', color: '#F87171', opacity: pending ? 0.6 : 1,
      }}
    >
      {pending ? '...' : '🗑 Excluir'}
    </button>
  )
}
