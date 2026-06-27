'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff } from 'lucide-react'

function LogoIcon() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, background: 'var(--primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <path d="M14 2v6h6"/>
        <path d="M9 13l2 2 4-4"/>
      </svg>
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password: senha })
    setLoading(false)
    if (error) { setErro('Erro ao criar conta. Verifique o email informado.'); return }
    if (data.session) { router.push('/dashboard'); router.refresh() }
    else setEnviado(true)
  }

  const inputBase: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 14px',
    borderRadius: 10, border: '1px solid var(--input-border)',
    background: 'var(--surface)', fontSize: 14, outline: 'none',
    color: 'var(--fg)', transition: 'border-color 0.15s',
  }

  if (enviado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 32 }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 28,
            background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 24,
          }}>
            ✉️
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)', marginBottom: 12 }}>Confirme seu email</h2>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', lineHeight: 1.6, marginBottom: 24 }}>
            Enviamos um link de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.
          </p>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
            Voltar ao login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Esquerda — formulário */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px', background: 'var(--bg)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <LogoIcon />
            <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>ContractFlow</span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)', marginBottom: 6 }}>
            Criar conta grátis
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginBottom: 28 }}>
            Preencha os dados para começar.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 }}>
                E-mail
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required style={inputBase}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--input-border)')} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input type={verSenha ? 'text' : 'password'} value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres" required
                  style={{ ...inputBase, paddingRight: 44 }}
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--input-border)')} />
                <button type="button" onClick={() => setVerSenha(v => !v)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-fg)', padding: 0,
                  display: 'flex', alignItems: 'center',
                }}>
                  {verSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 }}>
                Confirmar senha
              </label>
              <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
                placeholder="Repita a senha" required style={inputBase}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--input-border)')} />
            </div>

            {erro && (
              <div style={{
                padding: '10px 14px', borderRadius: 9, fontSize: 13,
                color: 'var(--destructive)', background: 'var(--destructive-bg)',
              }}>
                {erro}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', height: 44, borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.7 : 1, marginTop: 4,
            }}>
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 14, color: 'var(--muted-fg)', textAlign: 'center' }}>
            Já tem conta?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>

      {/* Direita — visual */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 48, background: 'var(--sidebar-bg)', borderLeft: '1px solid var(--sidebar-border)',
      }}
        className="hidden lg:flex"
      >
        <div style={{ maxWidth: 360 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg)', lineHeight: 1.3, marginBottom: 20 }}>
            Comece a organizar<br />seus contratos.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted-fg)', lineHeight: 1.7, marginBottom: 32 }}>
            Gerencie clientes, contratos e pagamentos em um só lugar. Grátis para sempre até 5 contratos.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Alertas de vencimento automáticos', 'Histórico de pagamentos', 'Modelos de contrato prontos'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 11,
                  background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, flexShrink: 0,
                }}>✓</div>
                <span style={{ fontSize: 14, color: 'var(--fg)', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
