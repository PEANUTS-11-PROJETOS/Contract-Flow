'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { FileSignature, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
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

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — visual */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: 'var(--sidebar-bg)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <FileSignature className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-lg font-semibold">ContractFlow</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Seus contratos,<br />organizados.
          </h1>
          <p style={{ color: 'var(--sidebar-muted)' }} className="text-lg">
            Gerencie contratos, pagamentos e documentos em um só lugar.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { n: '100%', l: 'documentos seguros' },
              { n: '∞', l: 'contratos por plano' },
              { n: '1 min', l: 'para criar um contrato' },
              { n: '0 papel', l: 'tudo digital' },
            ].map(({ n, l }) => (
              <div key={l} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <p className="text-2xl font-bold text-white">{n}</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--sidebar-muted)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm" style={{ color: 'var(--sidebar-muted)' }}>© 2026 ContractFlow</p>
      </div>

      {/* Painel direito — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <FileSignature className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">ContractFlow</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>Bem-vindo de volta</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all"
                style={{ borderColor: 'var(--input-border)', background: 'var(--bg)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--input-border)')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all"
                style={{ borderColor: 'var(--input-border)', background: 'var(--bg)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--input-border)')}
              />
            </div>

            {erro && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ color: 'var(--destructive)', background: '#fef2f2' }}>
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: 'var(--primary)', color: 'var(--primary-fg)' }}
              onMouseEnter={e => !loading && ((e.target as HTMLElement).style.background = 'var(--primary-hover)')}
              onMouseLeave={e => ((e.target as HTMLElement).style.background = 'var(--primary)')}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-sm text-center" style={{ color: 'var(--muted-fg)' }}>
            Não tem conta?{' '}
            <Link href="/signup" className="font-medium" style={{ color: 'var(--primary)' }}>
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
