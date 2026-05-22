import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSemitonesBetween, transposeLyrics, renderLyrics } from '../utils/chords';

export default function SongViewer({ song, onClose, onNext, onPrev, hasNext, hasPrev }) {
  const semitones = getSemitonesBetween(song.originalKey, song.selectedKey);
  const transposed = transposeLyrics(song.versuri, semitones);
  const lines = renderLyrics(transposed);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950 shrink-0">
        <button onClick={onClose} className="text-white p-2 -ml-2 active:opacity-60 transition">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center min-w-0 px-2">
          <h2 className="text-white font-bold text-sm truncate">{song.titlu}</h2>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="text-yellow-400 font-mono text-xs font-bold">{song.selectedKey}</span>
            {semitones !== 0 && (
              <span className="text-[10px] text-slate-500">(orig. {song.originalKey})</span>
            )}
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-8">
        <div className="font-mono text-xl sm:text-2xl leading-relaxed whitespace-pre-wrap">
          {lines.map((line) => (
            <div key={line.lineIndex} className="min-h-[1.6em]">
              {line.parts.length === 0 && <br />}
              {line.parts.map((part, i) =>
                part.type === 'chord' ? (
                  <span key={i} className="text-yellow-400 font-bold">{part.content}</span>
                ) : (
                  <span key={i} className="text-white">{part.content}</span>
                )
              )}
            </div>
          ))}
        </div>
      </div>

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
    </div>
  );
}
