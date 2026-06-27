'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, User, Mail, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

const inputBase: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 14px',
  borderRadius: 9, border: '1px solid var(--input-border)',
  background: 'var(--bg)', fontSize: 14, outline: 'none',
  color: 'var(--fg)', transition: 'border-color 0.15s',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)', borderRadius: 13,
  border: '1px solid var(--card-border)', padding: 24,
  display: 'flex', flexDirection: 'column', gap: 18,
  marginBottom: 20,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{label}</label>
      {children}
    </div>
  )
}

export function ConfiguracoesForm({ email, nomeInicial }: { email: string; nomeInicial: string }) {
  const router = useRouter()
  const [nome,       setNome]       = useState(nomeInicial)
  const [novaSenha,  setNovaSenha]  = useState('')
  const [confirmSenha, setConfirmSenha] = useState('')
  const [savingPerfil, setSavingPerfil] = useState(false)
  const [savingSenha,  setSavingSenha]  = useState(false)

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) { toast.error('Informe seu nome.'); return }
    setSavingPerfil(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSavingPerfil(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({ nome: nome.trim() })
      .eq('id', user.id)

    setSavingPerfil(false)
    if (error) { toast.error('Erro ao salvar perfil.'); return }
    toast.success('Perfil atualizado!')
    router.refresh()
  }

  async function salvarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (novaSenha.length < 6)      { toast.error('Senha precisa ter ao menos 6 caracteres.'); return }
    if (novaSenha !== confirmSenha) { toast.error('As senhas não coincidem.'); return }
    setSavingSenha(true)

    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setSavingSenha(false)
    if (error) { toast.error('Erro ao alterar senha.'); return }
    toast.success('Senha alterada com sucesso!')
    setNovaSenha('')
    setConfirmSenha('')
  }

  return (
    <>
      {/* Perfil */}
      <form onSubmit={salvarPerfil}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <User size={16} style={{ color: 'var(--primary)' }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Perfil
            </p>
          </div>

          <Field label="Nome completo">
            <input
              style={inputBase}
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome ou nome do MEI"
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--input-border)')}
            />
          </Field>

          <Field label="E-mail">
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-fg)' }} />
              <input
                style={{ ...inputBase, paddingLeft: 36, color: 'var(--muted-fg)', background: 'var(--surface-muted)' }}
                value={email}
                disabled
              />
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted-fg)' }}>O e-mail não pode ser alterado.</p>
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={savingPerfil} style={{
              padding: '9px 22px', borderRadius: 9, fontSize: 14, fontWeight: 700,
              color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, opacity: savingPerfil ? 0.7 : 1,
            }}>
              {savingPerfil && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {savingPerfil ? 'Salvando...' : 'Salvar perfil'}
            </button>
          </div>
        </div>
      </form>

      {/* Senha */}
      <form onSubmit={salvarSenha}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Lock size={16} style={{ color: 'var(--primary)' }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Alterar senha
            </p>
          </div>

          <Field label="Nova senha">
            <input
              type="password"
              style={inputBase}
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--input-border)')}
            />
          </Field>

          <Field label="Confirmar nova senha">
            <input
              type="password"
              style={inputBase}
              value={confirmSenha}
              onChange={e => setConfirmSenha(e.target.value)}
              placeholder="Repita a nova senha"
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--input-border)')}
            />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={savingSenha} style={{
              padding: '9px 22px', borderRadius: 9, fontSize: 14, fontWeight: 700,
              color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, opacity: savingSenha ? 0.7 : 1,
            }}>
              {savingSenha && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {savingSenha ? 'Alterando...' : 'Alterar senha'}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
