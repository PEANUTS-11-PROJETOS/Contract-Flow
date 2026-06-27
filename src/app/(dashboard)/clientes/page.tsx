import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getInitials, fmtMoeda, contratoStatusDerivado, STATUS_CHIP } from '@/lib/utils'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contratos } = await supabase
    .from('contratos')
    .select('id, titulo, tipo, cliente_nome, cliente_email, valor_total, periodicidade, data_renovacao')
    .order('cliente_nome', { ascending: true })

  // Agrupar por cliente
  const mapa = new Map<string, {
    nome: string
    email: string | null
    contratos: typeof contratos
    totalMensal: number
  }>()

  for (const c of (contratos ?? [])) {
    const key = c.cliente_nome
    if (!mapa.has(key)) {
      mapa.set(key, { nome: c.cliente_nome, email: c.cliente_email ?? null, contratos: [], totalMensal: 0 })
    }
    const entry = mapa.get(key)!
    entry.contratos!.push(c)
    if (c.periodicidade === 'mensal') entry.totalMensal += Number(c.valor_total ?? 0)
  }

  const clientes = Array.from(mapa.values())

  const avatarColors = [
    { bg: '#E7F5EE', color: '#11704E' },
    { bg: '#E8F0FE', color: '#1A56DB' },
    { bg: '#FDF2FA', color: '#9C27B0' },
    { bg: '#FFF8E1', color: '#F57F17' },
    { bg: '#FCE4EC', color: '#C2185B' },
  ]

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)' }}>Clientes</h1>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginTop: 4 }}>
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} encontrado{clientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/contratos/novo" style={{
          padding: '9px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          color: '#fff', background: 'var(--primary)', textDecoration: 'none',
        }}>
          + Novo contrato
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--card-border)',
          borderRadius: 13, padding: '64px 32px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>👥</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>
            Nenhum cliente ainda
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginBottom: 24 }}>
            Os clientes aparecem aqui quando você criar contratos.
          </p>
          <Link href="/contratos/novo" style={{
            padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700,
            color: '#fff', background: 'var(--primary)', textDecoration: 'none',
          }}>
            Criar primeiro contrato
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {clientes.map((cliente, idx) => {
            const cor = avatarColors[idx % avatarColors.length]
            const ativos = (cliente.contratos ?? []).filter(c =>
              contratoStatusDerivado(c.data_renovacao) === 'ativo'
            ).length
            const vencendo = (cliente.contratos ?? []).filter(c =>
              contratoStatusDerivado(c.data_renovacao) === 'vencendo'
            ).length
            const total = (cliente.contratos ?? []).length

            return (
              <div key={cliente.nome} style={{
                background: 'var(--surface)', border: '1px solid var(--card-border)',
                borderRadius: 13, padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: cor.bg, color: cor.color, fontSize: 14, fontWeight: 700,
                }}>
                  {getInitials(cliente.nome)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>{cliente.nome}</p>
                  {cliente.email && (
                    <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginTop: 2 }}>{cliente.email}</p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
                  {vencendo > 0 && (
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: STATUS_CHIP.vencendo.bg, color: STATUS_CHIP.vencendo.color,
                    }}>
                      {vencendo} vencendo
                    </span>
                  )}

                  <div style={{ textAlign: 'right' }}>
                    {cliente.totalMensal > 0 && (
                      <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg)' }}>
                        {fmtMoeda(cliente.totalMensal)}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted-fg)' }}>/mês</span>
                      </p>
                    )}
                    <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>
                      {total} contrato{total !== 1 ? 's' : ''} · {ativos} ativo{ativos !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(cliente.contratos ?? []).slice(0, 3).map(c => (
                      <Link key={c.id} href={`/contratos/${c.id}`} style={{
                        fontSize: 12, color: 'var(--primary)', textDecoration: 'none',
                        fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        {c.tipo ?? c.titulo} →
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
