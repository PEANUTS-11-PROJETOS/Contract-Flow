import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fmtMoeda, fmtData } from '@/lib/utils'
import { BotaoPrint } from './BotaoPrint'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default async function RelatorioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoje      = new Date()
  const mes       = hoje.getMonth()
  const ano       = hoje.getFullYear()
  const inicioMes = new Date(ano, mes, 1).toISOString()
  const fimMes    = new Date(ano, mes + 1, 0, 23, 59, 59).toISOString()

  const [{ data: contratos }, { data: pagamentos }] = await Promise.all([
    supabase.from('contratos').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase
      .from('pagamentos')
      .select('*, contratos(cliente_nome)')
      .eq('user_id', user.id)
      .gte('data_vencimento', inicioMes)
      .lte('data_vencimento', fimMes)
      .order('data_vencimento'),
  ])

  const recebido        = (pagamentos ?? []).filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0)
  const pendente        = (pagamentos ?? []).filter(p => p.status === 'pendente').reduce((s, p) => s + Number(p.valor), 0)
  const contratosAtivos = (contratos ?? []).filter(c => c.status === 'ativo')
  const mesLabel        = `${MESES[mes]} ${ano}`

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          nav, aside { display: none !important; }
          body { background: white !important; }
        }
        @page { size: A4; margin: 20mm; }
      `}</style>

      <div style={{ maxWidth: 760 }}>
        {/* Cabeçalho da página — não imprime */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)' }}>Relatório mensal</h1>
            <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginTop: 4 }}>{mesLabel}</p>
          </div>
          <BotaoPrint />
        </div>

        {/* Conteúdo imprimível */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 20, borderBottom: '2px solid var(--card-border)' }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg)' }}>ContractFlow</p>
            <p style={{ fontSize: 14, color: 'var(--muted-fg)' }}>Relatório de {mesLabel}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>{user.email}</p>
            <p style={{ fontSize: 12, color: 'var(--faint)' }}>Gerado em {fmtData(hoje.toISOString().slice(0, 10))}</p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Recebido no mês',  value: fmtMoeda(recebido),              bg: '#E7F5EE', color: '#11704E' },
            { label: 'Pendente no mês',  value: fmtMoeda(pendente),              bg: '#F7E8C8', color: '#9A6B12' },
            { label: 'Contratos ativos', value: String(contratosAtivos.length),  bg: 'var(--surface)', color: 'var(--fg)' },
          ].map(k => (
            <div key={k.label} style={{ padding: '16px', borderRadius: 10, background: k.bg, border: '1px solid var(--card-border)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: k.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{k.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Pagamentos do mês */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 12 }}>
            Pagamentos — {mesLabel}
          </p>
          {(pagamentos ?? []).length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted-fg)', padding: '16px 0' }}>Nenhum pagamento neste mês.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['Descrição','Cliente','Vencimento','Valor','Status'].map(h => (
                    <th key={h} style={{ padding: '8px 0', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(pagamentos ?? []).map((p, i) => {
                  const cliente = (p.contratos as { cliente_nome: string } | null)?.cliente_nome ?? '—'
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '10px 0', color: 'var(--fg)' }}>{p.descricao ?? '—'}</td>
                      <td style={{ padding: '10px 0', color: 'var(--muted-fg)' }}>{cliente}</td>
                      <td style={{ padding: '10px 0', color: 'var(--muted-fg)' }}>{fmtData(String(p.data_vencimento).slice(0, 10))}</td>
                      <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--fg)' }}>{fmtMoeda(Number(p.valor))}</td>
                      <td style={{ padding: '10px 0' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: p.status === 'pago' ? '#E7F5EE' : '#F7E8C8',
                          color: p.status === 'pago' ? '#11704E' : '#9A6B12',
                        }}>
                          {p.status === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Contratos ativos */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 12 }}>
            Contratos ativos ({contratosAtivos.length})
          </p>
          {contratosAtivos.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>Nenhum contrato ativo.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['Cliente','Tipo','Valor mensal','Renovação'].map(h => (
                    <th key={h} style={{ padding: '8px 0', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contratosAtivos.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '10px 0', color: 'var(--fg)', fontWeight: 600 }}>{c.cliente_nome}</td>
                    <td style={{ padding: '10px 0', color: 'var(--muted-fg)' }}>{c.tipo ?? c.titulo ?? '—'}</td>
                    <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--fg)' }}>{fmtMoeda(Number(c.valor_total))}</td>
                    <td style={{ padding: '10px 0', color: 'var(--muted-fg)' }}>
                      {c.data_renovacao ? fmtData(c.data_renovacao) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Rodapé */}
        <div style={{ paddingTop: 16, borderTop: '1px solid var(--card-border)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--faint)' }}>
            ContractFlow · Gestão de contratos para MEIs · contractflow.com.br
          </p>
        </div>
      </div>
    </>
  )
}
