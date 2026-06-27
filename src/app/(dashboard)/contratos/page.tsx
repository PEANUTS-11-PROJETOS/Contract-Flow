import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ContratosLista } from '@/components/dashboard/contratos-lista'

export default async function ContratosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contratos } = await supabase
    .from('contratos')
    .select('id, titulo, tipo, cliente_nome, valor_total, periodicidade, data_renovacao')
    .order('created_at', { ascending: false })

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)' }}>Contratos</h1>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginTop: 4 }}>
            {contratos?.length ?? 0} contrato{contratos?.length !== 1 ? 's' : ''} no total
          </p>
        </div>
        <Link href="/contratos/novo" style={{
          padding: '9px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          color: '#fff', background: 'var(--primary)', textDecoration: 'none',
        }}>
          + Novo contrato
        </Link>
      </div>

      <ContratosLista contratos={contratos ?? []} />
    </div>
  )
}
