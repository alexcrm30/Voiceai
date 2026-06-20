export async function POST(request) {
  try {
    const { businessName, businessType, agentName, greeting, services, mondayFriday, saturday, sunday } = await request.json();

    const templates = {
      coiffeur: 'Tu prends les rendez-vous pour coupes, colorations et soins. Demande toujours quel type de prestation le client souhaite.',
      garage: 'Tu prends les rendez-vous pour réparations et entretiens. Demande la marque et le modèle du véhicule, et le problème rencontré.',
      avocat: 'Tu qualifies les demandes de consultation. Demande le type de litige ou de besoin juridique, sans donner de conseil juridique toi-même.',
      medecin: 'Tu prends les rendez-vous de consultation. Demande le motif de la visite de façon générale, sans poser de questions médicales précises.',
      restaurant: 'Tu prends les réservations de table. Demande le nombre de personnes, la date, l\'heure souhaitée, et toute allergie éventuelle.',
      artisan: 'Tu prends les demandes de devis et d\'intervention. Demande la nature des travaux et l\'adresse d\'intervention.',
      autre: 'Tu aides les clients avec leurs demandes et tu peux prendre des rendez-vous.',
    };

    const systemPrompt = `Tu es ${agentName || 'l\'assistant vocal'} de ${businessName}.
Tu réponds en français de façon chaleureuse, professionnelle et concise (2-3 phrases maximum par réponse).

${templates[businessType] || templates.autre}

Horaires d'ouverture :
- Lundi à Vendredi : ${mondayFriday || 'Non précisé'}
- Samedi : ${saturday || 'Fermé'}
- Dimanche : ${sunday || 'Fermé'}

Services proposés : ${services || 'Non précisé'}

Règles importantes :
- Si tu prends un rendez-vous, confirme toujours la date et l'heure clairement.
- Si tu ne sais pas répondre à une question, propose de transférer vers un humain.
- Reste toujours poli et professionnel.`;

    const res = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: agentName || `Agent ${businessName}`,
        firstMessage: greeting || `Bonjour, vous êtes bien chez ${businessName}. Comment puis-je vous aider ?`,
        model: {
          provider: 'anthropic',
          model: 'claude-3-5-haiku-20241022',
          messages: [{ role: 'system', content: systemPrompt }]
        },
        voice: {
          provider: 'vapi',
          voiceId: 'Elliot'
        },
        transcriber: {
          provider: 'talkscriber',
          language: 'fr'
        },
        serverUrl: 'https://voiceai-8v2o.vercel.app/api/webhook'
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.message || 'Erreur création agent Vapi' }, { status: 400 });
    }

    return Response.json({ assistantId: data.id });
  } catch (error) {
    console.error('Create agent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}