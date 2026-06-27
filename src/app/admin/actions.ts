'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAIL = 'soaresvinicius11112@gmail.com'

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) throw new Error('Não autorizado')
}

export async function setPlano(userId: string, plano: 'gratuito' | 'pro') {
  await verificarAdmin()
  const admin = createAdminClient()
  await admin.from('profiles').upsert({
    id: userId,
    plano,
    plano_expires_at: plano === 'pro'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null,
  })
  revalidatePath('/admin')
}

export async function setAtivo(userId: string, ativo: boolean) {
  await verificarAdmin()
  const admin = createAdminClient()
  await admin.from('profiles').upsert({ id: userId, ativo })
  await admin.auth.admin.updateUserById(userId, {
    ban_duration: ativo ? 'none' : '87600h',
  })
  revalidatePath('/admin')
}

export async function deletarUsuario(userId: string) {
  await verificarAdmin()
  const admin = createAdminClient()
  // Deleta contratos e pagamentos antes (caso RLS impeça cascade)
  await admin.from('pagamentos').delete().eq('user_id', userId)
  await admin.from('contratos').delete().eq('user_id', userId)
  await admin.from('profiles').delete().eq('id', userId)
  await admin.auth.admin.deleteUser(userId)
  revalidatePath('/admin')
}
