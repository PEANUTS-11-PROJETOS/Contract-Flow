import Link from 'next/link'
import { BotaoAssinar } from '@/components/marketing/BotaoAssinar'

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'var(--primary)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6"/>
          <path d="M9 13l2 2 4-4"/>
        </svg>
      </div>
      <span className="font-bold text-base" style={{ color: 'var(--fg)' }}>ContractFlow</span>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
        borderBottom: '1px solid var(--card-border)', background: 'var(--bg)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ display: 'flex', gap: 24, fontSize: 14, color: 'var(--muted-fg)' }}>
            <a href="#recursos" style={{ color: 'inherit', textDecoration: 'none' }}>Recursos</a>
            <a href="#precos" style={{ color: 'inherit', textDecoration: 'none' }}>Preços</a>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/login" style={{
              padding: '8px 16px', borderRadius: 9, fontSize: 14, fontWeight: 600,
              color: 'var(--fg)', border: '1px solid var(--border)', textDecoration: 'none',
              background: 'var(--surface)',
            }}>
              Entrar
            </Link>
            <Link href="/signup" style={{
              padding: '8px 20px', borderRadius: 9, fontSize: 14, fontWeight: 600,
              color: '#fff', background: 'var(--primary)', textDecoration: 'none',
            }}>
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 40px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 20,
              background: 'var(--primary-light)', color: 'var(--primary-700)',
              fontSize: 13, fontWeight: 600, marginBottom: 24,
            }}>
              <span>📋</span> Feito para o MEI brasileiro
            </div>
            <h1 style={{
              fontSize: 42, fontWeight: 800, lineHeight: 1.15,
              color: 'var(--fg)', marginBottom: 20,
            }}>
              Seus contratos<br />sob controle,<br />sem dor de cabeça
            </h1>
            <p style={{ fontSize: 16, color: 'var(--muted-fg)', lineHeight: 1.7, marginBottom: 32 }}>
              Crie, envie e acompanhe contratos em minutos. Receba alertas antes do
              vencimento e nunca perca uma renovação novamente.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <Link href="/signup" style={{
                padding: '12px 28px', borderRadius: 11, fontSize: 15, fontWeight: 700,
                color: '#fff', background: 'var(--primary)', textDecoration: 'none',
              }}>
                Começar grátis
              </Link>
              <Link href="/login" style={{
                padding: '12px 20px', borderRadius: 11, fontSize: 15, fontWeight: 600,
                color: 'var(--fg)', textDecoration: 'none',
              }}>
                Entrar →
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--muted-fg)' }}>
              <span>✓ Sem cartão de crédito</span>
              <span>✓ Pronto em 2 minutos</span>
            </div>
          </div>

          {/* App preview card */}
          <div style={{
            background: 'var(--surface)', borderRadius: 16,
            border: '1px solid var(--card-border)',
            boxShadow: '0 8px 40px rgba(22,36,31,0.08)', overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--card-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>Olá, Marina 👋</p>
                <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>3 contratos vencendo este mês.</p>
              </div>
              <div style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                color: '#fff', background: 'var(--primary)',
              }}>
                + Novo
              </div>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', gap: 12 }}>
              {[
                { n: '12', l: 'Ativos', bg: '#E7F5EE', c: '#11704E' },
                { n: '3', l: 'Vencendo', bg: '#F7E8C8', c: '#9A6B12' },
              ].map(k => (
                <div key={k.l} style={{ flex: 1, padding: '14px 16px', borderRadius: 10, background: k.bg }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: k.c }}>{k.n}</p>
                  <p style={{ fontSize: 12, color: k.c, marginTop: 2 }}>{k.l}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 24px 20px' }}>
              {[
                { nome: 'Studio Bloom', tipo: 'Social media', dias: '5d', vencendo: true },
                { nome: 'Café Loja Norte', tipo: 'Consultoria', dias: '22d', vencendo: true },
                { nome: 'Tech Startup XP', tipo: 'Prestação de serviço', dias: '65d', vencendo: false },
              ].map((c, i) => {
                const bg = c.vencendo ? '#F7E8C8' : '#E7F5EE'
                const co = c.vencendo ? '#9A6B12' : '#11704E'
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                    borderBottom: i < 2 ? '1px solid var(--card-border)' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: bg, color: co, fontSize: 11, fontWeight: 700,
                    }}>
                      {c.nome.split(' ').slice(0, 2).map(w => w[0]).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{c.tipo}</p>
                    </div>
                    <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color: co }}>
                      {c.dias}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 40px 80px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg)', textAlign: 'center', marginBottom: 48 }}>
          Tudo que você precisa para gerir contratos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            {
              icon: '🔔',
              title: 'Alertas de vencimento',
              desc: 'Receba notificações antes do contrato vencer e nunca perca uma renovação.',
            },
            {
              icon: '💰',
              title: 'Controle de pagamentos',
              desc: 'Registre recebimentos, acompanhe o que está pendente e veja o fluxo mensal.',
            },
            {
              icon: '📄',
              title: 'Modelos prontos',
              desc: 'Use modelos de contrato para prestação de serviço, consultoria e Social media.',
            },
          ].map(f => (
            <div key={f.title} style={{
              padding: '28px 24px', borderRadius: 14,
              background: 'var(--surface)', border: '1px solid var(--card-border)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11, marginBottom: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--primary-light)', fontSize: 20,
              }}>
                {f.icon}
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>{f.title}</p>
              <p style={{ fontSize: 14, color: 'var(--muted-fg)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preços */}
      <section id="precos" style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 40px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg)', marginBottom: 12 }}>
            Planos simples e transparentes
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted-fg)' }}>
            Comece grátis. Faça upgrade quando precisar de mais.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 760, margin: '0 auto', alignItems: 'start' }}>
          {/* Gratuito */}
          <div style={{
            padding: '32px 28px', borderRadius: 16,
            background: 'var(--surface)', border: '1px solid var(--card-border)',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Gratuito</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--fg)' }}>R$ 0</span>
              <span style={{ fontSize: 14, color: 'var(--muted-fg)', marginBottom: 6 }}>/mês</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginBottom: 6 }}>15 dias com tudo liberado</p>
            <div style={{
              display: 'inline-flex', padding: '3px 10px', borderRadius: 20,
              background: 'var(--primary-light)', marginBottom: 20,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-700)' }}>✓ Trial de 15 dias grátis</span>
            </div>
            <Link href="/signup" style={{
              display: 'block', textAlign: 'center',
              padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
              color: 'var(--fg)', border: '1.5px solid var(--border)', textDecoration: 'none',
              background: 'var(--surface)', marginBottom: 28,
            }}>
              Criar conta grátis
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Até 5 contratos',
                'Alertas de vencimento',
                'Controle de pagamentos',
                'Modelos prontos',
                '1 usuário',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--primary)', fontSize: 15, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, color: 'var(--muted-fg)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro — destaque */}
          <div style={{
            padding: '32px 28px', borderRadius: 16,
            background: 'var(--primary)', border: '1px solid var(--primary)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
              background: '#F7D070', color: '#7A4E0D',
              padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              whiteSpace: 'nowrap',
            }}>
              Mais popular
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Pro</p>

            {/* Duas opções de preço */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {/* PIX */}
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 18 }}>💸</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>PIX</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10,
                      background: '#F7D070', color: '#7A4E0D',
                    }}>MAIS BARATO</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>R$ 29</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>,90/mês</span>
                  </div>
                </div>
                <a
                  href="https://wa.me/5511989408375?text=Olá!%20Quero%20assinar%20o%20plano%20Pro%20do%20ContractFlow%20via%20PIX%20(R$%2029,90/mês)."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', textAlign: 'center', width: '100%',
                    padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    color: 'var(--primary)', background: '#fff', textDecoration: 'none',
                  }}
                >
                  💬 Assinar via WhatsApp
                </a>
              </div>

              {/* Cartão */}
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 18 }}>💳</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Cartão</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>R$ 31</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>,90/mês</span>
                  </div>
                </div>
                <BotaoAssinar />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Contratos ilimitados',
                'Alertas personalizáveis',
                'Relatório mensal PDF',
                'Modelos editáveis',
                'Suporte via WhatsApp',
                '1 usuário',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#A8DFC4', fontSize: 15, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--faint)', marginTop: 32 }}>
          Todos os planos incluem SSL, backups automáticos e suporte à LGPD.
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--card-border)', padding: '24px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 13, color: 'var(--muted-fg)',
      }}>
        <Logo />
        <p>© 2026 ContractFlow · Todos os direitos reservados</p>
      </footer>
    </div>
  )
}
