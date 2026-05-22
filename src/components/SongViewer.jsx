import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Music2, FileText } from 'lucide-react';
import { getSemitonesBetween, transposeLyrics, renderLyrics } from '../utils/chords';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function SongViewer({ song, onClose, onNext, onPrev, hasNext, hasPrev, onKeyChange }) {
  const [showChords, setShowChords] = useState(true);
  const [currentKey, setCurrentKey] = useState(song.selectedKey || song.originalKey || 'C');
  const [showKeyPicker, setShowKeyPicker] = useState(false);

  const originalKey = song.originalKey || currentKey;
  const semitones = getSemitonesBetween(originalKey, currentKey);
  const transposed = transposeLyrics(song.versuri, semitones);
  const lines = renderLyrics(transposed);

  const handleKeySelect = (key) => {
    setCurrentKey(key);
    setShowKeyPicker(false);
    onKeyChange?.(key);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950 shrink-0">
        <button onClick={onClose} className="text-white p-2 -ml-2 active:opacity-60 transition">
          <ArrowLeft size={24} />
        </button>

        <div className="text-center min-w-0 px-2">
          <h2 className="text-white font-bold text-sm truncate">{song.titlu}</h2>
          <button
            onClick={() => setShowKeyPicker(true)}
            className="mt-0.5 inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full transition active:scale-95"
          >
            <span className="text-yellow-400 font-mono text-xs font-bold">{currentKey}</span>
            {semitones !== 0 && (
              <span className="text-[10px] text-slate-500">din {originalKey}</span>
            )}
            <span className="text-[9px] text-slate-600 uppercase tracking-wider">▼</span>
          </button>
        </div>

        <button
          onClick={() => setShowChords((v) => !v)}
          className={`p-2 -mr-2 rounded-lg transition ${showChords ? 'text-yellow-400' : 'text-slate-500'}`}
          title={showChords ? 'Ascunde acorduri' : 'Arată acorduri'}
        >
          {showChords ? <Music2 size={20} /> : <FileText size={20} />}
        </button>
      </div>

      {/* Lyrics */}
      <div className="flex-1 overflow-y-auto px-5 py-8">
        <div className="font-mono text-xl sm:text-2xl leading-relaxed whitespace-pre-wrap">
          {lines.map((line) => (
            <div key={line.lineIndex} className="min-h-[1.6em]">
              {line.parts.length === 0 && <br />}
              {line.parts.map((part, i) => {
                if (part.type === 'chord') {
                  return showChords ? (
                    <span key={i} className="text-yellow-400 font-bold">{part.content}</span>
                  ) : null;
                }
                return <span key={i} className="text-white">{part.content}</span>;
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex justify-between items-center px-4 py-3 border-t border-slate-800 bg-slate-950 shrink-0">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center gap-1 text-slate-300 disabled:text-slate-700 active:text-white transition"
        >
          <ChevronLeft size={20} /> <span className="text-sm font-medium">Anterior</span>
        </button>
        <span className="text-xs text-slate-600 truncate max-w-[120px]">{song.autor}</span>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-1 text-slate-300 disabled:text-slate-700 active:text-white transition"
        >
          <span className="text-sm font-medium">Următor</span> <ChevronRight size={20} />
        </button>
      </div>

      {/* Key picker overlay */}
      {showKeyPicker && (
        <div
          className="fixed inset-0 bg-black/70 z-60 flex items-end"
          onClick={() => setShowKeyPicker(false)}
        >
          <div
            className="w-full bg-slate-900 rounded-t-2xl p-5 border-t border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-slate-400 text-sm font-semibold text-center mb-4">Selectează tonalitatea</p>
            <div className="grid grid-cols-4 gap-2.5">
              {KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeySelect(k)}
                  className={`py-3.5 rounded-xl font-mono font-bold text-base transition active:scale-95 ${
                    k === currentKey
                      ? 'bg-yellow-500 text-slate-950 shadow-lg'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
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
