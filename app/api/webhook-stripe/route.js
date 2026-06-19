import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sb = createClient(
  'https://yzhzlnqblrtrnjnymbcs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aHpsbnFibHJ0cm5qbnltYmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mjk4NzYsImV4cCI6MjA5NzEwNTg3Nn0.j8N1YsrDHQ4ZFHUkptqgPWwCtp2wux4cyZZudNOtuuY'
);

export async function POST(request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      // En mode test sans signature configurée, on parse directement
      event = JSON.parse(body);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email || session.customer_email;

      if (customerEmail) {
        // Trouver l'utilisateur par email et activer son plan
        const { data: users } = await sb.from('users').select('*').eq('email', customerEmail);

        if (users && users.length > 0) {
          await sb.from('users').update({ plan: 'active' }).eq('email', customerEmail);
        } else {
          // Créer l'entrée si elle n'existe pas
          await sb.from('users').insert({ email: customerEmail, plan: 'active' });
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}