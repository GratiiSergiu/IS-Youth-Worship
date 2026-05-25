import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { ChevronRight, Music, Calendar } from 'lucide-react';
import SongViewer from './SongViewer';

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('ro-RO', options);
}

export default function Programe({ istoricData, songs, onUpdateSong, onUpdateProgram }) {
  const { theme } = useSettings();
  const [selectedGroupName, setSelectedGroupName] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [viewingSong, setViewingSong] = useState(null);

  // 1. Group programs by name, excluding 'repetitie'
  const programeGrupate = istoricData
    .filter(p => !p.nume_eveniment?.toLowerCase().replace('ț','t').replace('ș','s').includes('repetitie'))
    .reduce((acc, program) => {
      const groupName = program.nume_eveniment;
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(program);
      // Sort by date descending
      acc[groupName].sort((a, b) => new Date(b.data_eveniment) - new Date(a.data_eveniment));
      return acc;
    }, {});
  
  const groupNames = Object.keys(programeGrupate);

  // --- Render Logic ---

  if (viewingSong) {
    const { song, program } = viewingSong;
    const masterSong = songs.find(s => s.id === song.songId);

    const changeKey = (newKey) => {
      setViewingSong({ song: { ...song, selectedKey: newKey }, program });
    };

    const handleAranjamentChange = async (aranjament) => {
      const updatedCantari = program.cantari.map(c =>
        c.songId === song.songId ? { ...c, aranjament } : c
      );
      const updatedProgram = { ...program, cantari: updatedCantari };
      await onUpdateProgram?.(updatedProgram);
      setViewingSong({ song: { ...song, aranjament }, program: updatedProgram });
    };

    return (
      <SongViewer
        song={{ ...song, id: song.songId, versuri: masterSong?.versuri ?? '' }}
        onClose={() => setViewingSong(null)}
        onKeyChange={changeKey}
        onUpdate={onUpdateSong}
        onAranjamentChange={handleAranjamentChange}
      />
    );
  }

  if (selectedProgram) {
    // View showing songs for a selected date
    return (
      <div className="px-4 pt-2 max-w-md mx-auto">
        <button onClick={() => setSelectedProgram(null)} className="text-sm font-semibold mb-3" style={{ color: theme.accent }}>
          ‹ Înapoi la date
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

  if (selectedGroupName) {
    // View showing dates for a selected program group
    const programeDinGrup = programeGrupate[selectedGroupName];
    return (
      <div className="px-4 pt-2 max-w-md mx-auto">
        <button onClick={() => setSelectedGroupName(null)} className="text-sm font-semibold mb-3" style={{ color: theme.accent }}>
          ‹ Înapoi la programe
        </button>
        <div className="space-y-3">
          {programeDinGrup.map((program) => (
            <button
              key={program.id}
              onClick={() => setSelectedProgram(program)}
              className="w-full text-left bg-white rounded-xl p-4 border shadow-sm flex items-center justify-between active:scale-95 transition"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <p className="font-bold" style={{ color: theme.text }}>{formatDate(program.data_eveniment)}</p>
              <ChevronRight size={20} style={{ color: theme.muted }} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Main view showing the list of program groups
  return (
    <div className="px-4 pt-2 max-w-md mx-auto">
      {groupNames.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl m-4" style={{ borderColor: theme.border }}>
            <Music size={32} className="mx-auto mb-2" style={{ color: theme.border }} />
            <p className="text-sm" style={{ color: theme.muted }}>Niciun program salvat.<br />Creează unul din secțiunea "Planificare".</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupNames.map((groupName) => (
            <button
              key={groupName}
              onClick={() => setSelectedGroupName(groupName)}
              className="w-full text-left bg-white rounded-xl p-4 border shadow-sm flex items-center justify-between active:scale-95 transition"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg" style={{ backgroundColor: theme.accent + '20' }}><Calendar size={16} style={{ color: theme.accent }} /></div>
                <p className="font-bold" style={{ color: theme.text }}>{groupName}</p>
              </div>
              <ChevronRight size={20} style={{ color: theme.muted }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
