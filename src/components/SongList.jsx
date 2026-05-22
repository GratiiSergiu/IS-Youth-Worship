import { useState } from 'react';
import { Search, Plus, X, Music2 } from 'lucide-react';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function SongList({ songs, onAdd, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterKey, setFilterKey] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titlu: '', autor: '', tonalitate: 'G', versuri: '' });

  const filtered = songs.filter((s) => {
    const haystack = (s.titlu + ' ' + s.autor).toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesKey = filterKey ? s.tonalitate === filterKey : true;
    return matchesSearch && matchesKey;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.titlu.trim() || !form.versuri.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      titlu: form.titlu.trim(),
      autor: form.autor.trim(),
      tonalitate: form.tonalitate,
      versuri: form.versuri,
    });
    setForm({ titlu: '', autor: '', tonalitate: 'G', versuri: '' });
    setShowForm(false);
  };

  return (
    <div className="pb-24 px-4 pt-2 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Repertoriu</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 text-slate-950 p-2.5 rounded-full shadow-lg active:scale-90 transition-transform"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-800 space-y-3 shadow-xl">
          <input
            type="text"
            placeholder="Titlu cântare"
            className="w-full bg-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            value={form.titlu}
            onChange={(e) => setForm({ ...form, titlu: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Autor"
            className="w-full bg-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            value={form.autor}
            onChange={(e) => setForm({ ...form, autor: e.target.value })}
          />
          <select
            className="w-full bg-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            value={form.tonalitate}
            onChange={(e) => setForm({ ...form, tonalitate: e.target.value })}
          >
            {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <textarea
            placeholder="Versuri cu acorduri în paranteze pătrate&#10;Ex: [G] Îți dăm glorie [C] și cinste"
            className="w-full bg-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 font-mono text-sm leading-relaxed"
            rows={6}
            value={form.versuri}
            onChange={(e) => setForm({ ...form, versuri: e.target.value })}
            required
          />
          <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-3 rounded-xl active:scale-95 transition shadow-lg">
            Salvează Cântarea
          </button>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Caută titlu sau autor..."
            className="w-full bg-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-slate-900 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          value={filterKey}
          onChange={(e) => setFilterKey(e.target.value)}
        >
          <option value="">Toate</option>
          {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="space-y-2.5">
        {filtered.map((song) => (
          <div key={song.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-start justify-between group active:scale-[0.98] transition-transform">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Music2 size={16} className="text-yellow-500 shrink-0" />
                <h3 className="font-semibold text-white truncate">{song.titlu}</h3>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{song.autor || 'Fără autor'}</p>
              <span className="inline-block mt-1.5 text-xs bg-slate-800 text-yellow-400 px-2 py-0.5 rounded-md font-mono font-bold tracking-wide">
                {song.tonalitate}
              </span>
            </div>
            <button
              onClick={() => onDelete(song.id)}
              className="text-slate-600 hover:text-red-400 p-2 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-500">Nicio cântare găsită.</p>
          </div>
        )}
      </div>
    </div>
  );
}
