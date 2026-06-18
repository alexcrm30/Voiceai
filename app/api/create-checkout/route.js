import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51TjlmY2XZ8SD1mVLCtuo1zHjXjF3lyeXPOaqwMYv2duhulZATpS78mjQ6f3nwfM88bg2STP5c21BMoFZSWLh12Oz00y0BYiLXc');

export async function POST(request) {
  try {
    const { plan } = await request.json();

    const prices = {
      starter: 4900,   // 49€
      pro: 9900,       // 99€
      enterprise: 29900 // 299€
    };

    const names = {
      starter: 'VoiceAI Starter — 1 agent, 500 min/mois',
      pro: 'VoiceAI Pro — 3 agents, 2000 min/mois',
      enterprise: 'VoiceAI Enterprise — Agents illimités'
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: names[plan] || names.starter },
          unit_amount: prices[plan] || prices.starter,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      success_url: 'https://voiceai-8v2o.vercel.app/dashboard?payment=success',
      cancel_url: 'https://voiceai-8v2o.vercel.app/dashboard?payment=cancel',
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}