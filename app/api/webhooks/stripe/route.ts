import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

/**
 * Webhook de Stripe: al completar una suscripción, actualiza la tabla subscriptions.
 * En Stripe Dashboard → Developers → Webhooks añade: https://tu-dominio.com/api/webhooks/stripe
 * Eventos: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
 * Requiere: STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET no configurado');
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Falta stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // Usar el método estático de Stripe para verificar el webhook
    event = Stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Verificación fallida';
    console.error('Stripe webhook signature verification failed:', msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para el webhook');
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  const syncSubscription = async (userId: string, plan: string, type: string | undefined, status: 'active' | 'inactive') => {
    // Formato del plan: "premium_visitante", "vip_anunciante", etc.
    let planValue = plan === 'vip' ? 'vip' : plan === 'premium' ? 'premium' : 'free';
    if (type && planValue !== 'free') {
      planValue = `${planValue}_${type}`;
    }
    
    await supabase.from('subscriptions').upsert(
      {
        user_id: userId,
        plan: planValue,
        status,
      },
      { onConflict: 'user_id' }
    );
  };

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        let userId = session.client_reference_id ?? null;
        let plan = 'premium';
        let type: string | undefined;
        if (session.subscription && typeof session.subscription === 'string' && stripeSecret) {
          const stripe = new Stripe(stripeSecret);
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          userId = sub.metadata?.user_id ?? userId;
          plan = (sub.metadata?.plan as string) || 'premium';
          type = sub.metadata?.type;
        }
        if (userId) {
          await syncSubscription(userId, plan, type, 'active');
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        const plan = sub.metadata?.plan || 'premium';
        const type = sub.metadata?.type;
        const active = sub.status === 'active';
        if (userId) {
          await syncSubscription(userId, plan, type, active ? 'active' : 'inactive');
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (userId) {
          await syncSubscription(userId, 'free', undefined, 'inactive');
        }
        break;
      }
      default:
        // Otros eventos los ignoramos
        break;
    }
  } catch (err) {
    console.error('Error procesando webhook Stripe:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
