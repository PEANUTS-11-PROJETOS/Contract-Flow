'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FileSignature, LayoutDashboard, FileText, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const nav = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/contratos',  label: 'Contratos',  icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex flex-col w-60 h-full shrink-0" style={{ background: 'var(--sidebar-bg)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--primary)' }}>
          <FileSignature className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-base">ContractFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? 'var(--sidebar-active)' : 'transparent',
                color: active ? '#fff' : 'var(--sidebar-muted)',
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sair */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={sair}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ color: 'var(--sidebar-muted)' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
