import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  fmtMoeda, fmtData, getInitials,
  contratoStatusDerivado, diasParaVencer,
  STATUS_CHIP, STATUS_AVATAR,
} from '@/lib/utils'

type Contrato = {
  id: string
  titulo: string
  tipo: string | null
  cliente_nome: string
  valor_total: number
  periodicidade: string | null
  data_renovacao: string | null
  alerta_dias: number | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const agora     = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().split('T')[0]
  const fimMes    = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).toISOString().split('T')[0]

  const seisAtras = new Date(agora)
  seisAtras.setMonth(seisAtras.getMonth() - 5)
  seisAtras.setDate(1)

  const [
    { data: contratos },
    { data: pagPagosMes },
    { data: pagPendentes },
    { data: receitaHist },
  ] = await Promise.all([
    supabase
      .from('contratos')
      .select('id, titulo, tipo, cliente_nome, valor_total, periodicidade, data_renovacao, alerta_dias')
      .order('data_renovacao', { ascending: true }),
    supabase.from('pagamentos').select('valor')
      .eq('status', 'pago')
      .gte('data_pagamento', inicioMes)
      .lte('data_pagamento', fimMes),
    supabase.from('pagamentos').select('valor').eq('status', 'pendente'),
    supabase.from('pagamentos').select('valor, data_pagamento')
      .eq('status', 'pago')
      .gte('data_pagamento', seisAtras.toISOString().split('T')[0]),
  ])

  const lista = (contratos ?? []) as Contrato[]

  const ativos   = lista.filter(c => contratoStatusDerivado(c.data_renovacao) === 'ativo').length
  const vencendo = lista.filter(c => contratoStatusDerivado(c.data_renovacao) === 'vencendo').length
  const recebido = (pagPagosMes ?? []).reduce((s, p) => s + Number(p.valor), 0)
  const aReceber = (pagPendentes ?? []).reduce((s, p) => s + Number(p.valor), 0)

  const alertaContrato = lista.find(c => {
    if (!c.data_renovacao) return false
    const diff = diasParaVencer(c.data_renovacao)
    return diff >= 0 && diff <= (c.alerta_dias ?? 7)
  }) ?? null

  const vencendoLista = lista
    .filter(c => c.data_renovacao && contratoStatusDerivado(c.data_renovacao) === 'vencendo')
    .slice(0, 5)

  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(agora)
    d.setMonth(d.getMonth() - (5 - i))
    return {
      mes: d.toLocaleString('pt-BR', { month: 'short' }),
      key: d.toISOString().slice(0, 7),
      valor: 0,
    }
  });
  (receitaHist ?? []).forEach(p => {
    if (!p.data_pagamento) return
    const key = (p.data_pagamento as string).slice(0, 7)
    const m = last6.find(x => x.key === key)
    if (m) m.valor += Number(p.valor)
  })
  const maxValor = Math.max(...last6.map(m => m.valor), 1)

  const primeiroNome = (user.email ?? '').split('@')[0]

  const kpis = [
    { label: 'Contratos ativos',  value: String(ativos),     sub: 'contratos vigentes' },
    { label: 'Vencendo (30d)',    value: String(vencendo),   sub: 'renovar em breve' },
    { label: 'Recebido este mês', value: fmtMoeda(recebido), sub: 'pagamentos confirmados' },
    { label: 'A receber',         value: fmtMoeda(aReceber), sub: 'pagamentos pendentes' },
  ]

  return (
    <div style={{ maxWidth: 960 }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)' }}>
            Olá, {primeiroNome} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginTop: 4 }}>
            {vencendo > 0
              ? `Você tem ${vencendo} contrato${vencendo > 1 ? 's' : ''} vencendo em 30 dias.`
              : 'Todos os contratos estão em dia.'}
          </p>
        </div>
        <Link href="/contratos/novo" style={{
          padding: '9px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          color: '#fff', background: 'var(--primary)', textDecoration: 'none',
        }}>
          + Novo contrato
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            padding: '20px', borderRadius: 13,
            background: 'var(--surface)', border: '1px solid var(--card-border)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-fg)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {k.label}
            </p>
            <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)', lineHeight: 1 }}>
              {k.value}
            </p>
            <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 6 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Banner de alerta */}
      {alertaContrato && (() => {
        const diff = diasParaVencer(alertaContrato.data_renovacao!)
        return (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderRadius: 12, marginBottom: 24,
            background: 'var(--warning-banner)', border: '1px solid #F5D9A8',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#7A4E0D' }}>
                  {alertaContrato.cliente_nome} vence em {diff} dia{diff !== 1 ? 's' : ''}
                </p>
                <p style={{ fontSize: 12, color: '#9A6B12' }}>
                  {alertaContrato.tipo ?? alertaContrato.titulo} · {fmtData(alertaContrato.data_renovacao!)}
                </p>
              </div>
            </div>
            <Link href={`/contratos/${alertaContrato.id}/editar`} style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              color: '#fff', background: '#D98A1F', textDecoration: 'none',
            }}>
              Renovar
            </Link>
          </div>
        )
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Vencendo em breve */}
        <div style={{
          background: 'var(--surface)', borderRadius: 13,
          border: '1px solid var(--card-border)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 20px', borderBottom: '1px solid var(--card-border)',
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>Vencendo em breve</p>
            <Link href="/contratos" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Ver todos →
            </Link>
          </div>

          {!vencendoLista.length ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--muted-fg)' }}>Nenhum contrato vencendo nos próximos 30 dias ✓</p>
            </div>
          ) : (
            vencendoLista.map((c, i) => {
              const diff = c.data_renovacao ? diasParaVencer(c.data_renovacao) : null
              const st   = contratoStatusDerivado(c.data_renovacao)
              const av   = STATUS_AVATAR[st]
              const chip = STATUS_CHIP[st]
              return (
                <Link key={c.id} href={`/contratos/${c.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px', textDecoration: 'none',
                  borderBottom: i < vencendoLista.length - 1 ? '1px solid var(--card-border)' : 'none',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: av.bg, color: av.color, fontSize: 12, fontWeight: 700,
                  }}>
                    {getInitials(c.cliente_nome)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.cliente_nome}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--muted-fg)' }}>
                      {c.tipo ?? c.titulo}
                      {c.periodicidade === 'mensal'
                        ? ` · ${fmtMoeda(Number(c.valor_total))}/mês`
                        : ` · ${fmtMoeda(Number(c.valor_total))}`}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    background: chip.bg, color: chip.color, whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {diff !== null ? `${diff}d` : '—'}
                  </span>
                </Link>
              )
            })
          )}
        </div>

        {/* Gráfico de receita */}
        <div style={{
          background: 'var(--surface)', borderRadius: 13,
          border: '1px solid var(--card-border)', padding: 20,
          display: 'flex', flexDirection: 'column',
        }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 20 }}>Receita por mês</p>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginBottom: 12 }}>
            {last6.map((m, i) => {
              const h = m.valor > 0 ? Math.max(8, Math.round((m.valor / maxValor) * 100)) : 4
              const isLast = i === 5
              return (
                <div key={m.key} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 6,
                }}>
                  <div title={fmtMoeda(m.valor)} style={{
                    width: '100%', height: `${h}%`, minHeight: 4,
                    borderRadius: '6px 6px 3px 3px',
                    background: isLast ? 'var(--primary)' : (i >= 3 ? '#A8D9C0' : '#D4ECDF'),
                  }} />
                  <span style={{
                    fontSize: 10, fontWeight: isLast ? 700 : 400,
                    color: isLast ? 'var(--fg)' : 'var(--faint)',
                  }}>
                    {m.mes}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--card-border)' }}>
            <p style={{ fontSize: 11, color: 'var(--muted-fg)' }}>Este mês</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg)', marginTop: 2 }}>
              {fmtMoeda(last6[5].valor)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
