'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, FileText } from 'lucide-react'
import {
  fmtMoeda, getInitials,
  contratoStatusDerivado, STATUS_LABEL, STATUS_CHIP, STATUS_AVATAR,
  type StatusDerivado,
} from '@/lib/utils'

type Contrato = {
  id: string
  titulo: string
  tipo: string | null
  cliente_nome: string
  valor_total: number
  periodicidade: string | null
  data_renovacao: string | null
}

const FILTROS: { value: '' | StatusDerivado; label: string }[] = [
  { value: '',         label: 'Todos' },
  { value: 'ativo',   label: 'Ativos' },
  { value: 'vencendo',label: 'Vencendo' },
  { value: 'vencido', label: 'Vencidos' },
]

export function ContratosLista({ contratos }: { contratos: Contrato[] }) {
  const [busca,  setBusca]  = useState('')
  const [filtro, setFiltro] = useState<'' | StatusDerivado>('')

  const filtrados = contratos.filter(c => {
    const st = contratoStatusDerivado(c.data_renovacao)
    const matchStatus = !filtro || st === filtro
    const q = busca.toLowerCase()
    const matchBusca = !busca ||
      c.cliente_nome.toLowerCase().includes(q) ||
      (c.tipo ?? c.titulo).toLowerCase().includes(q)
    return matchStatus && matchBusca
  })

  return (
    <div>
      {/* Filtros e busca */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Pills de status */}
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTROS.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: '1px solid',
                borderColor: filtro === f.value ? 'var(--primary)' : 'var(--border)',
                background: filtro === f.value ? 'var(--primary)' : 'var(--surface)',
                color: filtro === f.value ? '#fff' : 'var(--muted-fg)',
                transition: 'all 0.12s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Campo de busca */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={14} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--muted-fg)',
          }} />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar cliente ou tipo..."
            style={{
              width: '100%', height: 36, padding: '0 12px 0 34px',
              borderRadius: 9, border: '1px solid var(--input-border)',
              background: 'var(--surface)', fontSize: 13, outline: 'none',
              color: 'var(--fg)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--input-border)')}
          />
        </div>
      </div>

      {/* Lista */}
      {!filtrados.length ? (
        <div style={{
          borderRadius: 13, border: '1px solid var(--card-border)',
          background: 'var(--surface)', padding: '48px 24px', textAlign: 'center',
        }}>
          <FileText size={32} style={{ color: 'var(--muted-fg)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>
            {contratos.length === 0 ? 'Nenhum contrato ainda' : 'Nenhum resultado encontrado'}
          </p>
          {contratos.length === 0 && (
            <Link href="/contratos/novo" style={{
              display: 'inline-block', marginTop: 16, padding: '9px 20px',
              borderRadius: 9, fontSize: 14, fontWeight: 700,
              color: '#fff', background: 'var(--primary)', textDecoration: 'none',
            }}>
              + Novo contrato
            </Link>
          )}
        </div>
      ) : (
        <div style={{
          background: 'var(--surface)', borderRadius: 13,
          border: '1px solid var(--card-border)', overflow: 'hidden',
        }}>
          {filtrados.map((c, i) => {
            const st   = contratoStatusDerivado(c.data_renovacao)
            const av   = STATUS_AVATAR[st]
            const chip = STATUS_CHIP[st]
            const tipoLabel = c.tipo ?? c.titulo
            return (
              <Link key={c.id} href={`/contratos/${c.id}`} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 20px', textDecoration: 'none',
                borderBottom: i < filtrados.length - 1 ? '1px solid var(--card-border)' : 'none',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: av.bg, color: av.color, fontSize: 13, fontWeight: 700,
                }}>
                  {getInitials(c.cliente_nome)}
                </div>

                {/* Nome + tipo */}
                <div style={{ flex: 1.5, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.cliente_nome}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 1 }}>{tipoLabel}</p>
                </div>

                {/* Valor */}
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>
                    {fmtMoeda(Number(c.valor_total))}
                  </p>
                  {c.periodicidade === 'mensal' && (
                    <p style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 1 }}>por mês</p>
                  )}
                </div>

                {/* Chip de status */}
                <span style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: chip.bg, color: chip.color, whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {STATUS_LABEL[st]}
                </span>

                <ChevronRight size={16} style={{ color: 'var(--faint)', flexShrink: 0 }} />
              </Link>
            )
          })}
        </div>
      )}

      <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 10 }}>
        {filtrados.length} de {contratos.length} contrato{contratos.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
