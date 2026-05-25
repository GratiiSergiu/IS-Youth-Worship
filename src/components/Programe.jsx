import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { ChevronRight, Music } from 'lucide-react';
import SongViewer from './SongViewer';

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('ro-RO', options);
}

export default function Programe({ istoricData, songs, onUpdateSong }) {
  const { theme } = useSettings();
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [viewingSong, setViewingSong] = useState(null);

  if (viewingSong) {
    const { song, program } = viewingSong;
    const songIndex = program.cantari.findIndex(c => c.songId === song.songId);

    const changeKey = (newKey) => {
      // This is a temporary change for viewing, so we don't update the main istoricData
      const updatedSong = { ...song, selectedKey: newKey };
      setViewingSong({ song: updatedSong, program });
    }

    const masterSong = songs.find(s => s.id === song.songId);

    return (
      <SongViewer
        song={{ ...song, id: song.songId, versuri: masterSong?.versuri ?? song.versuri ?? '' }}
        onClose={() => setViewingSong(null)}
        onKeyChange={changeKey}
        onUpdate={onUpdateSong} // This allows editing the master song from the program view
        onNext={() => {
          const nextIndex = songIndex + 1;
          if (nextIndex < program.cantari.length) {
            setViewingSong({ song: program.cantari[nextIndex], program });
          }
        }}
        onPrev={() => {
          const prevIndex = songIndex - 1;
          if (prevIndex >= 0) {
            setViewingSong({ song: program.cantari[prevIndex], program });
          }
        }}
        hasNext={songIndex < program.cantari.length - 1}
        hasPrev={songIndex > 0}
      />
    );
  }

  if (selectedProgram) {
    return (
      <div className="px-4 pt-2 max-w-md mx-auto">
        <button onClick={() => setSelectedProgram(null)} className="text-sm font-semibold mb-3" style={{ color: theme.accent }}>
          ‹ Înapoi la listă
        </button>
        <div className="space-y-2.5">
          {selectedProgram.cantari.map((item, index) => (
            <div key={index} className="rounded-xl p-3 border shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-base shrink-0" style={{ backgroundColor: theme.bg, color: theme.chord }}>
                  {item.selectedKey}
                </span>
                <button className="flex-1 min-w-0 text-left" onClick={() => setViewingSong({ song: item, program: selectedProgram })}>
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold truncate" style={{ color: theme.text }}>{item.titlu}</h3>
                    <ChevronRight size={14} className="shrink-0" style={{ color: theme.muted }} />
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 max-w-md mx-auto">
      {istoricData.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl m-4" style={{ borderColor: theme.border }}>
            <Music size={32} className="mx-auto mb-2" style={{ color: theme.border }} />
            <p className="text-sm" style={{ color: theme.muted }}>Niciun program salvat.<br />Creează unul din secțiunea "Planificare".</p>
        </div>
      ) : (
        <div className="space-y-3">
          {istoricData.map((program) => (
            <button
              key={program.id}
              onClick={() => setSelectedProgram(program)}
              className="w-full text-left bg-white rounded-xl p-4 border shadow-sm flex items-center justify-between active:scale-95 transition"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <div>
                <p className="font-bold" style={{ color: theme.text }}>{program.nume_eveniment}</p>
                <p className="text-sm mt-1" style={{ color: theme.muted }}>{formatDate(program.data_eveniment)}</p>
              </div>
              <ChevronRight size={20} style={{ color: theme.muted }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
