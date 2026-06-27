import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const MODELOS = [
  {
    tipo: 'Prestação de serviço',
    emoji: '🔧',
    desc: 'Ideal para serviços avulsos ou projetos com início e fim definidos.',
    exemplos: ['Desenvolvimento de site', 'Design gráfico', 'Fotografia de evento'],
    cor: { bg: '#E7F5EE', dot: '#11704E' },
  },
  {
    tipo: 'Social media',
    emoji: '📱',
    desc: 'Gestão de redes sociais com pagamento mensal recorrente.',
    exemplos: ['Instagram + Feed', 'Stories + Reels', 'Pacote completo'],
    cor: { bg: '#E8F0FE', dot: '#1A56DB' },
  },
  {
    tipo: 'Consultoria',
    emoji: '💡',
    desc: 'Consultoria estratégica, mentoria ou assessoria especializada.',
    exemplos: ['Consultoria financeira', 'Mentoria de negócios', 'Assessoria jurídica'],
    cor: { bg: '#FDF2FA', dot: '#9C27B0' },
  },
  {
    tipo: 'Fornecimento',
    emoji: '📦',
    desc: 'Fornecimento contínuo de produtos ou matéria-prima.',
    exemplos: ['Fornecimento mensal', 'Contrato anual', 'Entrega recorrente'],
    cor: { bg: '#FFF8E1', dot: '#F57F17' },
  },
]

export default async function ModelosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ maxWidth: 800 }}>
      <style>{`
        .modelo-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: var(--surface);
          border: 1px solid var(--card-border);
          border-radius: 13px;
          padding: 24px;
          text-decoration: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .modelo-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 16px rgba(30,158,106,0.10);
        }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)' }}>Modelos</h1>
        <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginTop: 4 }}>
          Comece um novo contrato a partir de um modelo pré-configurado.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {MODELOS.map(m => (
          <Link
            key={m.tipo}
            href={`/contratos/novo?tipo=${encodeURIComponent(m.tipo)}`}
            className="modelo-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: m.cor.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {m.emoji}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>{m.tipo}</p>
                <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>{m.desc}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {m.exemplos.map(ex => (
                <div key={ex} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: 3, flexShrink: 0,
                    background: m.cor.dot,
                  }} />
                  <span style={{ fontSize: 13, color: 'var(--muted-fg)' }}>{ex}</span>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 14, borderTop: '1px solid var(--card-border)',
              marginTop: 'auto',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                Usar este modelo →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div style={{
        marginTop: 24, padding: '16px 20px', borderRadius: 12,
        background: 'var(--primary-light)', border: '1px solid var(--primary-tint)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-700)' }}>
            Prefere começar do zero?
          </p>
          <p style={{ fontSize: 13, color: 'var(--primary-700)', opacity: 0.8, marginTop: 2 }}>
            Crie um contrato personalizado com todos os campos em branco.
          </p>
        </div>
        <Link href="/contratos/novo" style={{
          padding: '9px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          color: '#fff', background: 'var(--primary)', textDecoration: 'none', flexShrink: 0,
        }}>
          + Contrato em branco
        </Link>
      </div>
    </div>
  )
}
