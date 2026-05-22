import { useState } from 'react';
import { ArrowUp, ArrowDown, Trash2, Save, Calendar, ListMusic, ChevronRight } from 'lucide-react';
import SongViewer from './SongViewer';

export default function SetlistPlanner({ songs, setlist, onUpdateSetlist, onUpdateSong }) {
  const [eventName, setEventName] = useState(setlist?.eventName || 'Tineret Marți');
  const [selectedSongs, setSelectedSongs] = useState(setlist?.songs || []);
  const [viewingIndex, setViewingIndex] = useState(null);

  const addSong = (songId) => {
    const song = songs.find((s) => s.id === songId);
    if (!song) return;
    const exists = selectedSongs.some((item) => item.songId === song.id);
    if (exists) return;
    setSelectedSongs((prev) => [...prev, {
      songId: song.id,
      titlu: song.titlu,
      autor: song.autor,
      originalKey: song.tonalitate,
      selectedKey: song.tonalitate,
      versuri: song.versuri,
    }]);
  };

  const moveSong = (index, direction) => {
    setSelectedSongs((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeSong = (index) => {
    setSelectedSongs((prev) => prev.filter((_, i) => i !== index));
  };

  const changeKey = (index, newKey) => {
    setSelectedSongs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], selectedKey: newKey };
      return next;
    });
  };

  const saveSetlist = () => {
    onUpdateSetlist({ eventName, songs: selectedSongs });
    alert('Program salvat cu succes!');
  };

  const availableSongs = songs.filter((s) => !selectedSongs.some((item) => item.songId === s.id));

  if (viewingIndex !== null && selectedSongs[viewingIndex]) {
    return (
      <SongViewer
        song={selectedSongs[viewingIndex]}
        onClose={() => setViewingIndex(null)}
        onKeyChange={(newKey) => changeKey(viewingIndex, newKey)}
        onUpdate={(updated) => {
          onUpdateSong?.(updated);
          setSelectedSongs((prev) => prev.map((s) =>
            s.songId === updated.id ? { ...s, titlu: updated.titlu, autor: updated.autor, versuri: updated.versuri, originalKey: updated.tonalitate } : s
          ));
        }}
        onNext={() => setViewingIndex((i) => Math.min(selectedSongs.length - 1, i + 1))}
        onPrev={() => setViewingIndex((i) => Math.max(0, i - 1))}
        hasNext={viewingIndex < selectedSongs.length - 1}
        hasPrev={viewingIndex > 0}
      />
    );
  }

  return (
    <div className="pb-24 px-4 pt-2 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-white mb-4">Planificare</h2>

      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-4 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-yellow-500 shrink-0" />
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none w-full text-lg"
          />
        </div>

        <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1.5 block">
          Adaugă din repertoriu
        </label>
        <select
          className="w-full bg-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          onChange={(e) => { if (e.target.value) { addSong(e.target.value); e.target.value = ''; } }}
          defaultValue=""
        >
          <option value="" disabled>-- Selectează cântare --</option>
          {availableSongs.length === 0 && <option disabled>Nicio cântare disponibilă</option>}
          {availableSongs.map((s) => (
            <option key={s.id} value={s.id}>{s.titlu} ({s.tonalitate})</option>
          ))}
        </select>
      </div>

      <div className="space-y-2.5 mb-6">
        {selectedSongs.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl">
            <ListMusic size={32} className="text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Nicio piesă în program.<br />Adaugă din repertoriu.</p>
          </div>
        )}
        {selectedSongs.map((item, index) => {
          const isOriginal = item.selectedKey === item.originalKey;
          return (
            <div key={index} className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <button
                  className="flex-1 min-w-0 pr-2 text-left"
                  onClick={() => setViewingIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-600 font-bold">#{index + 1}</span>
                    <h3 className="font-bold text-white truncate">{item.titlu}</h3>
                    <ChevronRight size={14} className="text-slate-600 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 pl-6">{item.autor}</p>
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveSong(index, -1)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg active:scale-90 transition">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => moveSong(index, 1)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg active:scale-90 transition">
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => removeSong(index)} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg active:scale-90 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-800 text-yellow-400 px-2.5 py-1 rounded-lg font-mono font-bold">
                  {item.selectedKey}
                </span>
                {!isOriginal && (
                  <span className="text-xs text-rose-400">transpus din {item.originalKey}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={saveSetlist}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition shadow-lg"
      >
        <Save size={18} />
        Salvează Programul
      </button>
    </div>
  );
}
