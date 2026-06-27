'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react'
import { fmtMoeda, fmtData } from '@/lib/utils'

type Pagamento = {
  id: string
  descricao: string | null
  valor: number
  status: string
  data_vencimento: string | null
  data_pagamento: string | null
  forma_pagamento: string | null
}

function isVencido(p: Pagamento) {
  return p.status === 'pendente' && !!p.data_vencimento && new Date(p.data_vencimento) < new Date(new Date().toDateString())
}

export function PagamentosSection({ pagamentos: inicial, contratoId, valorTotal }: {
  pagamentos: Pagamento[]
  contratoId: string
  valorTotal: number
}) {
  const [pagamentos, setPagamentos] = useState(inicial)
  const [marcando,   setMarcando]   = useState<string | null>(null)

  const totalPago     = pagamentos.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0)
  const totalPendente = Math.max(0, valorTotal - totalPago)

  async function marcarPago(id: string) {
    setMarcando(id)
    const hoje = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('pagamentos')
      .update({ status: 'pago', data_pagamento: hoje })
      .eq('id', id)
    if (error) {
      toast.error('Erro ao atualizar pagamento.')
    } else {
      setPagamentos(ps => ps.map(p => p.id === id ? { ...p, status: 'pago', data_pagamento: hoje } : p))
      toast.success('Pagamento marcado como pago!')
    }
    setMarcando(null)
  }

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 13,
      border: '1px solid var(--card-border)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px', borderBottom: '1px solid var(--card-border)',
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Histórico de pagamentos
        </p>
        <Link href={`/contratos/${contratoId}/pagamento/novo`} style={{
          padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700,
          color: 'var(--primary)', background: 'var(--primary-light)', textDecoration: 'none',
        }}>
          + Adicionar
        </Link>
      </div>

      {!pagamentos.length ? (
        <div style={{ padding: '32px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)' }}>Nenhum pagamento registrado</p>
        </div>
      ) : (
        <>
          {/* Mini resumo */}
          <div style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--card-border)' }}>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 9, background: '#E7F5EE' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#11704E' }}>Recebido</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#11704E', marginTop: 2 }}>{fmtMoeda(totalPago)}</p>
            </div>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 9, background: totalPendente > 0 ? '#F7E8C8' : '#E7F5EE' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: totalPendente > 0 ? '#9A6B12' : '#11704E' }}>Pendente</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: totalPendente > 0 ? '#9A6B12' : '#11704E', marginTop: 2 }}>{fmtMoeda(totalPendente)}</p>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ padding: '8px 20px 16px' }}>
            {pagamentos.map((p, i) => {
              const pago    = p.status === 'pago'
              const vencido = isVencido(p)
              const dotColor = pago ? 'var(--primary)' : vencido ? '#DC4E45' : '#D98A1F'
              const lineColor = i < pagamentos.length - 1 ? 'var(--card-border)' : 'transparent'
              return (
                <div key={p.id} style={{ display: 'flex', gap: 14, paddingTop: 14 }}>
                  {/* Linha e ponto */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: 5, marginTop: 3,
                      background: pago ? dotColor : 'transparent',
                      border: `2px solid ${dotColor}`,
                      flexShrink: 0,
                    }} />
                    <div style={{ width: 1, flex: 1, background: lineColor, marginTop: 4 }} />
                  </div>

                  {/* Conteúdo */}
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    paddingBottom: i < pagamentos.length - 1 ? 8 : 0,
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
                        {pago ? 'Pagamento recebido' : vencido ? 'Pagamento vencido' : 'Próximo vencimento'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>
                        {pago && p.data_pagamento ? fmtData(p.data_pagamento) : p.data_vencimento ? fmtData(p.data_vencimento) : '—'}
                        {p.descricao ? ` · ${p.descricao}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>
                        {fmtMoeda(Number(p.valor))}
                      </span>
                      {pago ? (
                        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#E7F5EE', color: '#11704E' }}>
                          Pago
                        </span>
                      ) : vencido ? (
                        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#FBE3DF', color: '#C0432E' }}>
                          Vencido
                        </span>
                      ) : (
                        <button
                          onClick={() => marcarPago(p.id)}
                          disabled={marcando === p.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                            background: '#E7F5EE', color: '#11704E', border: 'none', cursor: 'pointer',
                            opacity: marcando === p.id ? 0.7 : 1,
                          }}
                        >
                          {marcando === p.id
                            ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            : <CheckCircle size={12} />}
                          Marcar pago
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
