import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const sb = createClient(
  'https://yzhzlnqblrtrnjnymbcs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aHpsbnFibHJ0cm5qbnltYmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mjk4NzYsImV4cCI6MjA5NzEwNTg3Nn0.j8N1YsrDHQ4ZFHUkptqgPWwCtp2wux4cyZZudNOtuuY'
);

const resend = new Resend('re_AHUgjUJ4_FFGw2Wk99VLFZmu6hXbv5F96');

export async function POST(request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (message?.type === 'end-of-call-report') {
      const call = message.call;
      const transcript = message.transcript || '';
      const summary = message.summary || '';

      const rdvKeywords = ['rendez-vous', 'rdv', 'réservation', 'confirmé', 'planifié'];
      const hasRdv = rdvKeywords.some(kw =>
        transcript.toLowerCase().includes(kw) ||
        summary.toLowerCase().includes(kw)
      );

      let callerName = 'Inconnu';
      const nameMatch = transcript.match(/je m'appelle ([A-Za-zÀ-ÿ\s]+)|c'est ([A-Za-zÀ-ÿ\s]+) qui appelle|mon nom est ([A-Za-zÀ-ÿ\s]+)/i);
      if (nameMatch) {
        callerName = (nameMatch[1] || nameMatch[2] || nameMatch[3]).trim();
      }

      const duration = call?.endedAt && call?.startedAt
        ? `${Math.round((new Date(call.endedAt) - new Date(call.startedAt)) / 1000)}s`
        : null;

      // Sauvegarder l'appel
      const { data: callData } = await sb.from('calls').insert({
        caller_name: callerName,
        caller_phone: call?.customer?.number || null,
        status: hasRdv ? 'rdv' : 'done',
        duration,
        summary: summary || transcript.slice(0, 200),
        transcript,
      }).select().single();

      // Sauvegarder le RDV si détecté
      if (hasRdv && callData) {
        const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await sb.from('appointments').insert({
          client_name: callerName,
          client_phone: call?.customer?.number || null,
          scheduled_at: scheduledAt.toISOString(),
          motif: "Pris par l'agent vocal",
          status: 'confirmed',
          call_id: callData.id,
        });
      }

      // Envoyer le rapport par email
      await resend.emails.send({
        from: 'VoiceAI <onboarding@resend.dev>',
        to: 'alexcrm30@gmail.com',
        subject: `📞 Rapport d'appel — ${callerName} ${hasRdv ? '(RDV pris ✓)' : ''}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <div style="background:#534AB7;color:white;border-radius:12px;padding:20px;margin-bottom:20px">
              <h1 style="margin:0;font-size:20px">🎙️ VoiceAI — Rapport d'appel</h1>
              <p style="margin:6px 0 0;opacity:0.8;font-size:13px">${new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
            </div>

            <div style="background:#f8f8f7;border-radius:10px;padding:16px;margin-bottom:16px">
              <div style="font-size:12px;color:#888;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Informations</div>
              <div style="font-size:14px;color:#1a1a18"><strong>Appelant :</strong> ${callerName}</div>
              <div style="font-size:14px;color:#1a1a18;margin-top:4px"><strong>Durée :</strong> ${duration || '—'}</div>
              <div style="font-size:14px;color:#1a1a18;margin-top:4px"><strong>RDV pris :</strong> ${hasRdv ? '✅ Oui' : '❌ Non'}</div>
            </div>

            ${summary ? `
            <div style="background:#f8f8f7;border-radius:10px;padding:16px;margin-bottom:16px">
              <div style="font-size:12px;color:#888;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Résumé</div>
              <div style="font-size:14px;color:#1a1a18;line-height:1.6">${summary}</div>
            </div>` : ''}

            ${transcript ? `
            <div style="background:#f8f8f7;border-radius:10px;padding:16px">
              <div style="font-size:12px;color:#888;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Transcript</div>
              <div style="font-size:13px;color:#444;line-height:1.7;white-space:pre-wrap">${transcript.slice(0, 1000)}${transcript.length > 1000 ? '...' : ''}</div>
            </div>` : ''}

            <div style="text-align:center;margin-top:20px">
              <a href="https://voiceai-8v2o.vercel.app/dashboard" style="background:#534AB7;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500">Voir le dashboard →</a>
            </div>
          </div>
        `,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}