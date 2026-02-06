import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

/**
 * Sincroniza la suscripción en nuestra base de datos a partir de una sesión de Stripe Checkout.
 * Se llama desde /cuenta cuando el usuario vuelve de Stripe con ?stripe=success&session_id=...
 * Así la suscripción se actualiza aunque el webhook no haya llegado o falle.
 * Body: { session_id: string, user_id: string }. Se verifica que session.client_reference_id === user_id.
 */
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !stripeSecret) {
    console.error('[sync-checkout-session] Faltan variables de entorno');
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 });
  }

  let body: { session_id?: string; user_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }
  const sessionId = typeof body.session_id === 'string' ? body.session_id.trim() : null;
  const userId = typeof body.user_id === 'string' ? body.user_id.trim() : null;
  if (!sessionId || !userId) {
    return NextResponse.json({ error: 'Faltan session_id o user_id' }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecret);
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error('[sync-checkout-session] Error recuperando sesión Stripe:', err);
    return NextResponse.json({ error: 'Sesión de Stripe no encontrada o inválida' }, { status: 400 });
  }

  const refUserId = session.client_reference_id ?? null;
  if (refUserId !== userId) {
    return NextResponse.json({ error: 'Esta sesión no corresponde al usuario indicado' }, { status: 403 });
  }

  let plan = 'premium';
  let type: string | undefined;
  if (session.subscription) {
    const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
    try {
      const sub = await stripe.subscriptions.retrieve(subId);
      plan = (sub.metadata?.plan as string) || 'premium';
      type = sub.metadata?.type;
    } catch (e) {
      console.error('[sync-checkout-session] Error recuperando suscripción:', e);
    }
  }

  const planValue = plan === 'vip' ? 'vip' : plan === 'premium' ? 'premium' : 'free';
  const planFinal = type && planValue !== 'free' ? `${planValue}_${type}` : planValue;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { error: upsertError } = await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      plan: planFinal,
      status: 'active',
    },
    { onConflict: 'user_id' }
  );

  if (upsertError) {
    console.error('[sync-checkout-session] Error upsert subscription:', upsertError.message);
    return NextResponse.json({ error: 'Error al guardar la suscripción' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, plan: planFinal });
}
