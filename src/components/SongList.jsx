import { useState, useRef, useLayoutEffect } from 'react';
import { Search, Plus, X, Music2, Link, Loader2, ClipboardPaste } from 'lucide-react';
import { fetchSongFromUrl, convertToOurFormat } from '../utils/import';
import SongViewer from './SongViewer';
import { useSettings } from '../contexts/SettingsContext';

const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

function detectKey(versuri) {
  const match = versuri.match(/\[([A-G][#b]?)/);
  if (!match) return 'C';
  return FLAT_TO_SHARP[match[1]] || match[1];
}

function firstLetter(titlu) {
  const ch = titlu.trim().charAt(0).toUpperCase();
  // Normalize Romanian accented letters for grouping
  return ch.normalize('NFD').replace(/[̀-ͯ]/g, '') || '#';
}

export default function SongList({ songs, onAdd, onDelete, onUpdate }) {
  const { theme } = useSettings();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titlu: '', autor: '', versuri: '' });
  const [viewingIndex, setViewingIndex] = useState(null);
  const [importUrl, setImportUrl] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importMode, setImportMode] = useState('manual');
  const sectionRefs = useRef({});
  const savedScroll = useRef(0);

  // Restore scroll position when returning from SongViewer
  useLayoutEffect(() => {
    if (viewingIndex === null) {
      window.scrollTo(0, savedScroll.current);
    }
  }, [viewingIndex]);

  // Sort & group alphabetically
  const sorted = [...songs]
    .filter((s) => (s.titlu + ' ' + s.autor).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.titlu.localeCompare(b.titlu, 'ro'));

  const groups = [];
  const letterMap = {};
  for (const song of sorted) {
    const letter = firstLetter(song.titlu);
    if (!letterMap[letter]) {
      letterMap[letter] = [];
      groups.push({ letter, songs: letterMap[letter] });
    }
    letterMap[letter].push(song);
  }
  const letters = groups.map((g) => g.letter);

  // Flat index for viewer navigation
  const flatSongs = sorted;

  const scrollToLetter = (letter) => {
    sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
      setForm({ titlu: result.title, autor: result.author, versuri: result.lyrics });
      setImportUrl('');
    } catch {
      setImportError('Site-ul blochează importul automat. Copiază versurile manual și lipește-le în câmpul de versuri.');
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

  if (viewingIndex !== null && flatSongs[viewingIndex]) {
    const song = flatSongs[viewingIndex];
    return (
      <SongViewer
        song={{ ...song, originalKey: song.tonalitate, selectedKey: song.tonalitate }}
        onClose={() => setViewingIndex(null)}
        onNext={() => setViewingIndex((i) => Math.min(flatSongs.length - 1, i + 1))}
        onPrev={() => setViewingIndex((i) => Math.max(0, i - 1))}
        hasNext={viewingIndex < flatSongs.length - 1}
        hasPrev={viewingIndex > 0}
        onUpdate={onUpdate}
      />
    );
  }

  return (
    <div className="pb-24 pt-2 max-w-md mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-xl font-bold" style={{ color: theme.text }}>Repertoriu</h2>
        <button onClick={toggleForm}
          className="p-2.5 rounded-full shadow-lg active:scale-90 transition-transform"
          style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mx-4 rounded-2xl p-4 mb-4 border space-y-3 shadow-xl"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <div className="flex gap-2">
            {[{ id: 'manual', icon: <ClipboardPaste size={14} />, label: 'Manual' },
              { id: 'url',    icon: <Link size={14} />,           label: 'Din link' }].map((m) => (
              <button key={m.id} type="button"
                onClick={() => { setImportMode(m.id); setImportError(''); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition"
                style={importMode === m.id
                  ? { backgroundColor: theme.accent, color: theme.accentFg }
                  : { backgroundColor: theme.bg, color: theme.muted, border: `1px solid ${theme.border}` }}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {importMode === 'url' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input type="url" placeholder="https://melodia.ro/..."
                  className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
                  value={importUrl} onChange={(e) => setImportUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleImportUrl())} />
                <button type="button" onClick={handleImportUrl}
                  disabled={importLoading || !importUrl.trim()}
                  className="px-4 rounded-xl font-bold text-sm active:scale-95 transition flex items-center gap-1.5 disabled:opacity-50"
                  style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
                  {importLoading ? <Loader2 size={16} className="animate-spin" /> : 'Preia'}
                </button>
              </div>
              {importError && <p className="text-rose-400 text-xs px-1">{importError}</p>}
              {form.versuri && <p className="text-green-400 text-xs px-1">Conținut preluat — verifică datele de mai jos.</p>}
            </div>
          )}

          {[{ key: 'titlu', placeholder: 'Titlu cântare', required: true },
            { key: 'autor', placeholder: 'Autor', required: false }].map(({ key, placeholder, required }) => (
            <input key={key} type="text" placeholder={placeholder} required={required}
              className="w-full rounded-xl px-3 py-2.5 focus:outline-none"
              style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
              value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          ))}

          <div>
            <textarea placeholder={"Versuri cu acorduri în paranteze pătrate\nEx: [G] Îți dăm glorie [C] și cinste\n\nPoți lipi text în orice format — se convertesc automat."}
              className="w-full rounded-xl px-3 py-2.5 font-mono text-sm leading-relaxed focus:outline-none"
              style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
              rows={6} value={form.versuri}
              onChange={(e) => setForm({ ...form, versuri: e.target.value })}
              onPaste={handleVersuriPaste} required />
            <p className="text-[10px] mt-1 px-1" style={{ color: theme.muted }}>
              Tonalitatea se detectează automat din primul acord.
            </p>
          </div>
          <button type="submit" className="w-full font-bold py-3 rounded-xl active:scale-95 transition shadow-lg"
            style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
            Salvează Cântarea
          </button>
        </form>
      )}

      {/* Search */}
      <div className="relative mb-4 px-4">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2" size={16} style={{ color: theme.muted }} />
        <input type="text" placeholder="Caută titlu sau autor..."
          className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none"
          style={{ backgroundColor: theme.surface, color: theme.text, border: `1px solid ${theme.border}` }}
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Song list — alphabetical groups */}
      <div className="pr-8 pl-4 space-y-1">
        {groups.length === 0 && (
          <div className="text-center py-10">
            <p style={{ color: theme.muted }}>Nicio cântare găsită.</p>
          </div>
        )}

        {groups.map(({ letter, songs: groupSongs }) => (
          <div key={letter} ref={(el) => { sectionRefs.current[letter] = el; }}>
            {/* Letter header */}
            <div className="sticky top-0 z-10 py-1.5 px-2 mb-1"
              style={{ backgroundColor: theme.bg }}>
              <span className="text-xs font-black uppercase tracking-widest"
                style={{ color: theme.accent }}>{letter}</span>
            </div>

            {/* Songs in group */}
            <div className="space-y-2 mb-3">
              {groupSongs.map((song) => {
                const flatIndex = flatSongs.findIndex((s) => s.id === song.id);
                return (
                  <div key={song.id}
                    className="rounded-xl p-4 border flex items-start justify-between group active:scale-[0.98] transition-transform cursor-pointer"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    onClick={() => { savedScroll.current = window.scrollY; setViewingIndex(flatIndex); }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Music2 size={16} className="shrink-0" style={{ color: theme.accent }} />
                        <h3 className="font-semibold truncate" style={{ color: theme.text }}>{song.titlu}</h3>
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: theme.muted }}>{song.autor || 'Fără autor'}</p>
                      {song.tonalitate && (
                        <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-md font-mono font-bold tracking-wide"
                          style={{ backgroundColor: theme.bg, color: theme.chord }}>
                          {song.tonalitate}
                        </span>
                      )}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(song.id); }}
                      className="p-2 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition"
                      style={{ color: theme.muted }}>
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Letter sidebar */}
      {letters.length > 1 && (
        <div className="fixed right-1 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-0.5 py-2">
          {letters.map((letter) => (
            <button key={letter} onClick={() => scrollToLetter(letter)}
              className="w-6 h-5 text-[11px] font-bold leading-none active:scale-90 transition"
              style={{ color: theme.accent }}>
              {letter}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
