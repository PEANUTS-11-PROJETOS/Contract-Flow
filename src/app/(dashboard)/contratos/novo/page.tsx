import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NovoContratoForm } from './NovoContratoForm'
import { LimiteBanner } from './LimiteBanner'

const TIPOS        = ['Prestação de serviço', 'Social media', 'Consultoria', 'Fornecimento']
const ADMIN_EMAIL  = 'soaresvinicius11112@gmail.com'

export default async function NovoContratoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params      = await searchParams
  const tipoParam   = params.tipo ?? ''
  const tipoInicial = TIPOS.includes(tipoParam) ? tipoParam : 'Prestação de serviço'

  // Admin nunca tem limite
  if (user.email === ADMIN_EMAIL) return <NovoContratoForm tipoInicial={tipoInicial} />

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from('profiles').select('plano').eq('id', user.id).single(),
    supabase.from('contratos').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const plano = profile?.plano ?? 'gratuito'
  const total = count ?? 0

  if (plano === 'gratuito' && total >= 5) {
    return (
      <div style={{ maxWidth: 640 }}>
        <Link href="/contratos" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--muted-fg)', textDecoration: 'none', marginBottom: 20, fontWeight: 500,
        }}>
          <ArrowLeft size={14} /> Contratos
        </Link>
        <LimiteBanner />
      </div>
    )
  }

  return <NovoContratoForm tipoInicial={tipoInicial} />
}
