import { useState, useEffect } from 'react';
import { X, LogOut, Users, Crown, Eye } from 'lucide-react';
import { useSettings, THEMES, FONTS, FONT_SIZES } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';

const PALETTE_IDS = ['ocean', 'forest', 'sunset', 'lavender', 'rose'];
const BASE_IDS    = ['light', 'dark'];

export default function Settings({ onClose }) {
  const { settings, update, theme } = useSettings();
  const { user, profile, isAdmin, signOut, updateUserRole, fetchAllProfiles } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);

  useEffect(() => {
    if (usersOpen && isAdmin) {
      setLoadingProfiles(true);
      fetchAllProfiles().then(({ data }) => {
        setProfiles(data ?? []);
        setLoadingProfiles(false);
      });
    }
  }, [usersOpen, isAdmin]);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'viewer' : 'admin';
    await updateUserRole(userId, newRole);
    setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
  };

  const btn = (active) => ({
    backgroundColor: active ? theme.accent : theme.surface,
    color:           active ? theme.accentFg : theme.text,
    border:          `1px solid ${active ? theme.accent : theme.border}`,
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: theme.border }}>
        <h2 className="font-bold text-lg" style={{ color: theme.text }}>Setări</h2>
        <button onClick={onClose} className="p-2 -mr-2" style={{ color: theme.muted }}>
          <X size={24} />
        </button>
      </div>

      {/* Account */}
      <div className="px-4 py-3 border-b shrink-0 flex items-center justify-between" style={{ borderColor: theme.border }}>
        <div>
          <p className="text-xs font-semibold" style={{ color: theme.muted }}>Autentificat ca</p>
          <p className="text-sm font-bold truncate max-w-[220px]" style={{ color: theme.text }}>{user?.email}</p>
          {profile?.role && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.accent + '25', color: theme.accent }}>
              {profile.role === 'admin' ? 'Admin' : 'Vizitator'}
            </span>
          )}
        </div>
        <button
          onClick={async () => { await signOut(); onClose(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold active:scale-95 transition"
          style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>
          <LogOut size={15} /> Ieși
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-8 pb-10">

        {/* ── Temă ── */}
        <section>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: theme.muted }}>
            Temă
          </p>
          {/* Zi / Noapte */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {BASE_IDS.map((id) => (
              <button key={id} onClick={() => update({ theme: id })}
                className="py-3 rounded-xl text-sm font-semibold transition active:scale-95"
                style={btn(settings.theme === id)}>
                {THEMES[id].name}
              </button>
            ))}
          </div>
          {/* 5 palete — gradient pills */}
          <div className="grid grid-cols-5 gap-2">
            {PALETTE_IDS.map((id) => {
              const active = settings.theme === id;
              const t = THEMES[id];
              return (
                <button key={id} onClick={() => update({ theme: id })}
                  className="flex flex-col items-center gap-2 py-2 rounded-xl transition active:scale-95"
                  style={{
                    backgroundColor: active ? theme.accent + '22' : t.surface,
                    border: `2px solid ${active ? theme.accent : t.border}`,
                  }}>
                  {/* Gradient pill */}
                  <div
                    className="rounded-full"
                    style={{
                      width: 36,
                      height: 64,
                      background: `linear-gradient(to bottom, ${t.grad[0]}, ${t.grad[1]})`,
                      boxShadow: active
                        ? `0 0 14px 3px ${t.grad[1]}88`
                        : `0 0 8px 1px ${t.grad[1]}44`,
                    }}
                  />
                  <span className="text-[9px] font-semibold leading-tight text-center px-0.5"
                    style={{ color: active ? theme.accent : t.muted }}>
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Font ── */}
        <section>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: theme.muted }}>
            Font
          </p>
          <div className="grid grid-cols-3 gap-2">
            {FONTS.map((f) => (
              <button key={f.id} onClick={() => update({ fontId: f.id })}
                className="py-3 rounded-xl text-sm font-medium transition active:scale-95"
                style={{ ...btn(settings.fontId === f.id), fontFamily: f.css }}>
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Mărime text ── */}
        <section>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: theme.muted }}>
            Mărime text
          </p>
          <div className="grid grid-cols-4 gap-2">
            {FONT_SIZES.map((s) => (
              <button key={s.id} onClick={() => update({ sizeId: s.id })}
                className="py-3 rounded-xl font-bold transition active:scale-95"
                style={{ ...btn(settings.sizeId === s.id), fontSize: s.lyric }}>
                {s.label}
              </button>
            ))}
          </div>
          {/* Preview */}
          <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: theme.muted }}>Previzualizare</p>
            <p style={{ color: theme.chord, fontSize: FONT_SIZES.find(s => s.id === settings.sizeId)?.chord, fontFamily: FONTS.find(f => f.id === settings.fontId)?.css }} className="font-bold">
              Em C G D
            </p>
            <p style={{ color: theme.text, fontSize: FONT_SIZES.find(s => s.id === settings.sizeId)?.lyric, fontFamily: FONTS.find(f => f.id === settings.fontId)?.css }}>
              Doamne, Te slăvim
            </p>
          </div>
        </section>

        {/* ── Aranjare ── */}
        <section>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: theme.muted }}>
            Aranjare conținut
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'scroll', label: 'Continuu',  desc: 'Derulare liberă' },
              { id: 'paged',  label: 'Paginat',   desc: 'O secțiune pe ecran' },
            ].map((opt) => {
              const active = settings.layout === opt.id;
              return (
                <button key={opt.id} onClick={() => update({ layout: opt.id })}
                  className="py-4 px-3 rounded-xl text-left transition active:scale-95"
                  style={{
                    backgroundColor: active ? theme.accent + '20' : theme.surface,
                    border: `1.5px solid ${active ? theme.accent : theme.border}`,
                  }}>
                  <p className="font-bold text-sm" style={{ color: active ? theme.accent : theme.text }}>
                    {opt.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: active ? theme.accent + 'bb' : theme.muted }}>
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Utilizatori (admin only) ── */}
        {isAdmin && (
          <section>
            <button
              onClick={() => setUsersOpen(o => !o)}
              className="w-full flex items-center justify-between py-2">
              <p className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2" style={{ color: theme.muted }}>
                <Users size={14} /> Utilizatori
              </p>
              <span className="text-xs" style={{ color: theme.muted }}>{usersOpen ? '▲' : '▼'}</span>
            </button>

            {usersOpen && (
              <div className="space-y-2 mt-2">
                {loadingProfiles ? (
                  <p className="text-sm text-center py-4" style={{ color: theme.muted }}>Se încarcă…</p>
                ) : profiles.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <div>
                      <p className="text-sm font-semibold truncate max-w-[180px]" style={{ color: theme.text }}>{p.email}</p>
                      <span className="text-[10px] font-bold" style={{ color: theme.muted }}>
                        {p.role === 'admin' ? 'Admin' : 'Vizitator'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleRole(p.id, p.role)}
                      disabled={p.id === user?.id}
                      className="p-2 rounded-xl transition disabled:opacity-30 active:scale-90"
                      title={p.role === 'admin' ? 'Retrogradează la Vizitator' : 'Promovează la Admin'}
                      style={{ backgroundColor: theme.bg, color: p.role === 'admin' ? theme.accent : theme.muted }}>
                      {p.role === 'admin' ? <Crown size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
