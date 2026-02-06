import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * Crea una sesión de Stripe Checkout para suscripción (Premium o VIP, para anunciantes o visitantes).
 * POST body: { plan: 'premium' | 'vip', user_id: string, type: 'anunciante' | 'visitante' }
 * Requiere: STRIPE_SECRET_KEY y los 4 Price IDs (premium_visitante, vip_visitante, premium_anunciante, vip_anunciante)
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const pricePremiumVisitante = process.env.STRIPE_PRICE_PREMIUM_VISITANTE;
  const priceVipVisitante = process.env.STRIPE_PRICE_VIP_VISITANTE;
  const pricePremiumAnunciante = process.env.STRIPE_PRICE_PREMIUM_ANUNCIANTE;
  const priceVipAnunciante = process.env.STRIPE_PRICE_VIP_ANUNCIANTE;

  if (!secret) {
    return NextResponse.json(
      { error: 'Stripe no configurado (falta STRIPE_SECRET_KEY)' },
      { status: 500 }
    );
  }

  let body: { plan?: string; user_id?: string; type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const plan = body.plan === 'vip' ? 'vip' : body.plan === 'premium' ? 'premium' : null;
  const type = body.type === 'anunciante' ? 'anunciante' : body.type === 'visitante' ? 'visitante' : null;
  const userId = typeof body.user_id === 'string' ? body.user_id.trim() : null;

  if (!plan || !userId || !type) {
    return NextResponse.json(
      { error: 'Faltan plan (premium|vip), user_id o type (anunciante|visitante)' },
      { status: 400 }
    );
  }

  // Seleccionar el Price ID correcto según plan y tipo
  let priceId: string | undefined;
  if (plan === 'premium' && type === 'visitante') {
    priceId = pricePremiumVisitante;
  } else if (plan === 'vip' && type === 'visitante') {
    priceId = priceVipVisitante;
  } else if (plan === 'premium' && type === 'anunciante') {
    priceId = pricePremiumAnunciante;
  } else if (plan === 'vip' && type === 'anunciante') {
    priceId = priceVipAnunciante;
  }

  if (!priceId) {
    return NextResponse.json(
      { error: `Falta STRIPE_PRICE_${plan.toUpperCase()}_${type.toUpperCase()} en la configuración` },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secret);
  const origin = request.headers.get('origin') || request.nextUrl.origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/cuenta?stripe=success`,
      cancel_url: `${origin}/tarifas?stripe=cancel`,
      client_reference_id: userId,
      subscription_data: {
        metadata: { user_id: userId, plan, type },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Stripe no devolvió URL de checkout' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al crear la sesión';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
