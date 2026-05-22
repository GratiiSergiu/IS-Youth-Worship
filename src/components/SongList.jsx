import { useState } from 'react';
import { Search, Plus, X, Music2, Link, Loader2, ClipboardPaste } from 'lucide-react';
import { fetchSongFromUrl, convertToOurFormat } from '../utils/import';
import SongViewer from './SongViewer';

const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

function detectKey(versuri) {
  const match = versuri.match(/\[([A-G][#b]?)/);
  if (!match) return 'C';
  return FLAT_TO_SHARP[match[1]] || match[1];
}

export default function SongList({ songs, onAdd, onDelete }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titlu: '', autor: '', versuri: '' });
  const [viewingIndex, setViewingIndex] = useState(null);

  const [importUrl, setImportUrl] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importMode, setImportMode] = useState('manual');

  const filtered = songs.filter((s) => {
    const haystack = (s.titlu + ' ' + s.autor).toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.titlu.trim() || !form.versuri.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      titlu: form.titlu.trim(),
      autor: form.autor.trim(),
      tonalitate: detectKey(form.versuri),
      versuri: form.versuri,
    });
    setForm({ titlu: '', autor: '', versuri: '' });
    setImportUrl('');
    setImportError('');
    setImportMode('manual');
    setShowForm(false);
  };

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return;
    setImportLoading(true);
    setImportError('');
    try {
      const result = await fetchSongFromUrl(importUrl.trim());
      setForm({
        titlu: result.title,
        autor: result.author,
        versuri: result.lyrics,
      });
      setImportUrl('');
    } catch {
      setImportError('Site-ul blochează importul automat. Copiază versurile manual din pagină și lipește-le în câmpul de versuri — acordurile se convertesc automat.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleVersuriPaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    const converted = convertToOurFormat(pasted);
    if (converted !== pasted) {
      e.preventDefault();
      setForm((f) => ({ ...f, versuri: converted }));
    }
  };

  const toggleForm = () => {
    setShowForm((v) => !v);
    setForm({ titlu: '', autor: '', versuri: '' });
    setImportUrl('');
    setImportError('');
    setImportMode('manual');
  };

  if (viewingIndex !== null && filtered[viewingIndex]) {
    const song = filtered[viewingIndex];
    return (
      <SongViewer
        song={{ ...song, originalKey: song.tonalitate, selectedKey: song.tonalitate }}
        onClose={() => setViewingIndex(null)}
        onNext={() => setViewingIndex((i) => Math.min(filtered.length - 1, i + 1))}
        onPrev={() => setViewingIndex((i) => Math.max(0, i - 1))}
        hasNext={viewingIndex < filtered.length - 1}
        hasPrev={viewingIndex > 0}
      />
    );
  }

  return (
    <div className="pb-24 px-4 pt-2 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Repertoriu</h2>
        <button
          onClick={toggleForm}
          className="bg-yellow-500 text-slate-950 p-2.5 rounded-full shadow-lg active:scale-90 transition-transform"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-800 space-y-3 shadow-xl">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setImportMode('manual'); setImportError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition ${
                importMode === 'manual' ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardPaste size={14} /> Manual
            </button>
            <button
              type="button"
              onClick={() => { setImportMode('url'); setImportError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition ${
                importMode === 'url' ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Link size={14} /> Din link
            </button>
          </div>

          {importMode === 'url' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://melodia.ro/..."
                  className="flex-1 bg-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleImportUrl())}
                />
                <button
                  type="button"
                  onClick={handleImportUrl}
                  disabled={importLoading || !importUrl.trim()}
                  className="bg-yellow-500 disabled:opacity-50 text-slate-950 px-4 rounded-xl font-bold text-sm active:scale-95 transition flex items-center gap-1.5"
                >
                  {importLoading ? <Loader2 size={16} className="animate-spin" /> : 'Preia'}
                </button>
              </div>
              {importError && <p className="text-rose-400 text-xs px-1">{importError}</p>}
              {form.versuri && <p className="text-green-400 text-xs px-1">Conținut preluat — verifică și ajustează datele de mai jos.</p>}
            </div>
          )}

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
          <div>
            <textarea
              placeholder={"Versuri cu acorduri în paranteze pătrate\nEx: [G] Îți dăm glorie [C] și cinste\n\nPoți lipi text cu acorduri în orice format — se convertesc automat."}
              className="w-full bg-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 font-mono text-sm leading-relaxed"
              rows={6}
              value={form.versuri}
              onChange={(e) => setForm({ ...form, versuri: e.target.value })}
              onPaste={handleVersuriPaste}
              required
            />
            <p className="text-[10px] text-slate-600 mt-1 px-1">
              Tonalitatea se detectează automat din primul acord.
            </p>
          </div>
          <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-3 rounded-xl active:scale-95 transition shadow-lg">
            Salvează Cântarea
          </button>
        </form>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input
          type="text"
          placeholder="Caută titlu sau autor..."
          className="w-full bg-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2.5">
        {filtered.map((song, index) => (
          <div
            key={song.id}
            className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-start justify-between group active:scale-[0.98] transition-transform cursor-pointer"
            onClick={() => setViewingIndex(index)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Music2 size={16} className="text-yellow-500 shrink-0" />
                <h3 className="font-semibold text-white truncate">{song.titlu}</h3>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{song.autor || 'Fără autor'}</p>
              {song.tonalitate && (
                <span className="inline-block mt-1.5 text-xs bg-slate-800 text-yellow-400 px-2 py-0.5 rounded-md font-mono font-bold tracking-wide">
                  {song.tonalitate}
                </span>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(song.id); }}
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
