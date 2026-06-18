import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://yzhzlnqblrtrnjnymbcs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aHpsbnFibHJ0cm5qbnltYmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mjk4NzYsImV4cCI6MjA5NzEwNTg3Nn0.j8N1YsrDHQ4ZFHUkptqgPWwCtp2wux4cyZZudNOtuuY'
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { message } = body;

    // Sauvegarder chaque appel terminé
    if (message?.type === 'end-of-call-report') {
      const call = message.call;
      const transcript = message.transcript || '';
      const summary = message.summary || '';

      // Détecter si un RDV a été pris dans le transcript
      const rdvKeywords = ['rendez-vous', 'rdv', 'appointment', 'réservation', 'booking', 'planifié', 'confirmé'];
      const hasRdv = rdvKeywords.some(kw => transcript.toLowerCase().includes(kw) || summary.toLowerCase().includes(kw));

      // Extraire le nom du client depuis le transcript
      let callerName = 'Inconnu';
      const nameMatch = transcript.match(/je m'appelle ([A-Za-zÀ-ÿ\s]+)|c'est ([A-Za-zÀ-ÿ\s]+) qui appelle|mon nom est ([A-Za-zÀ-ÿ\s]+)/i);
      if (nameMatch) {
        callerName = nameMatch[1] || nameMatch[2] || nameMatch[3];
        callerName = callerName.trim();
      }

      // Sauvegarder l'appel dans Supabase
      const { data: callData } = await sb.from('calls').insert({
        caller_name: callerName,
        caller_phone: call?.customer?.number || null,
        status: hasRdv ? 'rdv' : 'done',
        duration: call?.endedAt && call?.startedAt
          ? `${Math.round((new Date(call.endedAt) - new Date(call.startedAt)) / 1000)}s`
          : null,
        summary: summary || transcript.slice(0, 200),
        transcript: transcript,
      }).select().single();

      // Si RDV détecté, l'enregistrer aussi dans appointments
      if (hasRdv && callData) {
        // Extraire une date si mentionnée
        const dateMatch = transcript.match(/(\d{1,2})[\/\-\s](janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|\d{1,2})/i);
        const scheduledAt = dateMatch ? new Date() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await sb.from('appointments').insert({
          client_name: callerName,
          client_phone: call?.customer?.number || null,
          scheduled_at: scheduledAt.toISOString(),
          motif: 'Pris par l\'agent vocal',
          status: 'confirmed',
          call_id: callData.id,
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}