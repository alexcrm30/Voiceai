'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://yzhzlnqblrtrnjnymbcs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aHpsbnFibHJ0cm5qbnltYmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mjk4NzYsImV4cCI6MjA5NzEwNTg3Nn0.j8N1YsrDHQ4ZFHUkptqgPWwCtp2wux4cyZZudNOtuuY'
);

const steps = ['Bienvenue', 'Votre entreprise', 'Votre agent', 'Horaires', 'Terminé'];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '',
    businessName: '', businessType: '', phone: '', address: '',
    agentName: '', greeting: '', template: '',
    mondayFriday: '9h-18h', saturday: 'Fermé', sunday: 'Fermé',
    services: '',
  });

  function update(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function finish() {
    setLoading(true);
    try {
      // Créer le compte
      const { data: authData, error: authError } = await sb.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) throw authError;

      const userId = authData.user?.id;

      // Créer le profil
      await sb.from('users').upsert({
        id: userId,
        email: form.email,
        name: form.businessName,
        plan: 'starter',
      });

      // Créer l'agent
      await sb.from('agents').insert({
        user_id: userId,
        name: form.agentName || `Agent ${form.businessName}`,
        description: `Assistant vocal pour ${form.businessName}`,
        status: 'online',
        satisfaction: 0,
        resolution: '0%',
        transfert: true,
        is_rdv: true,
        greeting: form.greeting || `Bonjour, vous êtes bien chez ${form.businessName}. Comment puis-je vous aider ?`,
        template: form.template,
        type: form.businessType,
      });

      setStep(4);
    } catch(e) {
      alert('Erreur : ' + e.message);
    }
    setLoading(false);
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e5e5e5', borderRadius: 8,
    fontSize: 13, fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box',
    marginTop: 4,
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 12,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0e1a, #1a1836)', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 40, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>

        {/* LOGO */}
        <div style={{ fontSize: 20, fontWeight: 700, color: '#534AB7', marginBottom: 6 }}>🎙️ VoiceAI</div>

        {/* PROGRESS */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#534AB7' : '#e5e5e5', transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* ÉTAPE 0 — BIENVENUE */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Bienvenue sur VoiceAI 👋</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>Configurez votre assistant vocal en 5 minutes. Il répondra à vos appels 24h/24, 7j/7.</p>
            <label style={labelStyle}>
              Email
              <input style={inputStyle} type="email" placeholder="vous@entreprise.com" value={form.email} onChange={e => update('email', e.target.value)} />
            </label>
            <label style={labelStyle}>
              Mot de passe
              <input style={inputStyle} type="password" placeholder="8 caractères minimum" value={form.password} onChange={e => update('password', e.target.value)} />
            </label>
            <button onClick={() => setStep(1)} style={{ width: '100%', padding: 12, background: '#534AB7', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 8 }}>
              Commencer →
            </button>
          </div>
        )}

        {/* ÉTAPE 1 — ENTREPRISE */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Votre entreprise</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Ces informations seront utilisées par votre agent vocal.</p>
            <label style={labelStyle}>
              Nom de l'entreprise
              <input style={inputStyle} placeholder="Ex: Cabinet Dr. Martin" value={form.businessName} onChange={e => update('businessName', e.target.value)} />
            </label>
            <label style={labelStyle}>
              Type d'activité
              <select style={inputStyle} value={form.businessType} onChange={e => update('businessType', e.target.value)}>
                <option value="">Choisir...</option>
                <option value="medecin">🩺 Cabinet médical</option>
                <option value="coiffeur">✂️ Salon de coiffure</option>
                <option value="garage">🔧 Garage automobile</option>
                <option value="avocat">⚖️ Cabinet d'avocat</option>
                <option value="restaurant">🍽️ Restaurant</option>
                <option value="artisan">🔨 Artisan / BTP</option>
                <option value="autre">Autre</option>
              </select>
            </label>
            <label style={labelStyle}>
              Téléphone actuel
              <input style={inputStyle} placeholder="+33 6 12 34 56 78" value={form.phone} onChange={e => update('phone', e.target.value)} />
            </label>
            <label style={labelStyle}>
              Adresse
              <input style={inputStyle} placeholder="12 rue de la Paix, Paris" value={form.address} onChange={e => update('address', e.target.value)} />
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setStep(0)} style={{ flex: 1, padding: 12, background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>← Retour</button>
              <button onClick={() => setStep(2)} style={{ flex: 2, padding: 12, background: '#534AB7', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Continuer →</button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — AGENT */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Votre agent vocal</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Personnalisez comment votre agent se présente.</p>
            <label style={labelStyle}>
              Prénom de l'agent
              <input style={inputStyle} placeholder="Ex: Sophie, Alex, Julie..." value={form.agentName} onChange={e => update('agentName', e.target.value)} />
            </label>
            <label style={labelStyle}>
              Message d'accueil
              <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                placeholder={`Bonjour, vous êtes bien chez ${form.businessName || 'notre entreprise'}. Comment puis-je vous aider ?`}
                value={form.greeting} onChange={e => update('greeting', e.target.value)} />
            </label>
            <label style={labelStyle}>
              Services proposés
              <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
                placeholder="Ex: consultations, urgences, renouvellement d'ordonnances..."
                value={form.services} onChange={e => update('services', e.target.value)} />
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: 12, background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>← Retour</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, padding: 12, background: '#534AB7', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Continuer →</button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — HORAIRES */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Vos horaires</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Votre agent communiquera ces horaires à vos clients.</p>
            <label style={labelStyle}>
              Lundi — Vendredi
              <input style={inputStyle} placeholder="9h-12h et 14h-18h" value={form.mondayFriday} onChange={e => update('mondayFriday', e.target.value)} />
            </label>
            <label style={labelStyle}>
              Samedi
              <input style={inputStyle} placeholder="9h-12h ou Fermé" value={form.saturday} onChange={e => update('saturday', e.target.value)} />
            </label>
            <label style={labelStyle}>
              Dimanche
              <input style={inputStyle} placeholder="Fermé" value={form.sunday} onChange={e => update('sunday', e.target.value)} />
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: 12, background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>← Retour</button>
              <button onClick={finish} disabled={loading} style={{ flex: 2, padding: 12, background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                {loading ? 'Création...' : '✓ Terminer la configuration'}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 4 — TERMINÉ */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Votre agent est prêt !</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>
              Votre assistant vocal est configuré et opérationnel. Connectez-vous à votre dashboard pour le tester.
            </p>
            <div style={{ background: '#EEEDFE', borderRadius: 10, padding: 16, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#534AB7', marginBottom: 8 }}>Prochaines étapes</div>
              <div style={{ fontSize: 13, color: '#534AB7', lineHeight: 1.8 }}>
                ✓ Testez votre agent depuis le dashboard<br/>
                ✓ Redirigez vos appels vers votre numéro VoiceAI<br/>
                ✓ Recevez vos rapports d'appels par email
              </div>
            </div>
            <a href="/dashboard" style={{ display: 'block', padding: 12, background: '#534AB7', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              Accéder au dashboard →
            </a>
          </div>
        )}

      </div>
    </div>
  );
}