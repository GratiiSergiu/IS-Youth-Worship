import { useState } from 'react';
import { Plus, X, Check, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const STATUS = [
  { v: 'planificata', label: 'Planificată', color: '#6366f1' },
  { v: 'realizata',   label: 'Realizată',   color: '#22c55e' },
  { v: 'anulata',     label: 'Anulată',     color: '#f43f5e' },
];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function Repetitii({ repetitii, membri, onUpdate }) {
  const { theme } = useSettings();
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ data: todayStr(), ora: '18:00', locatie: '', note: '' });

  const addRepetitie = () => {
    if (!form.data) return;
    const prezenta = {};
    membri.filter((m) => m.activ).forEach((m) => { prezenta[m.id] = false; });
    onUpdate([{ id: crypto.randomUUID(), ...form, status: 'planificata', prezenta }, ...repetitii]);
    setForm({ data: todayStr(), ora: '18:00', locatie: '', note: '' });
    setShowForm(false);
  };

  const remove = (id) => onUpdate(repetitii.filter((r) => r.id !== id));

  const setStatus = (id, status) => onUpdate(repetitii.map((r) => r.id === id ? { ...r, status } : r));

  const togglePrezenta = (repId, memId) => {
    onUpdate(repetitii.map((r) => r.id === repId
      ? { ...r, prezenta: { ...r.prezenta, [memId]: !r.prezenta[memId] } }
      : r));
  };

  const activeMembers = membri.filter((m) => m.activ);

  return (
    <div className="anim-page space-y-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-widest font-bold" style={{ color: theme.muted }}>Repetiții</p>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 transition"
          style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
          <Plus size={13} /> Adaugă
        </button>
      </div>

      {repetitii.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-2xl" style={{ borderColor: theme.border }}>
          <p className="text-sm" style={{ color: theme.muted }}>Nicio repetiție programată.</p>
        </div>
      )}

      {repetitii.map((rep) => {
        const st = STATUS.find((s) => s.v === rep.status) ?? STATUS[0];
        const isOpen = expanded === rep.id;
        const prezentiCount = Object.values(rep.prezenta ?? {}).filter(Boolean).length;
        const totalCount = Object.keys(rep.prezenta ?? {}).length;

        return (
          <div key={rep.id} className="rounded-2xl border overflow-hidden anim-pop"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}>

            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm" style={{ color: theme.text }}>
                    {new Date(rep.data + 'T12:00:00').toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: theme.muted }}>
                    <Clock size={11} /> {rep.ora}
                  </span>
                  {rep.locatie && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: theme.muted }}>
                      <MapPin size={11} /> {rep.locatie}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: st.color + '22', color: st.color }}>{st.label}</span>
                  {totalCount > 0 && (
                    <span className="text-[10px]" style={{ color: theme.muted }}>
                      {prezentiCount}/{totalCount} prezenți
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setExpanded(isOpen ? null : rep.id)}
                className="p-1.5 rounded-lg transition" style={{ color: theme.muted }}>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button onClick={() => remove(rep.id)} className="p-1.5 rounded-lg" style={{ color: '#f43f5e' }}>
                <X size={14} />
              </button>
            </div>

            {/* Expanded details */}
            {isOpen && (
              <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: theme.border }}>
                {/* Status selector */}
                <div className="flex gap-2 pt-3">
                  {STATUS.map((s) => (
                    <button key={s.v} onClick={() => setStatus(rep.id, s.v)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold transition"
                      style={rep.status === s.v
                        ? { backgroundColor: s.color, color: '#fff' }
                        : { backgroundColor: theme.bg, color: theme.muted, border: `1px solid ${theme.border}` }}>
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Attendance */}
                {activeMembers.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.muted }}>Prezență</p>
                    <div className="space-y-1.5">
                      {activeMembers.map((m) => {
                        const prezent = rep.prezenta?.[m.id] ?? false;
                        return (
                          <button key={m.id} onClick={() => togglePrezenta(rep.id, m.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition active:scale-[0.98]"
                            style={{ backgroundColor: theme.bg }}>
                            <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition"
                              style={{ borderColor: prezent ? '#22c55e' : theme.border, backgroundColor: prezent ? '#22c55e' : 'transparent' }}>
                              {prezent && <Check size={12} color="#fff" />}
                            </div>
                            <span className="text-sm flex-1 text-left font-medium" style={{ color: theme.text }}>{m.nume}</span>
                            <span className="text-xs" style={{ color: theme.muted }}>{m.rol}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add form bottom sheet */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end anim-overlay"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={() => setShowForm(false)}>
          <div className="w-full rounded-t-3xl p-6 space-y-4 anim-sheet"
            style={{ backgroundColor: theme.surface, borderTop: `2px solid ${theme.accent}` }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-bold text-base" style={{ color: theme.text }}>Repetiție nouă</p>
              <button onClick={() => setShowForm(false)} style={{ color: theme.muted }}><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: theme.muted }}>Data</label>
                <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, colorScheme: 'dark' }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: theme.muted }}>Ora</label>
                <input type="time" value={form.ora} onChange={(e) => setForm({ ...form, ora: e.target.value })}
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, colorScheme: 'dark' }} />
              </div>
            </div>
            <input placeholder="Locație (opțional)" value={form.locatie} onChange={(e) => setForm({ ...form, locatie: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} />
            <button onClick={addRepetitie}
              className="w-full font-bold py-3 rounded-xl active:scale-95 transition"
              style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
              Salvează Repetiția
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
