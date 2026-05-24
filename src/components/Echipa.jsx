import { useState } from 'react';
import { Plus, X, Pencil, Check, Mic2, Music, Music2, Music3, Drumstick } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const ROLURI = ['Voce', 'Chitară Lead', 'Chitară Ritmică', 'Bass', 'Tobe', 'Clape', 'Vioară', 'Alt instrument'];

const ROLE_ICON = {
  'Voce': Mic2,
  'Chitară Lead': Music3,
  'Chitară Ritmică': Music3,
  'Bass': Music,
  'Tobe': Drumstick,
  'Clape': Music2,
  'Vioară': Music2,
  'Alt instrument': Music2,
};

export default function Echipa({ membri, onUpdate }) {
  const { theme } = useSettings();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nume: '', rol: 'Voce', voce: false });

  const openAdd = () => {
    setForm({ nume: '', rol: 'Voce', voce: false });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (m) => {
    setForm({ nume: m.nume, rol: m.rol, voce: m.voce });
    setEditId(m.id);
    setShowForm(true);
  };

  const save = () => {
    if (!form.nume.trim()) return;
    if (editId) {
      onUpdate(membri.map((m) => m.id === editId ? { ...m, ...form } : m));
    } else {
      onUpdate([...membri, { id: crypto.randomUUID(), ...form, activ: true }]);
    }
    setShowForm(false);
  };

  const remove = (id) => onUpdate(membri.filter((m) => m.id !== id));
  const toggle = (id) => onUpdate(membri.map((m) => m.id === id ? { ...m, activ: !m.activ } : m));

  return (
    <div className="anim-page">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-widest font-bold" style={{ color: theme.muted }}>Membrii echipei</p>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 transition"
          style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
          <Plus size={13} /> Adaugă
        </button>
      </div>

      {membri.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-2xl" style={{ borderColor: theme.border }}>
          <p className="text-sm" style={{ color: theme.muted }}>Niciun membru adăugat încă.</p>
        </div>
      )}

      <div className="space-y-2">
        {membri.map((m) => {
          const Icon = ROLE_ICON[m.rol] ?? Music2;
          return (
            <div key={m.id} className="flex items-center gap-3 rounded-xl px-3 py-3 border anim-pop"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, opacity: m.activ ? 1 : 0.45 }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundImage: 'linear-gradient(135deg,#f43f5e,#6366f1)' }}>
                <Icon size={16} color="#fff" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: theme.text }}>{m.nume}</p>
                <p className="text-xs" style={{ color: theme.muted }}>{m.rol}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggle(m.id)}
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: m.activ ? theme.accent + '25' : theme.border, color: m.activ ? theme.accent : theme.muted }}>
                  {m.activ ? 'Activ' : 'Inactiv'}
                </button>
                <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg" style={{ color: theme.muted }}>
                  <Pencil size={13} />
                </button>
                <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg" style={{ color: '#f43f5e' }}>
                  <X size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit bottom sheet */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end anim-overlay"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={() => setShowForm(false)}>
          <div className="w-full rounded-t-3xl p-6 space-y-4 anim-sheet"
            style={{ backgroundColor: theme.surface, borderTop: `2px solid ${theme.accent}` }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-bold text-base" style={{ color: theme.text }}>
                {editId ? 'Editează Membru' : 'Adaugă Membru'}
              </p>
              <button onClick={() => setShowForm(false)} style={{ color: theme.muted }}><X size={20} /></button>
            </div>
            <input
              autoFocus
              placeholder="Nume"
              value={form.nume}
              onChange={(e) => setForm({ ...form, nume: e.target.value })}
              className="w-full rounded-xl px-4 py-3 focus:outline-none text-sm"
              style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
            />
            <select
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
              className="w-full rounded-xl px-4 py-3 focus:outline-none text-sm"
              style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}>
              {ROLURI.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm({ ...form, voce: !form.voce })}
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition"
                style={{ borderColor: form.voce ? theme.accent : theme.border, backgroundColor: form.voce ? theme.accent : 'transparent' }}>
                {form.voce && <Check size={12} color={theme.accentFg} />}
              </div>
              <span className="text-sm" style={{ color: theme.text }}>Poate fi voce lead</span>
            </label>
            <button onClick={save}
              className="w-full font-bold py-3 rounded-xl active:scale-95 transition"
              style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
              Salvează
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
