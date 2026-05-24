import { useState } from 'react';
import { Plus, X, Pencil, Mic2, Music, Music2, Music3, Drumstick, ArrowLeft, Check, ChevronDown } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const ROLURI_LISTA = [
  'Chitară Acustică',
  'Chitară Electrică',
  'Chitară Bas',
  'Tobe',
  'Kajon',
  'Pian',
  'Vioară',
  'Vocalist',
];

const ROLE_ICON = {
  'Vocalist':         Mic2,
  'Chitară Acustică': Music3,
  'Chitară Electrică':Music3,
  'Chitară Bas':      Music,
  'Tobe':             Drumstick,
  'Kajon':            Drumstick,
  'Pian':             Music2,
  'Vioară':           Music2,
};

function primaryIcon(roluri = []) {
  for (const r of roluri) if (ROLE_ICON[r]) return ROLE_ICON[r];
  return Music2;
}

export default function Echipa({ membri, onUpdate }) {
  const { theme } = useSettings();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nume: '', roluri: [] });
  const [editingRolesFor, setEditingRolesFor] = useState(null);

  const openAdd = () => {
    setForm({ nume: '', roluri: [] });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (m) => {
    setForm({ nume: m.nume, roluri: m.roluri ?? (m.rol ? [m.rol] : []) });
    setEditId(m.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  }

  const toggleRol = (memberId, rol) => {
    const member = membri.find(m => m.id === memberId);
    if (!member) return;
    const newRoluri = member.roluri.includes(rol)
      ? member.roluri.filter(r => r !== rol)
      : [...member.roluri, rol];
    onUpdate(membri.map(m => m.id === memberId ? { ...m, roluri: newRoluri } : m));
  };

  const save = () => {
    if (!form.nume.trim()) return;
    if (editId) {
      onUpdate(membri.map((m) => m.id === editId ? { ...m, nume: form.nume } : m));
    } else {
      onUpdate([...membri, { id: crypto.randomUUID(), nume: form.nume, roluri: [], activ: true }]);
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

      <div className="space-y-2 pb-24">
        {membri.map((m) => {
          const roluri = m.roluri ?? (m.rol ? [m.rol] : []);
          const Icon = primaryIcon(roluri);
          const isEditingRoles = editingRolesFor === m.id;
          return (
            <div key={m.id} className={"rounded-xl border anim-pop " + (isEditingRoles ? "pb-3" : "")}
              style={{ backgroundColor: theme.surface, borderColor: isEditingRoles ? theme.accent : theme.border, opacity: m.activ ? 1 : 0.45 }}>
              <div className="flex items-center gap-3 px-3 pt-3 pb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundImage: 'linear-gradient(135deg,#f43f5e,#6366f1)' }}>
                  <Icon size={16} color="#fff" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: theme.text }}>{m.nume}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {roluri.map((r) => (
                      <span key={r} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                        {r}
                      </span>
                    ))}
                    {roluri.length === 0 && <span className="text-[10px]" style={{color: theme.muted}}>Fără rol</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                   <button onClick={() => setEditingRolesFor(isEditingRoles ? null : m.id)} className={"p-1.5 rounded-lg " + (isEditingRoles ? 'bg-gray-200' : '')} style={{ color: theme.muted }}>
                    <ChevronDown size={15} className={"transition " + (isEditingRoles ? 'rotate-180' : '')}/>
                  </button>
                  <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg" style={{ color: theme.muted }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg" style={{ color: '#f43f5e' }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
              {isEditingRoles && (
                <div className="px-3 space-y-2">
                   {ROLURI_LISTA.map((r) => {
                        const sel = m.roluri.includes(r);
                        return (
                          <label key={r} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                            style={{ backgroundColor: sel ? theme.accent + '20' : theme.bg, border: `1px solid ${sel ? theme.accent + '40' : theme.border}`}}
                            onClick={() => toggleRol(m.id, r)}
                          >
                            <div className="w-5 h-5 rounded-md border flex items-center justify-center"
                              style={{ borderColor: sel ? theme.accent : theme.muted, backgroundColor: sel ? theme.accent : 'transparent' }}
                            >
                              {sel && <Check size={14} color={theme.accentFg} />}
                            </div>
                            <span className="text-sm font-medium" style={{ color: theme.text }}>{r}</span>
                          </label>
                        );
                      })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end anim-overlay"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={closeForm}>
          <div className="w-full rounded-t-3xl flex flex-col anim-sheet"
            style={{ backgroundColor: theme.surface, borderTop: `2px solid ${theme.accent}`, maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}>

            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: theme.border }} />
            </div>

            <div className="flex items-center justify-between px-6 pb-3 shrink-0">
               <p className="font-bold text-base" style={{ color: theme.text }}>
                {editId ? 'Editează Membru' : 'Adaugă Membru'}
              </p>
              <button onClick={closeForm} className='p-1.5 -mr-1.5 rounded-lg' style={{ color: theme.muted }}><X size={20} /></button>
            </div>

            <div className='px-6 pb-4 space-y-4'>
              <input
                autoFocus
                placeholder="Nume complet"
                value={form.nume}
                onChange={(e) => setForm({ ...form, nume: e.target.value })}
                className="w-full rounded-xl px-4 py-3 focus:outline-none text-sm"
                style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
              />
              <button onClick={save}
                disabled={!form.nume.trim()}
                className="w-full font-bold py-3 rounded-xl active:scale-95 transition disabled:opacity-40"
                style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}