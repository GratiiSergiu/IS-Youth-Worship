import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Mail, Check } from 'lucide-react';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { theme } = useSettings();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email.trim().toLowerCase());
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
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
              <strong style={{ color: theme.text }}>{email}</strong>.{' '}
              Apasă pe link pentru a te autentifica.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-sm font-semibold"
              style={{ color: theme.accent }}>
              Folosește alt email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl border p-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <label className="text-xs uppercase tracking-wider font-semibold mb-2 block" style={{ color: theme.muted }}>
                Adresă email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@exemplu.com"
                required
                autoComplete="email"
                className="w-full bg-transparent outline-none text-base"
                style={{ color: theme.text }}
              />
            </div>
            {error && (
              <p className="text-sm text-rose-400 px-1">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
              style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
              {loading ? 'Se trimite…' : <><Mail size={18} /> Trimite link magic</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
