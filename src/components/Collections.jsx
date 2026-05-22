import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, X, Music2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import SongViewer from './SongViewer';

function genId() {
  return String(Date.now());
}

const EMOJIS = ['🎵', '✝️', '🌸', '⭐', '🙏', '🎄', '🎉', '🕊️', '🔥', '💛', '🌿', '🎺'];

export default function Collections({ songs, collections, onUpdateCollections, onUpdateSong }) {
  const { theme } = useSettings();
  const [activeId, setActiveId] = useState(null);
  const [viewingIndex, setViewingIndex] = useState(null);
  const [addingCol, setAddingCol] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎵');

  const active = collections.find((c) => c.id === activeId);
  const colSongs = active ? songs.filter((s) => active.songIds.includes(s.id)) : [];
  const available = songs.filter((s) => !active?.songIds.includes(s.id));

  const createCollection = () => {
    const name = newName.trim();
    if (!name) return;
    onUpdateCollections([...collections, { id: genId(), name, emoji: newEmoji, songIds: [] }]);
    setNewName('');
    setNewEmoji('🎵');
    setAddingCol(false);
  };

  const deleteCollection = (id) => {
    onUpdateCollections(collections.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const addSong = (songId) => {
    onUpdateCollections(collections.map((c) =>
      c.id === activeId ? { ...c, songIds: [...c.songIds, songId] } : c
    ));
  };

  const removeSong = (songId) => {
    onUpdateCollections(collections.map((c) =>
      c.id === activeId ? { ...c, songIds: c.songIds.filter((id) => id !== songId) } : c
    ));
  };

  // ── Song viewer ───────────────────────────────────────────────────────────────
  if (viewingIndex !== null && colSongs[viewingIndex]) {
    const song = colSongs[viewingIndex];
    return (
      <SongViewer
        song={{ ...song, originalKey: song.tonalitate, selectedKey: song.tonalitate }}
        onClose={() => setViewingIndex(null)}
        onUpdate={(updated) => onUpdateSong?.(updated)}
        onNext={() => setViewingIndex((i) => Math.min(colSongs.length - 1, i + 1))}
        onPrev={() => setViewingIndex((i) => Math.max(0, i - 1))}
        hasNext={viewingIndex < colSongs.length - 1}
        hasPrev={viewingIndex > 0}
      />
    );
  }

  // ── Collection detail ─────────────────────────────────────────────────────────
  if (active) {
    return (
      <div className="pb-24 px-4 pt-2 max-w-md mx-auto">
        <button onClick={() => setActiveId(null)} className="flex items-center gap-2 mb-3" style={{ color: theme.muted }}>
          <ArrowLeft size={16} />
          <span className="text-sm">Toate colecțiile</span>
        </button>

        <h2 className="text-xl font-bold mb-4" style={{ color: theme.text }}>
          {active.emoji} {active.name}
        </h2>

        <div className="rounded-2xl p-4 border mb-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <label className="text-xs uppercase tracking-wider font-semibold mb-1.5 block" style={{ color: theme.muted }}>
            Adaugă din repertoriu
          </label>
          <select
            className="w-full rounded-xl px-3 py-2.5 focus:outline-none"
            style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
            onChange={(e) => { if (e.target.value) { addSong(e.target.value); e.target.value = ''; } }}
            defaultValue=""
          >
            <option value="" disabled>-- Selectează cântare --</option>
            {available.length === 0 && <option disabled>Toate cântările sunt adăugate</option>}
            {available.map((s) => (
              <option key={s.id} value={s.id}>{s.titlu}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          {colSongs.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed rounded-2xl" style={{ borderColor: theme.border }}>
              <Music2 size={32} className="mx-auto mb-2" style={{ color: theme.border }} />
              <p className="text-sm" style={{ color: theme.muted }}>Nicio cântare în colecție.<br />Adaugă din repertoriu.</p>
            </div>
          )}
          {colSongs.map((song, index) => (
            <div key={song.id} className="rounded-xl p-3 border flex items-center gap-3" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <button className="flex-1 min-w-0 text-left" onClick={() => setViewingIndex(index)}>
                <p className="font-semibold truncate" style={{ color: theme.text }}>{song.titlu}</p>
                {song.autor && <p className="text-xs truncate" style={{ color: theme.muted }}>{song.autor}</p>}
              </button>
              <span className="text-sm font-mono font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: theme.bg, color: theme.chord }}>
                {song.tonalitate}
              </span>
              <button onClick={() => removeSong(song.id)} className="p-1.5 rounded-lg" style={{ color: theme.muted }}>
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Collections list ──────────────────────────────────────────────────────────
  return (
    <div className="pb-24 px-4 pt-2 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4" style={{ color: theme.text }}>Colecții</h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {collections.map((col) => (
          <div key={col.id} className="relative rounded-2xl border p-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <button
              onClick={() => deleteCollection(col.id)}
              className="absolute top-2 right-2 p-1.5 rounded-full"
              style={{ color: theme.muted }}
            >
              <Trash2 size={12} />
            </button>
            <button className="w-full text-left" onClick={() => setActiveId(col.id)}>
              <div className="text-3xl mb-2">{col.emoji}</div>
              <p className="font-bold truncate pr-4" style={{ color: theme.text }}>{col.name}</p>
              <p className="text-xs mt-0.5" style={{ color: theme.muted }}>
                {col.songIds.length} {col.songIds.length === 1 ? 'cântare' : 'cântări'}
              </p>
            </button>
          </div>
        ))}

        {!addingCol && (
          <button
            onClick={() => setAddingCol(true)}
            className="rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center gap-2 transition"
            style={{ borderColor: theme.border, color: theme.muted }}
          >
            <Plus size={24} />
            <span className="text-sm font-semibold">Colecție nouă</span>
          </button>
        )}
      </div>

      {addingCol && (
        <div className="rounded-2xl border p-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <p className="font-semibold mb-3" style={{ color: theme.text }}>Colecție nouă</p>

          <div className="flex gap-2 flex-wrap mb-3">
            {EMOJIS.map((em) => (
              <button
                key={em}
                onClick={() => setNewEmoji(em)}
                className="text-xl p-1.5 rounded-lg transition"
                style={{
                  backgroundColor: newEmoji === em ? theme.accent + '33' : 'transparent',
                  border: `2px solid ${newEmoji === em ? theme.accent : 'transparent'}`,
                }}
              >
                {em}
              </button>
            ))}
          </div>

          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') createCollection(); if (e.key === 'Escape') setAddingCol(false); }}
            placeholder="Numele colecției (ex: Paști, Laudă...)"
            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none mb-3"
            style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
          />

          <div className="flex gap-2">
            <button
              onClick={createCollection}
              className="flex-1 py-2 rounded-xl font-bold text-sm"
              style={{ backgroundColor: theme.accent, color: theme.accentFg }}
            >
              Creează
            </button>
            <button
              onClick={() => { setAddingCol(false); setNewName(''); }}
              className="px-4 py-2 rounded-xl text-sm"
              style={{ backgroundColor: theme.bg, color: theme.muted, border: `1px solid ${theme.border}` }}
            >
              Anulează
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
