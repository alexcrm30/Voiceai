'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://yzhzlnqblrtrnjnymbcs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aHpsbnFibHJ0cm5qbnltYmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mjk4NzYsImV4cCI6MjA5NzEwNTg3Nn0.j8N1YsrDHQ4ZFHUkptqgPWwCtp2wux4cyZZudNOtuuY'
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setLoading(true);
    setError('');
    let { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      const { error: e2 } = await sb.auth.signUp({ email, password });
      if (e2) { setError(e2.message); setLoading(false); return; }
    }
    window.location.href = '/dashboard';
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0e1a, #1a1836)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 40, width: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#534AB7', marginBottom: 6 }}>🎙️ VoiceAI</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 28 }}>Connectez-vous à votre dashboard</div>
        {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 5 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="vous@exemple.com"
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e5e5', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 5 }}>Mot de passe</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e5e5', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <button onClick={handleLogin} disabled={loading}
          style={{ width: '100%', padding: 12, background: '#534AB7', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>
    </div>
  );
}