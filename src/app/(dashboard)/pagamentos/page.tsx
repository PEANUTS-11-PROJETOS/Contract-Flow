import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { fmtMoeda, fmtData } from '@/lib/utils'

type Pagamento = {
  id: string
  valor: number
  status: string
  data_vencimento: string | null
  data_pagamento: string | null
  descricao: string | null
  forma_pagamento: string | null
  contrato_id: string
  contratos: { titulo: string; tipo: string | null; cliente_nome: string } | null
}

const STATUS_PAG: Record<string, { bg: string; color: string; label: string }> = {
  pago:      { bg: '#E7F5EE', color: '#11704E', label: 'Pago' },
  pendente:  { bg: '#F7E8C8', color: '#9A6B12', label: 'Pendente' },
  cancelado: { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelado' },
  vencido:   { bg: '#FBE3DF', color: '#C0432E', label: 'Vencido' },
}

function statusReal(p: Pagamento): string {
  if (p.status === 'pago') return 'pago'
  if (p.status === 'cancelado') return 'cancelado'
  if (p.data_vencimento && new Date(p.data_vencimento + 'T12:00:00') < new Date()) return 'vencido'
  return 'pendente'
}

export default async function PagamentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('pagamentos')
    .select('*, contratos(titulo, tipo, cliente_nome)')
    .order('data_vencimento', { ascending: false })

  const pagamentos = (data ?? []) as Pagamento[]

  const recebido  = pagamentos.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0)
  const pendente  = pagamentos.filter(p => p.status === 'pendente').reduce((s, p) => s + Number(p.valor), 0)
  const vencido   = pagamentos.filter(p => statusReal(p) === 'vencido').reduce((s, p) => s + Number(p.valor), 0)

  return (
    <div style={{ maxWidth: 880 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)' }}>Pagamentos</h1>
        <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginTop: 4 }}>
          Histórico de todas as cobranças
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Recebido', value: fmtMoeda(recebido), color: '#11704E', bg: '#E7F5EE' },
          { label: 'Pendente', value: fmtMoeda(pendente), color: '#9A6B12', bg: '#F7E8C8' },
          { label: 'Em atraso', value: fmtMoeda(vencido), color: '#C0432E', bg: '#FBE3DF' },
        ].map(k => (
          <div key={k.label} style={{
            padding: 20, borderRadius: 13,
            background: 'var(--surface)', border: '1px solid var(--card-border)',
          }}>
            <div style={{
              display: 'inline-flex', padding: '3px 10px', borderRadius: 20,
              background: k.bg, marginBottom: 12,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: k.color }}>{k.label}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)' }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {pagamentos.length === 0 ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--card-border)',
          borderRadius: 13, padding: '64px 32px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>💳</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>
            Nenhum pagamento registrado
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)' }}>
            Adicione pagamentos dentro de cada contrato.
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--card-border)', borderRadius: 13,
        }}>
          {pagamentos.map((p, i) => {
            const st = statusReal(p)
            const chip = STATUS_PAG[st] ?? STATUS_PAG.pendente
            const contrato = p.contratos
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 20px',
                borderBottom: i < pagamentos.length - 1 ? '1px solid var(--card-border)' : 'none',
              }}>
                {/* Ícone status */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: chip.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15,
                }}>
                  {st === 'pago' ? '✓' : st === 'vencido' ? '!' : '·'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>
                    {p.descricao || 'Pagamento'}
                  </p>
                  {contrato && (
                    <Link href={`/contratos/${p.contrato_id}`} style={{
                      fontSize: 12, color: 'var(--muted-fg)', textDecoration: 'none',
                    }}>
                      {contrato.cliente_nome} · {contrato.tipo ?? contrato.titulo}
                    </Link>
                  )}
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {p.data_vencimento && (
                    <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginBottom: 4 }}>
                      {st === 'pago' && p.data_pagamento
                        ? `Pago em ${fmtData(p.data_pagamento)}`
                        : `Vence ${fmtData(p.data_vencimento)}`}
                    </p>
                  )}
                  {p.forma_pagamento && (
                    <p style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'capitalize', marginBottom: 4 }}>
                      {p.forma_pagamento}
                    </p>
                  )}
                </div>

                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg)', flexShrink: 0, minWidth: 100, textAlign: 'right' }}>
                  {fmtMoeda(Number(p.valor))}
                </p>

                <span style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: chip.bg, color: chip.color, flexShrink: 0,
                }}>
                  {chip.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
