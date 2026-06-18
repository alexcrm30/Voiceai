'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Vapi from '@vapi-ai/web';

const sb = createClient(
  'https://yzhzlnqblrtrnjnymbcs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aHpsbnFibHJ0cm5qbnltYmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mjk4NzYsImV4cCI6MjA5NzEwNTg3Nn0.j8N1YsrDHQ4ZFHUkptqgPWwCtp2wux4cyZZudNOtuuY'
);

const VAPI_KEY = '856a7bae-af7f-49b0-9b60-b7b2b18cea21';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [calls, setCalls] = useState([]);
  const [callActive, setCallActive] = useState(false);
  const [transcript, setTranscript] = useState('En attente...');
  const [vapi, setVapi] = useState(null);
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return; }
      setUser(session.user);
      loadData(session.user);
    });

    const v = new Vapi(VAPI_KEY);
    v.on('call-start', () => setCallActive(true));
    v.on('call-end', () => { setCallActive(false); setTranscript('Appel terminé'); });
    v.on('message', (msg) => {
      if (msg.type === 'transcript') {
        const who = msg.role === 'assistant' ? '🤖' : '👤';
        setTranscript(`${who} ${msg.transcript}`);
      }
    });
    v.on('error', (e) => {
      console.error('Vapi error:', e);
      setCallActive(false);
    });
    setVapi(v);
    return () => { try { v.stop(); } catch(e) {} };
  }, []);

  async function loadData(u) {
    const { data: ag } = await sb.from('agents').select('*').eq('user_id', u.id);
    if (ag && ag.length > 0) {
      setAgents(ag);
    } else {
      const defaults = [
        { user_id: u.id, name: 'Agent Accueil', description: 'Répond aux appels entrants', status: 'online', satisfaction: 91, resolution: '94%', transfert: true, is_rdv: false },
        { user_id: u.id, name: 'Agent RDV', description: 'Gère les rendez-vous', status: 'busy', satisfaction: 88, resolution: '87%', transfert: false, is_rdv: true },
        { user_id: u.id, name: 'Agent FAQ', description: 'Répond aux questions fréquentes', status: 'online', satisfaction: 76, resolution: '79%', transfert: true, is_rdv: false },
      ];
      await sb.from('agents').insert(defaults);
      const { data: fresh } = await sb.from('agents').select('*').eq('user_id', u.id);
      setAgents(fresh || defaults);
    }
    const { data: cl } = await sb.from('calls').select('*').order('created_at', { ascending: false }).limit(20);
    setCalls(cl || []);
  }

  async function startCall() {
    if (!vapi || callActive) return;
    try {
      await vapi.start('c17ac66a-d6c1-484a-89a9-b39d46697531');
    } catch(e) {
      alert('Erreur : ' + e.message);
    }
  }

  function stopCall() {
    if (vapi) { try { vapi.stop(); } catch(e) {} }
    setCallActive(false);
  }

  async function logout() {
    await sb.auth.signOut();
    window.location.href = '/login';
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'agents', label: 'Agents IA' },
    { id: 'appels', label: 'Appels' },
    { id: 'parametres', label: 'Paramètres' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8F8F7' }}>

      {/* SIDEBAR */}
      <div style={{ width: 220, background: 'white', borderRight: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        <div style={{ padding: '0 18px 20px', borderBottom: '1px solid #e5e5e5', marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#534AB7' }}>🎙️ VoiceAI</div>
          <div style={{ fontSize: 11, color: '#888' }}>Assistant vocal IA</div>
        </div>
        {navItems.map(n => (
          <div key={n.id} onClick={() => setPage(n.id)} style={{
            padding: '10px 18px', cursor: 'pointer', fontSize: 13,
            background: page === n.id ? '#EEEDFE' : 'transparent',
            color: page === n.id ? '#534AB7' : '#666',
            fontWeight: page === n.id ? 500 : 400,
            borderRadius: '0 8px 8px 0', marginRight: 10, marginBottom: 2
          }}>
            {n.label}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '12px 18px', borderTop: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{user?.email}</div>
          <button onClick={logout} style={{ fontSize: 12, color: '#A32D2D', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Se déconnecter</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>

        {/* DASHBOARD */}
        {page === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Dashboard</h1>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { label: 'Agents actifs', value: agents.length, color: '#534AB7' },
                { label: "Appels aujourd'hui", value: calls.length || 0, color: '#1D9E75' },
                { label: 'Taux de résolution', value: '84%', color: '#BA7517' },
              ].map((m, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #eee' }}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* BOUTON APPEL TEST */}
            <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #eee', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🎙️ Tester l'agent vocal</div>
              {!callActive ? (
                <button onClick={startCall} style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  📞 Démarrer un appel test
                </button>
              ) : (
                <div>
                  <div style={{ background: '#F0FFF8', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 13, color: '#1D9E75' }}>
                    🟢 Appel en cours — {transcript}
                  </div>
                  <button onClick={stopCall} style={{ background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
                    📵 Raccrocher
                  </button>
                </div>
              )}
            </div>

            {/* APPELS RECENTS */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #eee' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #eee', fontSize: 14, fontWeight: 600 }}>Appels récents</div>
              {calls.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 13 }}>Aucun appel pour l'instant — testez votre agent !</div>
              ) : calls.slice(0, 5).map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#534AB7' }}>
                    {(c.caller_name || 'IN')[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.caller_name || 'Inconnu'}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{c.summary || 'Appel enregistré'}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#EEEDFE', color: '#534AB7' }}>{c.status || 'done'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENTS */}
        {page === 'agents' && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Agents IA</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {agents.map((a, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.status === 'online' ? '#1D9E75' : '#BA7517' }}></div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>{a.description}</div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#534AB7' }}>{a.resolution || '—'}</div>
                      <div style={{ fontSize: 10, color: '#888' }}>Résolution</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#1D9E75' }}>{a.satisfaction || 0}%</div>
                      <div style={{ fontSize: 10, color: '#888' }}>Satisfaction</div>
                    </div>
                  </div>
                  <button onClick={startCall} style={{ width: '100%', background: '#EEEDFE', color: '#534AB7', border: 'none', borderRadius: 8, padding: '8px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                    🎙️ Tester cet agent
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPELS */}
        {page === 'appels' && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Appels</h1>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #eee' }}>
              {calls.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>Aucun appel enregistré pour l'instant</div>
              ) : calls.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#534AB7' }}>
                    {(c.caller_name || 'IN')[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.caller_name || 'Inconnu'}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{c.summary || '—'}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>{c.created_at ? new Date(c.created_at).toLocaleString('fr-FR') : '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

       {/* PARAMETRES */}
        {page === 'parametres' && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Paramètres</h1>
            <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #eee', maxWidth: 500, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Compte</div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Email : {user?.email}</div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>Plan : Starter (gratuit)</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Clés API</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Vapi : Connecté ✓</div>
              <div style={{ fontSize: 12, color: '#888' }}>Supabase : Connecté ✓</div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #eee', maxWidth: 500 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Choisir un plan</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>Passez à un plan supérieur pour plus de minutes et d'agents</div>
              {[
                { id: 'starter', name: 'Starter', price: '49€/mois', features: '1 agent · 500 min/mois · Support email', color: '#534AB7' },
                { id: 'pro', name: 'Pro', price: '99€/mois', features: '3 agents · 2000 min/mois · Support prioritaire', color: '#1D9E75' },
                { id: 'enterprise', name: 'Enterprise', price: '299€/mois', features: 'Agents illimités · Minutes illimitées · Support dédié', color: '#BA7517' },
              ].map(p => (
                <div key={p.id} style={{ border: `1.5px solid ${p.color}20`, borderRadius: 10, padding: 16, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: p.color }}>{p.name} — {p.price}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{p.features}</div>
                  </div>
                  <button onClick={async () => {
                    const res = await fetch('/api/create-checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ plan: p.id })
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                    else alert('Erreur : ' + data.error);
                  }} style={{ padding: '8px 16px', background: p.color, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Choisir →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}