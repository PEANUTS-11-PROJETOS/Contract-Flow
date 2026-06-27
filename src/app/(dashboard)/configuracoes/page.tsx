import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConfiguracoesForm } from './ConfiguracoesForm'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nome')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)' }}>Configurações</h1>
        <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginTop: 4 }}>Gerencie seu perfil e dados da conta</p>
      </div>

      <ConfiguracoesForm
        email={user.email ?? ''}
        nomeInicial={profile?.nome ?? ''}
      />
    </div>
  )
}
