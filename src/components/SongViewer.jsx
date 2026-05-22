import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Music2, FileText, Pencil, Check, X } from 'lucide-react';
import { getSemitonesBetween, transposeLyrics, renderLyrics } from '../utils/chords';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

function detectKey(versuri) {
  const m = versuri.match(/\[([A-G][#b]?)/);
  if (!m) return 'C';
  return FLAT_TO_SHARP[m[1]] || m[1];
}

function buildChordRow(parts) {
  let chordLine = '';
  let textPos = 0;
  for (const part of parts) {
    if (part.type === 'text') {
      textPos += part.content.length;
    } else {
      const pad = Math.max(0, textPos - chordLine.length);
      chordLine += ' '.repeat(pad) + part.content;
    }
  }
  return chordLine;
}

function buildLyricRow(parts) {
  return parts.filter((p) => p.type === 'text').map((p) => p.content).join('');
}

export default function SongViewer({ song, onClose, onNext, onPrev, hasNext, hasPrev, onKeyChange, onUpdate }) {
  const [showChords, setShowChords] = useState(true);
  const [currentKey, setCurrentKey] = useState(song.selectedKey || song.originalKey || 'C');
  const [showKeyPicker, setShowKeyPicker] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ titlu: song.titlu, autor: song.autor, versuri: song.versuri });

  const originalKey = song.originalKey || currentKey;
  const semitones = getSemitonesBetween(originalKey, currentKey);
  const transposed = transposeLyrics(editMode ? song.versuri : editForm.versuri, semitones);
  const lines = renderLyrics(transposed);

  const handleKeySelect = (key) => {
    setCurrentKey(key);
    setShowKeyPicker(false);
    onKeyChange?.(key);
  };

  const handleSave = () => {
    const newKey = detectKey(editForm.versuri);
    onUpdate?.({
      ...song,
      titlu: editForm.titlu.trim(),
      autor: editForm.autor.trim(),
      versuri: editForm.versuri,
      tonalitate: newKey,
      originalKey: newKey,
    });
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditForm({ titlu: song.titlu, autor: song.autor, versuri: song.versuri });
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950 shrink-0">
        <button onClick={editMode ? handleCancelEdit : onClose} className="text-white p-2 -ml-2 active:opacity-60 transition">
          {editMode ? <X size={24} /> : <ArrowLeft size={24} />}
        </button>

        <div className="text-center min-w-0 px-2 flex-1">
          {editMode ? (
            <input
              className="w-full bg-slate-800 rounded-lg px-3 py-1.5 text-white text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              value={editForm.titlu}
              onChange={(e) => setEditForm((f) => ({ ...f, titlu: e.target.value }))}
              placeholder="Titlu"
            />
          ) : (
            <>
              <h2 className="text-white font-bold text-sm truncate">{song.titlu}</h2>
              <button
                onClick={() => setShowKeyPicker(true)}
                className="mt-0.5 inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full transition active:scale-95"
              >
                <span className="text-yellow-400 font-mono text-xs font-bold">{currentKey}</span>
                {semitones !== 0 && <span className="text-[10px] text-slate-500">din {originalKey}</span>}
                <span className="text-[9px] text-slate-600">▼</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          {editMode ? (
            <button onClick={handleSave} className="p-2 text-yellow-400 active:opacity-60 transition">
              <Check size={22} />
            </button>
          ) : (
            <>
              <button onClick={() => setShowChords((v) => !v)} className={`p-2 rounded-lg transition ${showChords ? 'text-yellow-400' : 'text-slate-500'}`}>
                {showChords ? <Music2 size={20} /> : <FileText size={20} />}
              </button>
              {onUpdate && (
                <button onClick={() => setEditMode(true)} className="p-2 text-slate-400 hover:text-white transition">
                  <Pencil size={18} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit mode body */}
      {editMode ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <input
            className="w-full bg-slate-900 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm"
            value={editForm.autor}
            onChange={(e) => setEditForm((f) => ({ ...f, autor: e.target.value }))}
            placeholder="Autor"
          />
          <textarea
            className="w-full bg-slate-900 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 font-mono text-sm leading-relaxed"
            rows={20}
            value={editForm.versuri}
            onChange={(e) => setEditForm((f) => ({ ...f, versuri: e.target.value }))}
            placeholder="Versuri cu acorduri [G] ..."
          />
          <button
            onClick={handleSave}
            className="w-full bg-yellow-500 text-slate-950 font-bold py-3 rounded-xl active:scale-95 transition"
          >
            Salvează modificările
          </button>
        </div>
      ) : (
        /* Lyrics view */
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="font-mono">
            {lines.map((line) => {
              if (line.parts.length === 0) return <div key={line.lineIndex} className="h-5" />;

              const hasChords = line.parts.some((p) => p.type === 'chord');
              const lyricRow = buildLyricRow(line.parts);

              if (!hasChords || !showChords) {
                return (
                  <div key={line.lineIndex} className="text-white text-xl sm:text-2xl leading-snug">
                    {lyricRow || ' '}
                  </div>
                );
              }

              return (
                <div key={line.lineIndex} className="mb-1">
                  <div className="text-yellow-400 font-bold text-base sm:text-lg leading-tight whitespace-pre">
                    {buildChordRow(line.parts)}
                  </div>
                  <div className="text-white text-xl sm:text-2xl leading-snug">
                    {lyricRow || ' '}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer nav — hidden in edit mode */}
      {!editMode && (
        <div className="flex justify-between items-center px-4 py-3 border-t border-slate-800 bg-slate-950 shrink-0">
          <button onClick={onPrev} disabled={!hasPrev} className="flex items-center gap-1 text-slate-300 disabled:text-slate-700 active:text-white transition">
            <ChevronLeft size={20} /> <span className="text-sm font-medium">Anterior</span>
          </button>
          <span className="text-xs text-slate-600 truncate max-w-[120px]">{song.autor}</span>
          <button onClick={onNext} disabled={!hasNext} className="flex items-center gap-1 text-slate-300 disabled:text-slate-700 active:text-white transition">
            <span className="text-sm font-medium">Următor</span> <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Key picker */}
      {showKeyPicker && (
        <div className="fixed inset-0 bg-black/70 z-60 flex items-end" onClick={() => setShowKeyPicker(false)}>
          <div className="w-full bg-slate-900 rounded-t-2xl p-5 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
            <p className="text-slate-400 text-sm font-semibold text-center mb-4">Selectează tonalitatea</p>
            <div className="grid grid-cols-4 gap-2.5">
              {KEYS.map((k) => (
                <button key={k} onClick={() => handleKeySelect(k)}
                  className={`py-3.5 rounded-xl font-mono font-bold text-base transition active:scale-95 ${
                    k === currentKey ? 'bg-yellow-500 text-slate-950 shadow-lg' : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
