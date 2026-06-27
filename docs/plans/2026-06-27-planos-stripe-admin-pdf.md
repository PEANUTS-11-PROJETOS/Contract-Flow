# Planos + Stripe + Admin + PDF — Implementation Plan

**Goal:** Implementar controle real de planos (gratuito/pro), Stripe para cobrança, admin com gestão de usuários, limite de 5 contratos no free e relatório PDF.

**Architecture:** Tabela `profiles` centraliza o estado do plano de cada usuário. Server Actions autenticadas executam mutações admin. Stripe webhooks atualizam `profiles` automaticamente. PDF é uma rota de impressão sem dependências extras.

**Tech Stack:** Next.js 16 App Router, Supabase (service role para admin), Stripe Node SDK, CSS `@media print`

---

## Arquivos criados/modificados

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `supabase/profiles_migration.sql` | Criar | Tabela profiles + trigger new user |
| `src/lib/supabase/admin.ts` | Já existe | — |
| `src/app/admin/actions.ts` | Criar | Server Actions: setPlano, setAtivo |
| `src/app/admin/page.tsx` | Modificar | UI melhorada com controles |
| `src/app/(dashboard)/contratos/novo/page.tsx` | Modificar | Bloquear criação se free + ≥ 5 contratos |
| `src/app/(dashboard)/contratos/novo/LimiteBanner.tsx` | Criar | Banner de upgrade (client component) |
| `src/app/api/stripe/checkout/route.ts` | Criar | Gera sessão de checkout Stripe |
| `src/app/api/stripe/webhook/route.ts` | Criar | Processa eventos Stripe → atualiza profiles |
| `src/lib/stripe.ts` | Criar | Instância singleton do Stripe |
| `src/app/(dashboard)/relatorio/page.tsx` | Criar | Relatório mensal printável |
| `src/components/dashboard/sidebar.tsx` | Modificar | Adicionar link Relatório |
| `.env.local` | Modificar | Adicionar vars Stripe |

---

## Task 1: Tabela `profiles` no Supabase

**Files:**
- Criar: `supabase/profiles_migration.sql`

- [ ] **1.1 — Criar o arquivo SQL**

```sql
-- supabase/profiles_migration.sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id                   uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email                text,
  plano                text        NOT NULL DEFAULT 'gratuito'
                                   CHECK (plano IN ('gratuito', 'pro')),
  ativo                boolean     NOT NULL DEFAULT true,
  stripe_customer_id   text,
  stripe_subscription_id text,
  trial_expires_at     timestamptz DEFAULT (now() + interval '15 days'),
  plano_expires_at     timestamptz,
  created_at           timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger: cria profile automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill: cria profiles para usuários já existentes
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

- [ ] **1.2 — Rodar no Supabase SQL Editor**

Acesse: Supabase Dashboard → SQL Editor → cole e execute.

Verifique: Table Editor → `profiles` deve aparecer com 1 linha (seu usuário).

---

## Task 2: Server Actions do Admin

**Files:**
- Criar: `src/app/admin/actions.ts`

- [ ] **2.1 — Criar o arquivo de actions**

```typescript
// src/app/admin/actions.ts
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
    plano_expires_at: plano === 'pro' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
  })
  revalidatePath('/admin')
}

export async function setAtivo(userId: string, ativo: boolean) {
  await verificarAdmin()
  const admin = createAdminClient()

  await admin.from('profiles').upsert({ id: userId, ativo })

  // Ban/unban na camada de autenticação
  await admin.auth.admin.updateUserById(userId, {
    ban_duration: ativo ? 'none' : '87600h',
  })

  revalidatePath('/admin')
}
```

---

## Task 3: Admin page melhorada

**Files:**
- Modificar: `src/app/admin/page.tsx`

- [ ] **3.1 — Substituir o conteúdo completo**

```typescript
// src/app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { fmtMoeda, fmtData } from '@/lib/utils'
import { setPlano, setAtivo } from './actions'

const ADMIN_EMAIL = 'soaresvinicius11112@gmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()

  const [
    { data: { users } },
    { data: profiles },
    { data: contratos },
    { data: pagamentos },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from('profiles').select('*'),
    admin.from('contratos').select('id, user_id, valor_total, created_at, cliente_nome, tipo, titulo'),
    admin.from('pagamentos').select('valor, status'),
  ])

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))
  const totalUsuarios  = users?.length ?? 0
  const totalContratos = contratos?.length ?? 0
  const receitaTotal   = (pagamentos ?? []).filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0)
  const pendente       = (pagamentos ?? []).filter(p => p.status === 'pendente').reduce((s, p) => s + Number(p.valor), 0)
  const totalPro       = (profiles ?? []).filter(p => p.plano === 'pro').length

  const contratosCount = new Map<string, number>()
  for (const c of (contratos ?? [])) {
    contratosCount.set(c.user_id, (contratosCount.get(c.user_id) ?? 0) + 1)
  }

  const usuariosLista = (users ?? []).map(u => ({
    id:        u.id,
    email:     u.email ?? '—',
    createdAt: u.created_at,
    contratos: contratosCount.get(u.id) ?? 0,
    profile:   profileMap.get(u.id),
  })).sort((a, b) => b.contratos - a.contratos)

  const kpis = [
    { label: 'Usuários',         value: String(totalUsuarios), icon: '👥' },
    { label: 'Plano Pro',        value: String(totalPro),      icon: '⚡' },
    { label: 'Contratos',        value: String(totalContratos), icon: '📄' },
    { label: 'Receita recebida', value: fmtMoeda(receitaTotal), icon: '💰' },
    { label: 'A receber',        value: fmtMoeda(pendente),    icon: '⏳' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0F1117', color: '#E5E7EB', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #1F2937', padding: '0 40px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#161B25',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>ContractFlow</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#7C3AED', color: '#fff' }}>ADMIN</span>
        </div>
        <div style={{ fontSize: 13, color: '#6B7280' }}>{ADMIN_EMAIL}</div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F9FAFB' }}>Painel de administração</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Gerencie usuários, planos e assinaturas</p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 36 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ padding: '18px', borderRadius: 12, background: '#161B25', border: '1px solid #1F2937' }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>{k.icon}</div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#F9FAFB' }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Tabela de usuários */}
        <div style={{ background: '#161B25', border: '1px solid #1F2937', borderRadius: 12 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #1F2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#F9FAFB' }}>Usuários ({totalUsuarios})</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1F2937' }}>
                  {['Usuário', 'Cadastro', 'Plano', 'Trial/Venc.', 'Contratos', 'Status', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuariosLista.map((u, i) => {
                  const isAdmin = u.email === ADMIN_EMAIL
                  const plano   = u.profile?.plano ?? 'gratuito'
                  const ativo   = u.profile?.ativo ?? true
                  const trialExp = u.profile?.trial_expires_at
                  const planoExp = u.profile?.plano_expires_at

                  return (
                    <tr key={u.id} style={{ borderBottom: i < usuariosLista.length - 1 ? '1px solid #1F2937' : 'none', opacity: ativo ? 1 : 0.5 }}>
                      {/* Email */}
                      <td style={{ padding: '14px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#9CA3AF', flexShrink: 0 }}>
                            {u.email.slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, color: '#E5E7EB' }}>
                            {u.email}
                            {isAdmin && <span style={{ marginLeft: 6, fontSize: 10, color: '#7C3AED', fontWeight: 700 }}>ADMIN</span>}
                          </span>
                        </div>
                      </td>

                      {/* Cadastro */}
                      <td style={{ padding: '14px 24px', fontSize: 12, color: '#6B7280' }}>
                        {u.createdAt ? fmtData(u.createdAt.slice(0, 10)) : '—'}
                      </td>

                      {/* Plano atual */}
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: plano === 'pro' ? '#7C3AED22' : '#1F2937',
                          color: plano === 'pro' ? '#A78BFA' : '#9CA3AF',
                        }}>
                          {plano === 'pro' ? '⚡ Pro' : 'Gratuito'}
                        </span>
                      </td>

                      {/* Trial / vencimento */}
                      <td style={{ padding: '14px 24px', fontSize: 12, color: '#6B7280' }}>
                        {plano === 'pro' && planoExp
                          ? `Pro até ${fmtData(planoExp.slice(0, 10))}`
                          : trialExp
                            ? `Trial até ${fmtData(trialExp.slice(0, 10))}`
                            : '—'}
                      </td>

                      {/* Contratos */}
                      <td style={{ padding: '14px 24px', fontSize: 13, color: '#E5E7EB', fontWeight: 600 }}>
                        {u.contratos}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: ativo ? '#E7F5EE22' : '#FBE3DF22',
                          color: ativo ? '#34D399' : '#F87171',
                        }}>
                          {ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      {/* Ações */}
                      <td style={{ padding: '14px 24px' }}>
                        {!isAdmin && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            {/* Mudar plano */}
                            <form action={async () => {
                              'use server'
                              await setPlano(u.id, plano === 'pro' ? 'gratuito' : 'pro')
                            }}>
                              <button type="submit" style={{
                                padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid #374151',
                                background: plano === 'pro' ? '#1F2937' : '#7C3AED22',
                                color: plano === 'pro' ? '#9CA3AF' : '#A78BFA',
                              }}>
                                {plano === 'pro' ? '↓ Free' : '↑ Pro'}
                              </button>
                            </form>

                            {/* Ativar/desativar */}
                            <form action={async () => {
                              'use server'
                              await setAtivo(u.id, !ativo)
                            }}>
                              <button type="submit" style={{
                                padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid #374151',
                                background: ativo ? '#FBE3DF22' : '#E7F5EE22',
                                color: ativo ? '#F87171' : '#34D399',
                              }}>
                                {ativo ? 'Desativar' : 'Ativar'}
                              </button>
                            </form>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contratos recentes */}
        <div style={{ background: '#161B25', border: '1px solid #1F2937', borderRadius: 12, marginTop: 24 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #1F2937' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#F9FAFB' }}>Contratos recentes</p>
          </div>
          <div>
            {(contratos ?? []).slice(0, 10).map((c, i, arr) => (
              <div key={c.id} style={{ padding: '12px 24px', borderBottom: i < arr.length - 1 ? '1px solid #1F2937' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#E5E7EB' }}>{c.cliente_nome}</p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>{c.tipo ?? c.titulo}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#F9FAFB' }}>{fmtMoeda(Number(c.valor_total))}</p>
                  <p style={{ fontSize: 11, color: '#4B5563' }}>{fmtData(c.created_at.slice(0, 10))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Task 4: Limite de 5 contratos no plano free

**Files:**
- Criar: `src/app/(dashboard)/contratos/novo/LimiteBanner.tsx`
- Modificar: `src/app/(dashboard)/contratos/novo/page.tsx`

- [ ] **4.1 — Criar LimiteBanner (client component)**

```typescript
// src/app/(dashboard)/contratos/novo/LimiteBanner.tsx
'use client'
import Link from 'next/link'

export function LimiteBanner() {
  return (
    <div style={{
      background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 12,
      padding: '24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>
        Limite de 5 contratos atingido
      </h2>
      <p style={{ fontSize: 14, color: '#78350F', marginBottom: 20 }}>
        O plano Gratuito suporta até 5 contratos. Faça upgrade para o plano Pro e crie contratos ilimitados.
      </p>
      <a
        href="https://wa.me/5511989408375?text=Olá!%20Quero%20assinar%20o%20plano%20Pro%20do%20ContractFlow."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block', padding: '10px 24px', borderRadius: 9,
          background: '#1E9E6A', color: '#fff', fontWeight: 700, fontSize: 14,
          textDecoration: 'none',
        }}
      >
        Assinar plano Pro via WhatsApp
      </a>
    </div>
  )
}
```

- [ ] **4.2 — Modificar `novo/page.tsx` para checar limite no servidor**

Adicione este trecho ANTES do `return (` no componente `NovoContratoPage`:

```typescript
// No topo do arquivo, adicionar import:
import { createClient } from '@/lib/supabase/server'
import { LimiteBanner } from './LimiteBanner'

// Transformar em Server Component que renderiza o form como client:
// SUBSTITUIR o export default inteiro por:

export default async function NovoContratoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Buscar profile e contagem de contratos em paralelo
  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from('profiles').select('plano').eq('id', user.id).single(),
    supabase.from('contratos').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const plano = profile?.plano ?? 'gratuito'
  const total = count ?? 0

  if (plano === 'gratuito' && total >= 5) {
    return (
      <div style={{ maxWidth: 640 }}>
        <Link href="/contratos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted-fg)', textDecoration: 'none', marginBottom: 20, fontWeight: 500 }}>
          <ArrowLeft size={14} /> Contratos
        </Link>
        <LimiteBanner />
      </div>
    )
  }

  return <NovoContratoForm tipoParam={searchParams.get('tipo')} />
}
```

**Nota:** Isso requer separar o formulário atual em `NovoContratoForm` (client component). Ver passo 4.3.

- [ ] **4.3 — Refatorar: separar formulário em componente client**

Renomear o componente existente `NovoContratoPage` para `NovoContratoForm` e adicionar `'use client'` no topo. O arquivo final terá:

```
'use client' ← no topo
NovoContratoForm (antigo NovoContratoPage, recebe { tipoParam })
```

E no final do arquivo:
```typescript
// Não exportar NovoContratoForm como default — ele é usado pelo Server Component acima
```

O Server Component `NovoContratoPage` (async, sem 'use client') fica no mesmo arquivo mas como `export default`.

---

## Task 5: Stripe — Instalação e configuração

**Files:**
- Criar: `src/lib/stripe.ts`
- Modificar: `.env.local`

- [ ] **5.1 — Instalar Stripe**

```bash
npm install stripe
```

- [ ] **5.2 — Criar variáveis no `.env.local`**

```bash
# Adicionar ao .env.local:
STRIPE_SECRET_KEY=sk_test_...       # Painel Stripe → Developers → API Keys
STRIPE_WEBHOOK_SECRET=whsec_...     # Após criar o webhook (passo 5.4)
STRIPE_PRICE_PRO=price_...          # ID do preço criado no Stripe (passo 5.3)
```

- [ ] **5.3 — Criar produto no Stripe (manual)**

1. Acesse https://dashboard.stripe.com
2. Produtos → Adicionar produto
3. Nome: "ContractFlow Pro"
4. Preço: R$ 29,90/mês, recorrente, moeda BRL
5. Copie o `price_...` ID e coloque em `STRIPE_PRICE_PRO`

- [ ] **5.4 — Criar lib/stripe.ts**

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})
```

---

## Task 6: Stripe — Checkout Route

**Files:**
- Criar: `src/app/api/stripe/checkout/route.ts`

- [ ] **6.1 — Criar rota de checkout**

```typescript
// src/app/api/stripe/checkout/route.ts
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', user.id).single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_PRO!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgraded=true`,
    cancel_url:  `${process.env.NEXT_PUBLIC_URL}/#precos`,
  })

  return NextResponse.json({ url: session.url })
}
```

- [ ] **6.2 — Atualizar botão "Assinar agora" na landing page**

Em `src/app/page.tsx`, trocar o `<a href="https://wa.me/...">Assinar agora</a>` por um botão que chama a API:

```typescript
// Adicionar 'use client' ao componente ou extrair como componente client separado:
// src/components/marketing/BotaoAssinar.tsx
'use client'
import { useState } from 'react'

export function BotaoAssinar() {
  const [loading, setLoading] = useState(false)

  async function assinar() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url, error } = await res.json()
    if (error) {
      // Fallback: WhatsApp se não estiver logado
      window.open('https://wa.me/5511989408375?text=Olá!%20Quero%20assinar%20o%20plano%20Pro%20do%20ContractFlow.', '_blank')
    } else {
      window.location.href = url
    }
    setLoading(false)
  }

  return (
    <button onClick={assinar} disabled={loading} style={{
      display: 'block', width: '100%', textAlign: 'center',
      padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
      color: 'var(--primary)', background: '#fff', border: 'none', cursor: 'pointer', marginBottom: 28,
      opacity: loading ? 0.7 : 1,
    }}>
      {loading ? 'Redirecionando...' : 'Assinar agora'}
    </button>
  )
}
```

Importar `BotaoAssinar` em `src/app/page.tsx` no lugar do `<a>` do plano Pro.

---

## Task 7: Stripe — Webhook

**Files:**
- Criar: `src/app/api/stripe/webhook/route.ts`

- [ ] **7.1 — Criar rota do webhook**

```typescript
// src/app/api/stripe/webhook/route.ts
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: ReturnType<typeof stripe.webhooks.constructEvent>
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session    = event.data.object as { customer: string; subscription: string }
    const customerId = session.customer
    const subId      = session.subscription

    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await admin.from('profiles')
      .update({ plano: 'pro', stripe_subscription_id: subId, plano_expires_at: expires })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub        = event.data.object as { customer: string }
    const customerId = sub.customer

    await admin.from('profiles')
      .update({ plano: 'gratuito', stripe_subscription_id: null, plano_expires_at: null })
      .eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **7.2 — Registrar webhook no Stripe**

1. Painel Stripe → Developers → Webhooks → Add endpoint
2. URL: `https://seu-dominio.vercel.app/api/stripe/webhook`
3. Eventos: `checkout.session.completed`, `customer.subscription.deleted`
4. Copiar o `whsec_...` e adicionar ao `.env.local` e Vercel env vars

---

## Task 8: Relatório mensal PDF

**Files:**
- Criar: `src/app/(dashboard)/relatorio/page.tsx`
- Modificar: `src/components/dashboard/sidebar.tsx`

- [ ] **8.1 — Criar página de relatório**

```typescript
// src/app/(dashboard)/relatorio/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fmtMoeda, fmtData } from '@/lib/utils'

export default async function RelatorioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoje     = new Date()
  const mesAtual = hoje.getMonth()
  const anoAtual = hoje.getFullYear()
  const inicioMes = new Date(anoAtual, mesAtual, 1).toISOString()
  const fimMes    = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59).toISOString()

  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  const [{ data: contratos }, { data: pagamentos }] = await Promise.all([
    supabase.from('contratos').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('pagamentos').select('*, contratos(cliente_nome)')
      .eq('user_id', user.id)
      .gte('data_vencimento', inicioMes)
      .lte('data_vencimento', fimMes)
      .order('data_vencimento'),
  ])

  const recebido  = (pagamentos ?? []).filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0)
  const pendente  = (pagamentos ?? []).filter(p => p.status === 'pendente').reduce((s, p) => s + Number(p.valor), 0)
  const vencidos  = (pagamentos ?? []).filter(p => p.status === 'pendente' && new Date(p.data_vencimento) < hoje)
  const contratosAtivos = (contratos ?? []).filter(c => c.status === 'ativo')

  const mesLabel = `${meses[mesAtual]} ${anoAtual}`

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-page { padding: 0 !important; }
        }
        @page { size: A4; margin: 20mm; }
      `}</style>

      <div className="print-page" style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Ações — não imprimem */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)' }}>Relatório mensal</h1>
          <button
            onClick={() => window.print()}
            style={{
              padding: '10px 20px', borderRadius: 9, fontSize: 14, fontWeight: 700,
              color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer',
            }}
          >
            🖨️ Salvar PDF
          </button>
        </div>

        {/* Cabeçalho do relatório */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 20, borderBottom: '2px solid var(--card-border)' }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)' }}>ContractFlow</p>
            <p style={{ fontSize: 14, color: 'var(--muted-fg)' }}>Relatório de {mesLabel}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>{user.email}</p>
            <p style={{ fontSize: 12, color: 'var(--faint)' }}>Gerado em {fmtData(hoje.toISOString().slice(0, 10))}</p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Recebido no mês',    value: fmtMoeda(recebido), color: '#11704E', bg: '#E7F5EE' },
            { label: 'Pendente no mês',    value: fmtMoeda(pendente), color: '#9A6B12', bg: '#F7E8C8' },
            { label: 'Contratos ativos',   value: String(contratosAtivos.length), color: 'var(--fg)', bg: 'var(--surface)' },
          ].map(k => (
            <div key={k.label} style={{ padding: '16px', borderRadius: 10, background: k.bg, border: '1px solid var(--card-border)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: k.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{k.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Pagamentos do mês */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 12 }}>
            Pagamentos — {mesLabel}
          </p>
          {(pagamentos ?? []).length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted-fg)', padding: '16px 0' }}>Nenhum pagamento neste mês.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['Descrição','Cliente','Vencimento','Valor','Status'].map(h => (
                    <th key={h} style={{ padding: '8px 0', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(pagamentos ?? []).map((p: Record<string, unknown>, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '10px 0', color: 'var(--fg)' }}>{String(p.descricao ?? '—')}</td>
                    <td style={{ padding: '10px 0', color: 'var(--muted-fg)' }}>{String((p.contratos as Record<string,unknown>)?.cliente_nome ?? '—')}</td>
                    <td style={{ padding: '10px 0', color: 'var(--muted-fg)' }}>{fmtData(String(p.data_vencimento).slice(0, 10))}</td>
                    <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--fg)' }}>{fmtMoeda(Number(p.valor))}</td>
                    <td style={{ padding: '10px 0' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: p.status === 'pago' ? '#E7F5EE' : '#F7E8C8',
                        color: p.status === 'pago' ? '#11704E' : '#9A6B12',
                      }}>
                        {p.status === 'pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Contratos ativos */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 12 }}>
            Contratos ativos ({contratosAtivos.length})
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['Cliente','Tipo','Valor mensal','Renovação'].map(h => (
                  <th key={h} style={{ padding: '8px 0', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contratosAtivos.map((c: Record<string, unknown>) => (
                <tr key={String(c.id)} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '10px 0', color: 'var(--fg)', fontWeight: 600 }}>{String(c.cliente_nome ?? '—')}</td>
                  <td style={{ padding: '10px 0', color: 'var(--muted-fg)' }}>{String(c.tipo ?? c.titulo ?? '—')}</td>
                  <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--fg)' }}>{fmtMoeda(Number(c.valor_total))}</td>
                  <td style={{ padding: '10px 0', color: 'var(--muted-fg)' }}>
                    {c.data_renovacao ? fmtData(String(c.data_renovacao)) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rodapé */}
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid var(--card-border)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--faint)' }}>ContractFlow · Gestão de contratos para MEIs · contractflow.com.br</p>
        </div>
      </div>
    </>
  )
}
```

**Nota:** O botão "Salvar PDF" usa `window.print()` — isso é um Client Component. Extrair o botão para `src/app/(dashboard)/relatorio/BotaoPrint.tsx`:

```typescript
// src/app/(dashboard)/relatorio/BotaoPrint.tsx
'use client'
export function BotaoPrint() {
  return (
    <button onClick={() => window.print()} style={{
      padding: '10px 20px', borderRadius: 9, fontSize: 14, fontWeight: 700,
      color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer',
    }}>
      🖨️ Salvar PDF
    </button>
  )
}
```

E usar `<BotaoPrint />` na página do relatório no lugar do `<button onClick>`.

- [ ] **8.2 — Adicionar link Relatório no sidebar**

Em `src/components/dashboard/sidebar.tsx`, adicionar à lista `nav`:

```typescript
import { ..., FileBarChart } from 'lucide-react'

const nav = [
  { href: '/dashboard',   label: 'Painel',     icon: LayoutDashboard },
  { href: '/contratos',   label: 'Contratos',  icon: FileText },
  { href: '/clientes',    label: 'Clientes',   icon: Users },
  { href: '/pagamentos',  label: 'Pagamentos', icon: CreditCard },
  { href: '/modelos',     label: 'Modelos',    icon: BookOpen },
  { href: '/relatorio',   label: 'Relatório',  icon: FileBarChart },
]
```

---

## Ordem de execução recomendada

1. **Task 1** (SQL) → rodar no Supabase antes de qualquer código
2. **Task 2 + 3** (Admin actions + page) → independente, sem deps externas
3. **Task 4** (Limite free) → depende do profiles existir (Task 1)
4. **Task 5 + 6 + 7** (Stripe) → depende de ter conta Stripe criada
5. **Task 8** (Relatório PDF) → independente
