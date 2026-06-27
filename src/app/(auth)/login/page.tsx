'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff } from 'lucide-react'

function LogoIcon() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: 'var(--primary)',
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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setLoading(false)
    if (error) { setErro('Email ou senha incorretos.'); return }
    router.push('/dashboard')
    router.refresh()
  }

  const inputBase: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 14px',
    borderRadius: 10, border: '1px solid var(--input-border)',
    background: 'var(--surface)', fontSize: 14, outline: 'none',
    color: 'var(--fg)', transition: 'border-color 0.15s',
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
            Bem-vinda de volta
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginBottom: 28 }}>
            Acesse e gerencie seus contratos.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                style={inputBase}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--input-border)')}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>Senha</label>
                <a href="#" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                  Esqueci a senha
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={verSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ ...inputBase, paddingRight: 44 }}
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--input-border)')}
                />
                <button
                  type="button"
                  onClick={() => setVerSenha(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-fg)',
                    padding: 0, display: 'flex', alignItems: 'center',
                  }}
                >
                  {verSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && (
              <div style={{
                padding: '10px 14px', borderRadius: 9, fontSize: 13,
                color: 'var(--destructive)', background: 'var(--destructive-bg)',
              }}>
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 44, borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1, marginTop: 4,
              }}
            >
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 14, color: 'var(--muted-fg)', textAlign: 'center' }}>
            Não tem conta?{' '}
            <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Criar grátis
            </Link>
          </p>
        </div>
      </div>

      {/* Direita — depoimento */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px', background: 'var(--sidebar-bg)',
        borderLeft: '1px solid var(--sidebar-border)',
      }}
        className="hidden lg:flex"
      >
        <div style={{ maxWidth: 360 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 28, fontSize: 22,
          }}>
            💬
          </div>
          <blockquote style={{
            fontSize: 20, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.5, marginBottom: 24,
          }}>
            "Antes eu perdia renovação por esquecimento. Agora o ContractFlow me avisa antes."
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 20,
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700,
            }}>
              RC
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>Rafael Costa</p>
              <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>MEI · Marketing digital</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
