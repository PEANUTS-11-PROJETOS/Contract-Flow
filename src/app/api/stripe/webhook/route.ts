import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) return NextResponse.json({ error: 'Sem assinatura' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session    = event.data.object as Stripe.Checkout.Session
    const customerId = session.customer as string
    const subId      = session.subscription as string
    const expires    = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await admin.from('profiles')
      .update({ plano: 'pro', stripe_subscription_id: subId, plano_expires_at: expires })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub        = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string

    await admin.from('profiles')
      .update({ plano: 'gratuito', stripe_subscription_id: null, plano_expires_at: null })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.updated') {
    const sub        = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    const ativo      = sub.status === 'active'
    const expires    = new Date(sub.current_period_end * 1000).toISOString()

    await admin.from('profiles')
      .update({
        plano:            ativo ? 'pro' : 'gratuito',
        plano_expires_at: ativo ? expires : null,
      })
      .eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ received: true })
}
