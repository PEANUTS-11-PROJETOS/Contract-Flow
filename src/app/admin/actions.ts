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

  // LGPD — direito ao esquecimento: apaga todos os arquivos do Storage antes de deletar a conta
  const { data: arquivos } = await admin.storage
    .from('arquivos')
    .list(userId, { limit: 1000 })

  if (arquivos && arquivos.length > 0) {
    // Lista recursiva: userId/contratos/{id}/contrato/ e /comprovantes/
    const { data: contratos } = await admin.from('contratos').select('id').eq('user_id', userId)
    const paths: string[] = []
    for (const c of contratos ?? []) {
      for (const pasta of ['contrato', 'comprovantes']) {
        const { data: files } = await admin.storage
          .from('arquivos')
          .list(`${userId}/contratos/${c.id}/${pasta}`)
        for (const f of files ?? []) {
          paths.push(`${userId}/contratos/${c.id}/${pasta}/${f.name}`)
        }
      }
    }
    if (paths.length > 0) {
      await admin.storage.from('arquivos').remove(paths)
    }
  }

  // Deleta dados — contratos e pagamentos têm ON DELETE CASCADE, mas garantimos a ordem
  await admin.from('pagamentos').delete().eq('user_id', userId)
  await admin.from('contratos').delete().eq('user_id', userId)
  await admin.from('profiles').delete().eq('id', userId)
  await admin.auth.admin.deleteUser(userId)
  revalidatePath('/admin')
}
