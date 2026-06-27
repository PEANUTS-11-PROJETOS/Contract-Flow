'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

const TIPOS = ['Prestação de serviço', 'Social media', 'Consultoria', 'Fornecimento']

const inputBase: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 14px',
  borderRadius: 9, border: '1px solid var(--input-border)',
  background: 'var(--bg)', fontSize: 14, outline: 'none',
  color: 'var(--fg)', transition: 'border-color 0.15s',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
        {label}{required && <span style={{ color: 'var(--primary)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = 'var(--primary)'
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = 'var(--input-border)'
}

export function NovoContratoForm({ tipoInicial }: { tipoInicial: string }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    tipo:             tipoInicial,
    valor_total:      '',
    periodicidade:    'mensal',
    data_inicio:      '',
    data_renovacao:   '',
    alerta_dias:      '7',
    cliente_nome:     '',
    cliente_email:    '',
    cliente_telefone: '',
    cliente_documento:'',
    observacoes:      '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.cliente_nome.trim()) { toast.error('Informe o nome do cliente.'); return }
    if (!form.valor_total)         { toast.error('Informe o valor do contrato.'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const valor = Number(form.valor_total.replace(/\./g, '').replace(',', '.')) || 0

    const { error } = await supabase.from('contratos').insert({
      user_id:           user.id,
      titulo:            form.tipo,
      tipo:              form.tipo,
      cliente_nome:      form.cliente_nome,
      cliente_email:     form.cliente_email     || null,
      cliente_telefone:  form.cliente_telefone  || null,
      cliente_documento: form.cliente_documento || null,
      valor_total:       valor,
      periodicidade:     form.periodicidade     || null,
      data_inicio:       form.data_inicio       || null,
      data_renovacao:    form.data_renovacao    || null,
      alerta_dias:       parseInt(form.alerta_dias) || 7,
      observacoes:       form.observacoes       || null,
      status:            'ativo',
    })

    setLoading(false)
    if (error) { toast.error('Erro ao salvar contrato.'); return }
    toast.success('Contrato criado com sucesso!')
    router.push('/contratos')
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)', borderRadius: 13,
    border: '1px solid var(--card-border)', padding: 20,
    display: 'flex', flexDirection: 'column', gap: 16,
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <Link href="/contratos" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 13, color: 'var(--muted-fg)', textDecoration: 'none', marginBottom: 20, fontWeight: 500,
      }}>
        <ArrowLeft size={14} /> Contratos
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)' }}>Novo contrato</h1>
        <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginTop: 4 }}>Preencha os dados para criar o contrato</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={cardStyle}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo de contrato</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TIPOS.map(t => (
              <button key={t} type="button" onClick={() => set('tipo', t)} style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: form.tipo === t ? 'var(--primary)' : 'var(--border)',
                background:  form.tipo === t ? 'var(--primary-light)' : 'var(--surface)',
                color:       form.tipo === t ? 'var(--primary-700)' : 'var(--muted-fg)',
                transition: 'all 0.12s',
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contrato</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Valor (R$)" required>
              <input style={inputBase} value={form.valor_total} onChange={e => set('valor_total', e.target.value)} placeholder="0,00" inputMode="decimal" onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Periodicidade">
              <select style={inputBase} value={form.periodicidade} onChange={e => set('periodicidade', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                <option value="mensal">Mensal</option>
                <option value="unico">Pagamento único</option>
              </select>
            </Field>
            <Field label="Data de início">
              <input type="date" style={inputBase} value={form.data_inicio} onChange={e => set('data_inicio', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Data de renovação">
              <input type="date" style={inputBase} value={form.data_renovacao} onChange={e => set('data_renovacao', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
          </div>
          <Field label="Alerta de vencimento">
            <select style={inputBase} value={form.alerta_dias} onChange={e => set('alerta_dias', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
              <option value="3">3 dias antes</option>
              <option value="7">7 dias antes</option>
              <option value="15">15 dias antes</option>
              <option value="30">30 dias antes</option>
            </select>
          </Field>
        </div>

        <div style={cardStyle}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente</p>
          <Field label="Nome" required>
            <input style={inputBase} value={form.cliente_nome} onChange={e => set('cliente_nome', e.target.value)} placeholder="Nome do cliente ou empresa" onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="CNPJ / CPF">
              <input style={inputBase} value={form.cliente_documento} onChange={e => set('cliente_documento', e.target.value)} placeholder="000.000.000-00" onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="E-mail">
              <input type="email" style={inputBase} value={form.cliente_email} onChange={e => set('cliente_email', e.target.value)} placeholder="email@exemplo.com" onFocus={onFocus} onBlur={onBlur} />
            </Field>
          </div>
        </div>

        <div style={cardStyle}>
          <Field label="Observações">
            <textarea style={{ ...inputBase, height: 'auto', padding: '10px 14px', resize: 'none' }} rows={3} value={form.observacoes} onChange={e => set('observacoes', e.target.value)} placeholder="Detalhes adicionais..." onFocus={onFocus} onBlur={onBlur} />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Link href="/contratos" style={{
            padding: '10px 20px', borderRadius: 9, fontSize: 14, fontWeight: 600,
            color: 'var(--muted-fg)', border: '1px solid var(--border)', textDecoration: 'none',
            background: 'var(--surface)',
          }}>
            Cancelar
          </Link>
          <button type="submit" disabled={loading} style={{
            padding: '10px 24px', borderRadius: 9, fontSize: 14, fontWeight: 700,
            color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.7 : 1,
          }}>
            {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Salvando...' : 'Salvar contrato'}
          </button>
        </div>
      </form>
    </div>
  )
}
