import { useState } from 'react';
import { ArrowUp, ArrowDown, Trash2, Save, Calendar, ListMusic, ChevronRight, Plus, X } from 'lucide-react';
import SongViewer from './SongViewer';

function genId() {
  return String(Date.now());
}

export default function SetlistPlanner({ songs, setlists, onUpdateSetlists, onUpdateSong }) {
  const [activeId, setActiveId] = useState(setlists[0]?.id ?? '1');
  const [viewingIndex, setViewingIndex] = useState(null);
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEventName, setNewEventName] = useState('');

  const activeEvent = setlists.find((e) => e.id === activeId) ?? setlists[0];
  const selectedSongs = activeEvent?.songs ?? [];

  const updateActive = (patch) => {
    onUpdateSetlists(setlists.map((e) => e.id === activeEvent.id ? { ...e, ...patch } : e));
  };

  const setEventSongs = (songs) => updateActive({ songs });
  const setEventName = (eventName) => updateActive({ eventName });

  const addEvent = () => {
    const name = newEventName.trim() || 'Eveniment nou';
    const ev = { id: genId(), eventName: name, songs: [] };
    onUpdateSetlists([...setlists, ev]);
    setActiveId(ev.id);
    setNewEventName('');
    setAddingEvent(false);
  };

  const deleteEvent = (id) => {
    if (setlists.length <= 1) return;
    const remaining = setlists.filter((e) => e.id !== id);
    onUpdateSetlists(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  };

  const addSong = (songId) => {
    const song = songs.find((s) => s.id === songId);
    if (!song) return;
    if (selectedSongs.some((item) => item.songId === song.id)) return;
    setEventSongs([...selectedSongs, {
      songId: song.id,
      titlu: song.titlu,
      autor: song.autor,
      originalKey: song.tonalitate,
      selectedKey: song.tonalitate,
      versuri: song.versuri,
    }]);
  };

  const moveSong = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= selectedSongs.length) return;
    const next = [...selectedSongs];
    [next[index], next[target]] = [next[target], next[index]];
    setEventSongs(next);
  };

  const removeSong = (index) => {
    setEventSongs(selectedSongs.filter((_, i) => i !== index));
  };

  const changeKey = (index, newKey) => {
    const next = [...selectedSongs];
    next[index] = { ...next[index], selectedKey: newKey };
    setEventSongs(next);
  };

  const availableSongs = songs.filter((s) => !selectedSongs.some((item) => item.songId === s.id));

  if (viewingIndex !== null && selectedSongs[viewingIndex]) {
    const item = selectedSongs[viewingIndex];
    const masterSong = songs.find((s) => s.id === item.songId);
    return (
      <SongViewer
        song={{ ...item, id: item.songId, versuri: masterSong?.versuri ?? item.versuri ?? '' }}
        onClose={() => setViewingIndex(null)}
        onKeyChange={(newKey) => changeKey(viewingIndex, newKey)}
        onUpdate={(updated) => {
          onUpdateSong?.(updated);
          setEventSongs(selectedSongs.map((s) =>
            s.songId === updated.id
              ? { ...s, titlu: updated.titlu, autor: updated.autor, versuri: updated.versuri, originalKey: updated.tonalitate }
              : s
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

      {/* Event tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        {setlists.map((ev) => (
          <div key={ev.id} className="relative shrink-0">
            <button
              onClick={() => { setActiveId(ev.id); setViewingIndex(null); }}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                ev.id === activeId
                  ? 'bg-yellow-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {ev.eventName}
            </button>
            {setlists.length > 1 && ev.id === activeId && (
              <button
                onClick={() => deleteEvent(ev.id)}
                className="absolute -top-1.5 -right-1.5 bg-rose-600 rounded-full p-0.5 text-white"
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}

        {addingEvent ? (
          <div className="flex items-center gap-1 shrink-0">
            <input
              autoFocus
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addEvent(); if (e.key === 'Escape') setAddingEvent(false); }}
              placeholder="Nume eveniment"
              className="bg-slate-800 text-white text-sm px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 w-36"
            />
            <button onClick={addEvent} className="text-yellow-500 font-bold text-sm px-2">OK</button>
            <button onClick={() => setAddingEvent(false)} className="text-slate-500 text-sm px-1">✕</button>
          </div>
        ) : (
          <button
            onClick={() => setAddingEvent(true)}
            className="shrink-0 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-yellow-500 transition"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Event name editor */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-4 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-yellow-500 shrink-0" />
          <input
            type="text"
            value={activeEvent?.eventName ?? ''}
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

      {/* Song list */}
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
            <div key={index} className="bg-slate-900 rounded-xl p-3 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-slate-500 font-bold shrink-0">#{index + 1}</span>
                <span className="bg-slate-800 text-yellow-400 px-2.5 py-1 rounded-lg font-mono font-bold text-base shrink-0">
                  {item.selectedKey}
                </span>
                {!isOriginal && (
                  <span className="text-xs text-rose-400 shrink-0">→{item.originalKey}</span>
                )}
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => setViewingIndex(index)}
                >
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-white truncate">{item.titlu}</h3>
                    <ChevronRight size={14} className="text-slate-600 shrink-0" />
                  </div>
                </button>
                <div className="flex items-center gap-1 shrink-0">
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
            </div>
          );
        })}
      </div>

      <button
        onClick={() => alert('Program salvat!')}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition shadow-lg"
      >
        <Save size={18} />
        Salvează Programul
      </button>
    </div>
  );
}
