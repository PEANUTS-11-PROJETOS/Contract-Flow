import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { fmtMoeda, fmtData } from '@/lib/utils'
import { setPlano, setAtivo } from './actions'

const ADMIN_EMAIL = 'soaresvinicius11112@gmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()

  const [
    { data: { users } },
    { data: profiles },
    { data: contratos },
    { data: pagamentos },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from('profiles').select('*'),
    admin.from('contratos').select('id, user_id, valor_total, created_at, cliente_nome, tipo, titulo'),
    admin.from('pagamentos').select('valor, status'),
  ])

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  // Excluir admin de todos os cálculos
  const adminId       = (users ?? []).find(u => u.email === ADMIN_EMAIL)?.id
  const usersClientes = (users ?? []).filter(u => u.email !== ADMIN_EMAIL)
  const contratosClientes = (contratos ?? []).filter(c => c.user_id !== adminId)
  const pagamentosClientes = (pagamentos ?? []).filter(p => {
    // pagamentos não tem user_id direto, mas filtramos via contratos
    const contrato = (contratos ?? []).find(c => c.id === (p as Record<string,unknown>).contrato_id)
    return contrato ? contrato.user_id !== adminId : true
  })

  const totalPro     = (profiles ?? []).filter(p => p.id !== adminId && p.plano === 'pro').length
  const receitaTotal = pagamentosClientes.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0)
  const pendente     = pagamentosClientes.filter(p => p.status === 'pendente').reduce((s, p) => s + Number(p.valor), 0)

  const contratosCount = new Map<string, number>()
  for (const c of contratosClientes) {
    contratosCount.set(c.user_id, (contratosCount.get(c.user_id) ?? 0) + 1)
  }

  const usuariosLista = usersClientes.map(u => ({
    id:        u.id,
    email:     u.email ?? '—',
    createdAt: u.created_at as string,
    contratos: contratosCount.get(u.id) ?? 0,
    profile:   profileMap.get(u.id) as Record<string, unknown> | undefined,
  })).sort((a, b) => b.contratos - a.contratos)

  const kpis = [
    { label: 'Usuários',         value: String(usersClientes.length),        icon: '👥' },
    { label: 'Plano Pro',        value: String(totalPro),                    icon: '⚡' },
    { label: 'Contratos',        value: String(contratosClientes.length),    icon: '📄' },
    { label: 'Receita recebida', value: fmtMoeda(receitaTotal),              icon: '💰' },
    { label: 'A receber',        value: fmtMoeda(pendente),                  icon: '⏳' },
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
          <span style={{ fontSize: 15, fontWeight: 700 }}>ContractFlow</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#7C3AED', color: '#fff' }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>{ADMIN_EMAIL}</span>
          <a href="/dashboard" style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            color: '#E5E7EB', border: '1px solid #374151', textDecoration: 'none',
            background: '#1F2937',
          }}>
            ← Voltar ao painel
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F9FAFB' }}>Painel de administração</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Gerencie usuários, planos e assinaturas</p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 36 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ padding: '18px', borderRadius: 12, background: '#161B25', border: '1px solid #1F2937' }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>{k.icon}</div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#F9FAFB' }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Tabela de usuários */}
        <div style={{ background: '#161B25', border: '1px solid #1F2937', borderRadius: 12, marginBottom: 24 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #1F2937' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#F9FAFB' }}>Usuários ({users?.length ?? 0})</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1F2937' }}>
                  {['Usuário', 'Cadastro', 'Plano', 'Trial / Venc.', 'Contratos', 'Status', 'Ações'].map(h => (
                    <th key={h} style={{
                      padding: '10px 20px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, color: '#6B7280',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuariosLista.map((u, i) => {
                  const isAdmin  = u.email === ADMIN_EMAIL
                  const plano    = String(u.profile?.plano ?? 'gratuito')
                  const ativo    = u.profile?.ativo !== false
                  const trialExp = u.profile?.trial_expires_at as string | undefined
                  const planoExp = u.profile?.plano_expires_at as string | undefined

                  return (
                    <tr key={u.id} style={{
                      borderBottom: i < usuariosLista.length - 1 ? '1px solid #1F2937' : 'none',
                      opacity: ativo ? 1 : 0.5,
                    }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, background: '#1F2937',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: '#9CA3AF', flexShrink: 0,
                          }}>
                            {u.email.slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, color: '#E5E7EB' }}>
                            {u.email}
                            {isAdmin && <span style={{ marginLeft: 6, fontSize: 10, color: '#7C3AED', fontWeight: 700 }}>ADMIN</span>}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: 12, color: '#6B7280' }}>
                        {u.createdAt ? fmtData(u.createdAt.slice(0, 10)) : '—'}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: plano === 'pro' ? '#7C3AED33' : '#1F2937',
                          color: plano === 'pro' ? '#A78BFA' : '#9CA3AF',
                        }}>
                          {plano === 'pro' ? '⚡ Pro' : 'Gratuito'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: 12, color: '#6B7280' }}>
                        {plano === 'pro' && planoExp
                          ? `Pro até ${fmtData(planoExp.slice(0, 10))}`
                          : trialExp
                            ? `Trial até ${fmtData(trialExp.slice(0, 10))}`
                            : '—'}
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#E5E7EB' }}>
                        {u.contratos}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: ativo ? '#34D39922' : '#F8717122',
                          color: ativo ? '#34D399' : '#F87171',
                        }}>
                          {ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        {!isAdmin && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <form action={async () => {
                              'use server'
                              await setPlano(u.id, plano === 'pro' ? 'gratuito' : 'pro')
                            }}>
                              <button type="submit" style={{
                                padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                                cursor: 'pointer', border: '1px solid #374151',
                                background: plano === 'pro' ? '#1F2937' : '#7C3AED22',
                                color: plano === 'pro' ? '#9CA3AF' : '#A78BFA',
                              }}>
                                {plano === 'pro' ? '↓ Free' : '↑ Pro'}
                              </button>
                            </form>

                            <form action={async () => {
                              'use server'
                              await setAtivo(u.id, !ativo)
                            }}>
                              <button type="submit" style={{
                                padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                                cursor: 'pointer', border: '1px solid #374151',
                                background: ativo ? '#F8717122' : '#34D39922',
                                color: ativo ? '#F87171' : '#34D399',
                              }}>
                                {ativo ? 'Desativar' : 'Ativar'}
                              </button>
                            </form>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contratos recentes */}
        <div style={{ background: '#161B25', border: '1px solid #1F2937', borderRadius: 12 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #1F2937' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#F9FAFB' }}>Contratos recentes</p>
          </div>
          {contratosClientes.length === 0 ? (
            <p style={{ padding: '32px 24px', color: '#6B7280', fontSize: 14 }}>Nenhum contrato.</p>
          ) : contratosClientes.slice(0, 10).map((c, i, arr) => (
            <div key={c.id} style={{
              padding: '12px 24px',
              borderBottom: i < arr.length - 1 ? '1px solid #1F2937' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#E5E7EB' }}>{c.cliente_nome}</p>
                <p style={{ fontSize: 12, color: '#6B7280' }}>{c.tipo ?? c.titulo}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#F9FAFB' }}>{fmtMoeda(Number(c.valor_total))}</p>
                <p style={{ fontSize: 11, color: '#4B5563' }}>{fmtData(c.created_at.slice(0, 10))}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
