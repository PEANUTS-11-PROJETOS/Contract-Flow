'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

const inputCls = 'w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all'
const inputStyle = { borderColor: 'var(--input-border)', background: 'var(--bg)' }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{label}</label>
      {children}
    </div>
  )
}

function focus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = 'var(--primary)'
}
function blur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = 'var(--input-border)'
}

export default function NovoPagamentoPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    status: 'pendente',
    data_vencimento: '',
    data_pagamento: '',
    forma_pagamento: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const valor = Number(form.valor.replace(',', '.'))
    if (!valor || valor <= 0) {
      toast.error('Informe um valor válido.')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('pagamentos').insert({
      contrato_id: id,
      user_id: user.id,
      descricao: form.descricao || null,
      valor,
      status: form.status,
      data_vencimento: form.data_vencimento || null,
      data_pagamento: form.status === 'pago' ? (form.data_pagamento || null) : null,
      forma_pagamento: form.forma_pagamento || null,
    })

    setLoading(false)

    if (error) {
      toast.error('Erro ao registrar pagamento.')
      return
    }

    toast.success('Pagamento adicionado!')
    router.push(`/contratos/${id}`)
  }

  return (
    <div className="max-w-lg space-y-6">
      <Link href={`/contratos/${id}`} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--muted-fg)' }}>
        <ArrowLeft className="w-4 h-4" /> Voltar ao contrato
      </Link>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>Novo pagamento</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-fg)' }}>Registre uma parcela ou entrada do contrato</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border p-5 space-y-4" style={{ background: '#fff', borderColor: 'var(--card-border)' }}>

        <Field label="Descrição">
          <input className={inputCls} style={inputStyle} value={form.descricao}
            onChange={e => set('descricao', e.target.value)}
            placeholder="Ex: Entrada, Parcela 1, Saldo final..."
            onFocus={focus} onBlur={blur} />
        </Field>

        <Field label="Valor (R$) *">
          <input className={inputCls} style={inputStyle} required value={form.valor}
            onChange={e => set('valor', e.target.value)}
            placeholder="0,00" inputMode="decimal"
            onFocus={focus} onBlur={blur} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <select className={inputCls} style={inputStyle} value={form.status}
              onChange={e => set('status', e.target.value)} onFocus={focus} onBlur={blur}>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </Field>

          <Field label="Forma de pagamento">
            <select className={inputCls} style={inputStyle} value={form.forma_pagamento}
              onChange={e => set('forma_pagamento', e.target.value)} onFocus={focus} onBlur={blur}>
              <option value="">— Selecione —</option>
              <option value="pix">Pix</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="transferencia">Transferência</option>
              <option value="boleto">Boleto</option>
            </select>
          </Field>
        </div>

        <Field label="Data de vencimento">
          <input type="date" className={inputCls} style={inputStyle} value={form.data_vencimento}
            onChange={e => set('data_vencimento', e.target.value)} onFocus={focus} onBlur={blur} />
        </Field>

        {form.status === 'pago' && (
          <Field label="Data de pagamento">
            <input type="date" className={inputCls} style={inputStyle} value={form.data_pagamento}
              onChange={e => set('data_pagamento', e.target.value)} onFocus={focus} onBlur={blur} />
          </Field>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Link href={`/contratos/${id}`}
            className="flex items-center px-4 h-10 rounded-lg text-sm font-medium border"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-fg)' }}>
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 h-10 rounded-lg text-sm font-semibold disabled:opacity-70"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Salvando...' : 'Adicionar pagamento'}
          </button>
        </div>
      </form>
    </div>
  )
}
