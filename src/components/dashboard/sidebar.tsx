'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { LogOut, LayoutDashboard, FileText, Users, CreditCard, BookOpen, ShieldCheck, FileBarChart, Settings } from 'lucide-react'

const ADMIN_EMAIL = 'soaresvinicius11112@gmail.com'

const nav = [
  { href: '/dashboard',      label: 'Painel',        icon: LayoutDashboard },
  { href: '/contratos',      label: 'Contratos',     icon: FileText },
  { href: '/clientes',       label: 'Clientes',      icon: Users },
  { href: '/pagamentos',     label: 'Pagamentos',    icon: CreditCard },
  { href: '/modelos',        label: 'Modelos',       icon: BookOpen },
  { href: '/relatorio',      label: 'Relatório',     icon: FileBarChart },
  { href: '/configuracoes',  label: 'Configurações', icon: Settings },
]

function getInitials(nome: string, email: string) {
  if (nome.trim()) {
    const parts = nome.trim().split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export function Sidebar({ email, nome }: { email: string; nome: string }) {
  const pathname = usePathname()
  const router   = useRouter()

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
    }}>
      {/* Logo */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10,
        borderBottom: '1px solid var(--sidebar-border)',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6"/>
            <path d="M9 13l2 2 4-4"/>
          </svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>ContractFlow</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/')) || (href === '/contratos' && pathname.startsWith('/contratos'))
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 9, textDecoration: 'none',
                fontSize: 14, fontWeight: active ? 600 : 500,
                background: active ? 'var(--sidebar-active)' : 'transparent',
                color: active ? '#fff' : 'var(--sidebar-muted)',
                transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(30,158,106,0.08)'
                  e.currentTarget.style.color = 'var(--fg)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--sidebar-muted)'
                }
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}

        {/* Admin link — só aparece para o admin */}
        {email === ADMIN_EMAIL && (
          <>
            <div style={{ margin: '8px 12px 4px', height: 1, background: 'var(--sidebar-border)' }} />
            <Link
              href="/admin"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 9, textDecoration: 'none',
                fontSize: 14, fontWeight: pathname === '/admin' ? 600 : 500,
                background: pathname === '/admin' ? '#7C3AED' : 'transparent',
                color: pathname === '/admin' ? '#fff' : '#7C3AED',
                transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => {
                if (pathname !== '/admin') e.currentTarget.style.background = 'rgba(124,58,237,0.1)'
              }}
              onMouseLeave={e => {
                if (pathname !== '/admin') e.currentTarget.style.background = 'transparent'
              }}
            >
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              Admin
            </Link>
          </>
        )}
      </nav>

      {/* User card */}
      <div style={{
        padding: '12px 10px', borderTop: '1px solid var(--sidebar-border)',
      }}>
        <button
          onClick={sair}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 9,
            background: 'none', border: 'none', cursor: 'pointer',
            textAlign: 'left', transition: 'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,158,106,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'var(--primary-tint)', color: 'var(--primary-700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
          }}>
            {getInitials(nome, email)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {nome || email}
            </p>
            <p style={{ fontSize: 11, color: 'var(--muted-fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nome ? email : 'MEI'}</p>
          </div>
          <LogOut size={15} style={{ color: 'var(--muted-fg)', flexShrink: 0 }} />
        </button>
      </div>
    </aside>
  )
}
