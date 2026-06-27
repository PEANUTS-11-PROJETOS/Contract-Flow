import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, RefreshCw } from 'lucide-react'
import { PagamentosSection } from '@/components/dashboard/pagamentos-section'
import {
  fmtMoeda, fmtData, getInitials,
  contratoStatusDerivado, diasParaVencer,
  STATUS_LABEL, STATUS_CHIP, STATUS_AVATAR,
} from '@/lib/utils'

export default async function ContratoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contrato } = await supabase.from('contratos').select('*').eq('id', id).single()
  if (!contrato) notFound()

  const { data: pagamentos } = await supabase
    .from('pagamentos').select('*').eq('contrato_id', id)
    .order('data_vencimento', { ascending: true })

  const st      = contratoStatusDerivado(contrato.data_renovacao)
  const chip    = STATUS_CHIP[st]
  const av      = STATUS_AVATAR[st]
  const ini     = getInitials(contrato.cliente_nome ?? '?')
  const tipoLabel = contrato.tipo ?? contrato.titulo
  const diff    = contrato.data_renovacao ? diasParaVencer(contrato.data_renovacao) : null
  const totalPago = (pagamentos ?? []).filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0)

  return (
    <div style={{ maxWidth: 880 }}>
      {/* Breadcrumb */}
      <Link href="/contratos" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 13, color: 'var(--muted-fg)', textDecoration: 'none', marginBottom: 24,
        fontWeight: 500,
      }}>
        <ArrowLeft size={14} /> Contratos
      </Link>

      {/* Header do contrato */}
      <div style={{
        background: 'var(--surface)', borderRadius: 13,
        border: '1px solid var(--card-border)', padding: '24px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          {/* Avatar grande */}
          <div style={{
            width: 60, height: 60, borderRadius: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: av.bg, color: av.color, fontSize: 18, fontWeight: 700,
          }}>
            {ini}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg)' }}>
                {contrato.cliente_nome}
              </h1>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: chip.bg, color: chip.color,
              }}>
                {STATUS_LABEL[st]}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>
              {tipoLabel}
              {contrato.periodicidade === 'mensal' ? ` · ${fmtMoeda(Number(contrato.valor_total))}/mês` : ` · ${fmtMoeda(Number(contrato.valor_total))}`}
              {contrato.data_renovacao ? ` · Renova em ${fmtData(contrato.data_renovacao)}` : ''}
              {diff !== null && diff >= 0 && diff <= 30 ? ` (${diff} dias)` : ''}
            </p>
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href={`/contratos/${id}/editar`} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              color: 'var(--fg)', border: '1px solid var(--border)', textDecoration: 'none',
              background: 'var(--surface)',
            }}>
              <Pencil size={13} /> Editar
            </Link>
            <Link href={`/contratos/${id}/editar`} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              color: '#fff', background: 'var(--primary)', textDecoration: 'none',
            }}>
              <RefreshCw size={13} /> Renovar
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        {/* Coluna esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Partes envolvidas */}
          <div style={{
            background: 'var(--surface)', borderRadius: 13,
            border: '1px solid var(--card-border)', padding: 20,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Partes envolvidas
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Contratante */}
              <div style={{
                padding: 14, borderRadius: 10,
                background: 'var(--surface-muted)', border: '1px solid var(--card-border)',
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Contratante
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{user.email}</p>
                <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>MEI · Prestador de serviço</p>
              </div>

              {/* Cliente */}
              <div style={{
                padding: 14, borderRadius: 10,
                background: 'var(--surface-muted)', border: '1px solid var(--card-border)',
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Cliente
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{contrato.cliente_nome}</p>
                {contrato.cliente_email && (
                  <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>{contrato.cliente_email}</p>
                )}
                {contrato.cliente_documento && (
                  <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>{contrato.cliente_documento}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pagamentos */}
          <PagamentosSection
            pagamentos={pagamentos ?? []}
            contratoId={id}
            valorTotal={Number(contrato.valor_total)}
          />
        </div>

        {/* Coluna direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Resumo */}
          <div style={{
            background: 'var(--surface)', borderRadius: 13,
            border: '1px solid var(--card-border)', padding: 20,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Resumo
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Valor', value: contrato.periodicidade === 'mensal' ? `${fmtMoeda(Number(contrato.valor_total))}/mês` : fmtMoeda(Number(contrato.valor_total)) },
                { label: 'Periodicidade', value: contrato.periodicidade === 'mensal' ? 'Mensal' : contrato.periodicidade === 'unico' ? 'Pagamento único' : '—' },
                { label: 'Início', value: contrato.data_inicio ? fmtData(contrato.data_inicio) : '—' },
                { label: 'Renovação', value: contrato.data_renovacao ? fmtData(contrato.data_renovacao) : '—' },
                { label: 'Recebido', value: fmtMoeda(totalPago) },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted-fg)', fontWeight: 500 }}>{r.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', textAlign: 'right' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tipo do contrato */}
          <div style={{
            background: 'var(--primary-light)', borderRadius: 13,
            border: '1px solid var(--primary-tint)', padding: 20,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Tipo de serviço
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-700)' }}>
              {tipoLabel}
            </p>
            {contrato.observacoes && (
              <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginTop: 10, lineHeight: 1.5 }}>
                {contrato.observacoes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
