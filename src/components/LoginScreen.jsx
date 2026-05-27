import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Mail, Check, Lock } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function LoginScreen() {
  const { signIn, signInWithPassword, signInWithGoogle } = useAuth();
  const { theme } = useSettings();
  const [mode, setMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (mode === 'magic') {
      const { error } = await signIn(email.trim().toLowerCase());
      setLoading(false);
      if (error) setError(error.message);
      else setSent(true);
    } else {
      const { error } = await signInWithPassword(email.trim().toLowerCase(), password);
      setLoading(false);
      if (error) setError(error.message);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: theme.bg }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.png" alt="ISYouth" className="w-20 h-20 rounded-2xl mb-4 object-cover" />
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>ISYouth Worship</h1>
          <p className="text-sm mt-1" style={{ color: theme.muted }}>Autentifică-te pentru a continua</p>
        </div>

        {sent ? (
          <div className="text-center p-6 rounded-2xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: theme.accent + '20' }}>
              <Check size={28} style={{ color: theme.accent }} />
            </div>
            <p className="font-bold text-base mb-2" style={{ color: theme.text }}>Verifică email-ul!</p>
            <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
              Am trimis un link de autentificare la{' '}
              <strong style={{ color: theme.text }}>{email}</strong>.
            </p>
            <button onClick={() => setSent(false)} className="mt-4 text-sm font-semibold" style={{ color: theme.accent }}>
              Înapoi
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 active:scale-95 transition border disabled:opacity-50"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}>
              <GoogleIcon />
              {googleLoading ? 'Se procesează…' : 'Continuă cu Google'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
              <span className="text-xs font-semibold" style={{ color: theme.muted }}>sau</span>
              <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: theme.border }}>
                {[
                  { id: 'password', label: 'Parolă', icon: <Lock size={14} /> },
                  { id: 'magic',    label: 'Link magic', icon: <Mail size={14} /> },
                ].map(m => (
                  <button key={m.id} type="button" onClick={() => { setMode(m.id); setError(null); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition"
                    style={mode === m.id
                      ? { backgroundColor: theme.accent, color: theme.accentFg }
                      : { backgroundColor: theme.surface, color: theme.muted }}>
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border p-4 space-y-3" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold mb-2 block" style={{ color: theme.muted }}>
                    Adresă email
                  </label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="email@exemplu.com" required autoComplete="email"
                    className="w-full bg-transparent outline-none text-base" style={{ color: theme.text }}
                  />
                </div>
                {mode === 'password' && (
                  <div className="border-t pt-3" style={{ borderColor: theme.border }}>
                    <label className="text-xs uppercase tracking-wider font-semibold mb-2 block" style={{ color: theme.muted }}>
                      Parolă
                    </label>
                    <input
                      type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required autoComplete="current-password"
                      className="w-full bg-transparent outline-none text-base" style={{ color: theme.text }}
                    />
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-rose-400 px-1">{error}</p>}

              <button
                type="submit"
                disabled={loading || !email.trim() || (mode === 'password' && !password)}
                className="w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
                style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
                {loading ? 'Se procesează…' : mode === 'password'
                  ? <><Lock size={18} /> Intră în cont</>
                  : <><Mail size={18} /> Trimite link magic</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
