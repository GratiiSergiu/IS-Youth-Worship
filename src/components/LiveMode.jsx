import { useState } from 'react';
import { Music, Radio } from 'lucide-react';
import SongViewer from './SongViewer';

export default function LiveMode({ setlist }) {
  const [viewingIndex, setViewingIndex] = useState(null);
  const songs = setlist?.songs || [];

  if (songs.length === 0) {
    return (
      <div className="pb-24 px-4 pt-8 max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <Music size={56} className="text-slate-800 mb-4" />
        <p className="text-slate-500 text-center leading-relaxed">
          Nu există program salvat.<br />
          Mergi la <span className="text-yellow-500 font-semibold">Planificare</span> și creează un setlist.
        </p>
      </div>
    );
  }

  if (viewingIndex !== null) {
    const song = songs[viewingIndex];
    return (
      <SongViewer
        song={song}
        onClose={() => setViewingIndex(null)}
        onNext={() => setViewingIndex((i) => Math.min(songs.length - 1, i + 1))}
        onPrev={() => setViewingIndex((i) => Math.max(0, i - 1))}
        hasNext={viewingIndex < songs.length - 1}
        hasPrev={viewingIndex > 0}
      />
    );
  }

  return (
    <div className="pb-24 px-4 pt-2 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white">Pe Scenă</h2>
        <span className="text-xs bg-slate-900 text-slate-400 px-3 py-1 rounded-full border border-slate-800 font-medium">
          {setlist?.eventName || 'Fără eveniment'}
        </span>
      </div>

      <div className="space-y-3">
        {songs.map((song, index) => (
          <button
            key={index}
            onClick={() => setViewingIndex(index)}
            className="w-full text-left bg-slate-900 rounded-2xl p-4 border border-slate-800 transition active:scale-[0.98] hover:border-slate-700 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-600 font-mono font-bold tracking-wider block mb-1">
                  #{String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-bold text-white text-lg truncate">{song.titlu}</h3>
                <p className="text-sm text-slate-400 truncate">{song.autor}</p>
              </div>
              <div className="bg-slate-800 px-3.5 py-2 rounded-xl shrink-0 text-center">
                <span className="text-yellow-400 font-mono font-bold text-xl block leading-none">{song.selectedKey}</span>
                {song.selectedKey !== song.originalKey && (
                  <span className="text-[10px] text-slate-500 block mt-1">{song.originalKey}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
