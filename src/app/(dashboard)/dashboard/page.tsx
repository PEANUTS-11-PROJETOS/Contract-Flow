import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText, DollarSign, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtData(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')
}

const STATUS_LABEL: Record<string, string> = {
  proposta: 'Proposta',
  ativo: 'Ativo',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  proposta: '#d97706',
  ativo: '#7c3aed',
  concluido: '#16a34a',
  cancelado: '#9ca3af',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contratos } = await supabase
    .from('contratos')
    .select('id, titulo, cliente_nome, valor_total, status, data_evento, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: todos } = await supabase
    .from('contratos')
    .select('valor_total, status')

  const totalContratos   = todos?.length ?? 0
  const totalFechado     = todos?.reduce((s, c) => s + Number(c.valor_total ?? 0), 0) ?? 0
  const totalAtivos      = todos?.filter(c => c.status === 'ativo').length ?? 0
  const totalConcluidos  = todos?.filter(c => c.status === 'concluido').length ?? 0

  const { data: pagamentos } = await supabase
    .from('pagamentos')
    .select('valor')
    .eq('status', 'pago')

  const totalRecebido = pagamentos?.reduce((s, p) => s + Number(p.valor ?? 0), 0) ?? 0

  const kpis = [
    { label: 'Total de contratos', value: String(totalContratos), icon: FileText,    color: '#7c3aed' },
    { label: 'Valor fechado',       value: fmtMoeda(totalFechado), icon: DollarSign,  color: '#7c3aed' },
    { label: 'Total recebido',      value: fmtMoeda(totalRecebido),icon: CheckCircle, color: '#16a34a' },
    { label: 'Em andamento',        value: String(totalAtivos),    icon: Clock,       color: '#d97706' },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-fg)' }}>Visão geral dos seus contratos</p>
        </div>
        <Link
          href="/contratos/novo"
          className="flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-semibold transition-all"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          + Novo contrato
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl p-5 border" style={{ background: '#fff', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted-fg)' }}>{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Contratos recentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>Contratos recentes</h2>
          <Link href="/contratos" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>Ver todos →</Link>
        </div>

        {!contratos?.length ? (
          <div className="rounded-xl border p-12 text-center" style={{ background: '#fff', borderColor: 'var(--card-border)' }}>
            <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--muted-fg)' }} />
            <p className="font-medium" style={{ color: 'var(--fg)' }}>Nenhum contrato ainda</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>Crie seu primeiro contrato para começar</p>
            <Link
              href="/contratos/novo"
              className="inline-flex items-center mt-4 px-4 h-9 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              + Novo contrato
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ background: '#fff', borderColor: 'var(--card-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: '#faf8ff' }}>
                  {['Cliente', 'Serviço', 'Valor', 'Data evento', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-fg)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contratos.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < contratos.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--fg)' }}>
                      <Link href={`/contratos/${c.id}`} className="hover:underline">{c.cliente_nome}</Link>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted-fg)' }}>{c.titulo}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--fg)' }}>{fmtMoeda(Number(c.valor_total))}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted-fg)' }}>{c.data_evento ? fmtData(c.data_evento) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: `${STATUS_COLOR[c.status] ?? '#9ca3af'}18`, color: STATUS_COLOR[c.status] ?? '#9ca3af' }}>
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
