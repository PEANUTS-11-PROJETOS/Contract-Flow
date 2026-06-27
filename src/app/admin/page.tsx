import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { fmtMoeda, fmtData } from '@/lib/utils'

const ADMIN_EMAIL = 'soaresvinicius11112@gmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()

  const [
    { data: { users } },
    { data: contratos },
    { data: pagamentos },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from('contratos').select('id, titulo, tipo, cliente_nome, valor_total, periodicidade, status, created_at, user_id'),
    admin.from('pagamentos').select('valor, status, data_pagamento'),
  ])

  const totalUsuarios  = users?.length ?? 0
  const totalContratos = contratos?.length ?? 0
  const receitaTotal   = (pagamentos ?? []).filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0)
  const pendente       = (pagamentos ?? []).filter(p => p.status === 'pendente').reduce((s, p) => s + Number(p.valor), 0)

  // Contratos por usuário
  const porUsuario = new Map<string, { email: string; contratos: number; receita: number }>()
  for (const u of (users ?? [])) {
    porUsuario.set(u.id, { email: u.email ?? '—', contratos: 0, receita: 0 })
  }
  for (const c of (contratos ?? [])) {
    const entry = porUsuario.get(c.user_id)
    if (entry) entry.contratos++
  }

  const usuariosLista = Array.from(porUsuario.values())
    .sort((a, b) => b.contratos - a.contratos)

  const kpis = [
    { label: 'Usuários',         value: String(totalUsuarios),     icon: '👥', bg: '#E8F0FE', color: '#1A56DB' },
    { label: 'Contratos',        value: String(totalContratos),    icon: '📄', bg: '#E7F5EE', color: '#11704E' },
    { label: 'Receita recebida', value: fmtMoeda(receitaTotal),   icon: '💰', bg: '#E7F5EE', color: '#11704E' },
    { label: 'A receber',        value: fmtMoeda(pendente),        icon: '⏳', bg: '#F7E8C8', color: '#9A6B12' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0F1117', color: '#E5E7EB', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #1F2937', padding: '0 40px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#161B25',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
          }}>⚡</div>
          <span style={{ fontSize: 15, fontWeight: 700 }}>ContractFlow</span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
            background: '#7C3AED', color: '#fff',
          }}>ADMIN</span>
        </div>
        <div style={{ fontSize: 13, color: '#6B7280' }}>{ADMIN_EMAIL}</div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F9FAFB' }}>Painel de administração</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Visão geral da plataforma ContractFlow</p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
          {kpis.map(k => (
            <div key={k.label} style={{
              padding: '20px', borderRadius: 12,
              background: '#161B25', border: '1px solid #1F2937',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, marginBottom: 14,
                background: k.bg + '22', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18,
              }}>
                {k.icon}
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                {k.label}
              </p>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#F9FAFB' }}>{k.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Usuários */}
          <div style={{ background: '#161B25', border: '1px solid #1F2937', borderRadius: 12 }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #1F2937' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#F9FAFB' }}>Usuários cadastrados</p>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {usuariosLista.length === 0 ? (
                <p style={{ padding: '32px 20px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>Nenhum usuário</p>
              ) : usuariosLista.map((u, i) => (
                <div key={u.email} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderBottom: i < usuariosLista.length - 1 ? '1px solid #1F2937' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: '#1F2937',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#9CA3AF',
                    }}>
                      {u.email.slice(0, 2).toUpperCase()}
                    </div>
                    <p style={{ fontSize: 13, color: '#E5E7EB', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                      {u.email === ADMIN_EMAIL && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: '#7C3AED', fontWeight: 700 }}>ADMIN</span>
                      )}
                    </p>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    background: '#1F2937', color: '#9CA3AF',
                  }}>
                    {u.contratos} contrato{u.contratos !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contratos recentes */}
          <div style={{ background: '#161B25', border: '1px solid #1F2937', borderRadius: 12 }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #1F2937' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#F9FAFB' }}>Contratos recentes</p>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {(contratos ?? []).length === 0 ? (
                <p style={{ padding: '32px 20px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>Nenhum contrato</p>
              ) : (contratos ?? []).slice(0, 20).map((c, i, arr) => (
                <div key={c.id} style={{
                  padding: '12px 20px',
                  borderBottom: i < arr.length - 1 ? '1px solid #1F2937' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#E5E7EB' }}>{c.cliente_nome}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#F9FAFB' }}>{fmtMoeda(Number(c.valor_total))}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>{c.tipo ?? c.titulo}</p>
                    <p style={{ fontSize: 11, color: '#4B5563' }}>{fmtData(c.created_at.slice(0, 10))}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
