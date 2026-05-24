import { useState } from 'react';
import { ArrowUp, ArrowDown, Trash2, Save, Calendar, ListMusic, ChevronRight, Plus, X, CheckCircle2, Loader2, AlertCircle, SlidersHorizontal } from 'lucide-react';
import SongViewer from './SongViewer';
import { useSettings } from '../contexts/SettingsContext';

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function genId() {
  return String(Date.now());
}

export default function SetlistPlanner({ songs, setlists, onUpdateSetlists, onUpdateSong, onSaveProgram }) {
  const { theme } = useSettings();
  const [activeId, setActiveId] = useState(setlists[0]?.id ?? '1');
  const [viewingIndex, setViewingIndex] = useState(null);
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [eventDate, setEventDate] = useState(todayString);
  const [saveState, setSaveState] = useState('idle');
  const [aranjamentIndex, setAranjamentIndex] = useState(null);

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

  const handleSaveProgram = async () => {
    if (selectedSongs.length === 0) return;
    setSaveState('saving');
    const { error } = await onSaveProgram({
      data_eveniment: eventDate,
      nume_eveniment: activeEvent.eventName,
      cantari: selectedSongs,
    });
    if (error) {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    } else {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    }
  };

  const aranjamentSong = aranjamentIndex !== null ? selectedSongs[aranjamentIndex] : null;
  const updateAranjament = (patch) => {
    const next = [...selectedSongs];
    next[aranjamentIndex] = { ...next[aranjamentIndex], aranjament: { ...(next[aranjamentIndex].aranjament ?? {}), ...patch } };
    setEventSongs(next);
  };

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
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition whitespace-nowrap"
              style={ev.id === activeId
                ? { backgroundColor: theme.accent, color: theme.accentFg }
                : { backgroundColor: theme.surface, color: theme.muted, border: `1px solid ${theme.border}` }
              }
            >
              {ev.eventName}
            </button>
            {setlists.length > 1 && ev.id === activeId && (
              <button
                onClick={() => deleteEvent(ev.id)}
                className="absolute -top-1.5 -right-1.5 rounded-full p-0.5"
                style={{ backgroundColor: '#e11d48', color: '#fff' }}
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
              className="text-sm px-2 py-1 rounded-lg focus:outline-none w-36"
              style={{ backgroundColor: theme.surface, color: theme.text, border: `1px solid ${theme.border}` }}
            />
            <button onClick={addEvent} className="text-sm px-2 font-bold" style={{ color: theme.accent }}>OK</button>
            <button onClick={() => setAddingEvent(false)} className="text-sm px-1" style={{ color: theme.muted }}>✕</button>
          </div>
        ) : (
          <button
            onClick={() => setAddingEvent(true)}
            className="shrink-0 p-1.5 rounded-full transition"
            style={{ backgroundColor: theme.surface, color: theme.muted, border: `1px solid ${theme.border}` }}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Event card */}
      <div className="rounded-2xl p-4 border mb-4 shadow-lg" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} style={{ color: theme.accent }} className="shrink-0" />
            <input
                type="text"
                value={activeEvent?.eventName ?? ''}
                onChange={(e) => setEventName(e.target.value)}
                className="bg-transparent font-bold focus:outline-none w-full text-lg"
                style={{ color: theme.text }}
            />
          </div>
          <div className="flex items-center gap-2 mb-4 rounded-xl px-3 py-2.5" style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}>
            <span className="text-xs font-semibold shrink-0" style={{ color: theme.muted }}>Data programului:</span>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="flex-1 bg-transparent text-sm font-semibold focus:outline-none"
              style={{ color: theme.text, colorScheme: 'dark' }}
            />
          </div>

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
            {availableSongs.length === 0 && <option disabled>Nicio cântare disponibilă</option>}
            {availableSongs.map((s) => (
              <option key={s.id} value={s.id}>{s.titlu} ({s.tonalitate})</option>
            ))}
          </select>
      </div>

      {/* Song list */}
      <div className="space-y-2.5 mb-6">
          {selectedSongs.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-2xl" style={{ borderColor: theme.border }}>
              <ListMusic size={32} className="mx-auto mb-2" style={{ color: theme.border }} />
              <p className="text-sm" style={{ color: theme.muted }}>Nicio piesă în program.<br />Adaugă din repertoriu.</p>
            </div>
          )}
          {selectedSongs.map((item, index) => {
            const isOriginal = item.selectedKey === item.originalKey;
            return (
              <div key={index} className="rounded-xl p-3 border shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold shrink-0" style={{ color: theme.muted }}>#{index + 1}</span>
                  <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-base shrink-0" style={{ backgroundColor: theme.bg, color: theme.chord }}>
                    {item.selectedKey}
                  </span>
                  {!isOriginal && (
                    <span className="text-xs shrink-0" style={{ color: '#fb7185' }}>→{item.originalKey}</span>
                  )}
                  <button className="flex-1 min-w-0 text-left" onClick={() => setViewingIndex(index)}>
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold truncate" style={{ color: theme.text }}>{item.titlu}</h3>
                      <ChevronRight size={14} className="shrink-0" style={{ color: theme.muted }} />
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setAranjamentIndex(index)}
                      className="p-1.5 rounded-lg active:scale-90 transition relative"
                      style={{ backgroundColor: item.aranjament?.voceaLead ? theme.accent + '22' : theme.bg, color: item.aranjament?.voceaLead ? theme.accent : theme.muted }}>
                      <SlidersHorizontal size={14} />
                    </button>
                    <button onClick={() => moveSong(index, -1)} className="p-1.5 rounded-lg active:scale-90 transition" style={{ backgroundColor: theme.bg, color: theme.muted }}>
                      <ArrowUp size={14} />
                    </button>
                    <button onClick={() => moveSong(index, 1)} className="p-1.5 rounded-lg active:scale-90 transition" style={{ backgroundColor: theme.bg, color: theme.muted }}>
                      <ArrowDown size={14} />
                    </button>
                    <button onClick={() => removeSong(index)} className="p-1.5 rounded-lg active:scale-90 transition" style={{ backgroundColor: theme.bg, color: theme.muted }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {saveState === 'error' && (
          <div className="mb-3 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ backgroundColor: '#450a0a', border: '1px solid #7f1d1d' }}>
            <AlertCircle size={16} className="shrink-0" style={{ color: '#f87171' }} />
            <span className="text-sm" style={{ color: '#f87171' }}>Eroare la salvare. Verifică conexiunea.</span>
          </div>
        )}

        <button
          onClick={handleSaveProgram}
          disabled={saveState === 'saving' || selectedSongs.length === 0}
          className="w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition shadow-lg disabled:opacity-60"
          style={{
            backgroundColor: saveState === 'saved' ? '#16a34a' : theme.accent,
            color: saveState === 'saved' ? '#fff' : theme.accentFg,
          }}
        >
          {saveState === 'saving' && <Loader2 size={18} className="animate-spin" />}
          {saveState === 'saved'  && <CheckCircle2 size={18} />}
          {saveState === 'idle' || saveState === 'error' ? <Save size={18} /> : null}
          {saveState === 'saving' ? 'Se salvează…' : saveState === 'saved' ? 'Program salvat!' : 'Salvează Programul'}
        </button>


      {/* ── Aranjament modal ── */}
      {aranjamentSong && (
        <div className="fixed inset-0 z-50 flex items-end anim-overlay"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={() => setAranjamentIndex(null)}>
          <div className="w-full rounded-t-3xl max-h-[85vh] flex flex-col anim-sheet"
            style={{ backgroundColor: theme.surface, borderTop: `2px solid ${theme.accent}` }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: theme.border }} />
            </div>
            <div className="flex items-start justify-between px-5 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <div>
                <p className="font-bold text-base" style={{ color: theme.text }}>Aranjament</p>
                <p className="text-xs mt-0.5" style={{ color: theme.muted }}>{aranjamentSong.titlu}</p>
              </div>
              <button onClick={() => setAranjamentIndex(null)} className="p-2 rounded-xl" style={{ color: theme.muted }}><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
