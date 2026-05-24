import { useState } from 'react';
import { Music } from 'lucide-react';
import SongViewer from './SongViewer';
import { useSettings } from '../contexts/SettingsContext';

export default function LiveMode({ setlist }) {
  const { theme } = useSettings();
  const [viewingIndex, setViewingIndex] = useState(null);
  const songs = setlist?.songs || [];

  if (songs.length === 0) {
    return (
      <div className="pb-24 px-4 pt-8 max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <Music size={56} className="mb-4" style={{ color: theme.border }} />
        <p className="text-center leading-relaxed" style={{ color: theme.muted }}>
          Nu există program salvat.<br />
          Mergi la <span className="font-semibold" style={{ color: theme.accent }}>Planificare</span> și creează un setlist.
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
        <h2 className="text-xl font-bold" style={{ color: theme.text }}>Pe Scenă</h2>
        <span className="text-xs px-3 py-1 rounded-full font-medium border"
          style={{ backgroundColor: theme.surface, color: theme.muted, borderColor: theme.border }}>
          {setlist?.eventName || 'Fără eveniment'}
        </span>
      </div>

      <div className="space-y-3">
        {songs.map((song, index) => (
          <button
            key={index}
            onClick={() => setViewingIndex(index)}
            className="w-full text-left rounded-2xl p-4 border transition active:scale-[0.98] shadow-sm"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold tracking-wider block mb-1"
                  style={{ color: theme.muted }}>
                  #{String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-bold text-lg truncate" style={{ color: theme.text }}>{song.titlu}</h3>
                <p className="text-sm truncate" style={{ color: theme.muted }}>{song.autor}</p>
              </div>
              <div className="px-3.5 py-2 rounded-xl shrink-0 text-center"
                style={{ backgroundColor: theme.bg }}>
                <span className="font-mono font-bold text-xl block leading-none"
                  style={{ color: theme.chord }}>{song.selectedKey}</span>
                {song.selectedKey !== song.originalKey && (
                  <span className="text-[10px] block mt-1" style={{ color: theme.muted }}>{song.originalKey}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
