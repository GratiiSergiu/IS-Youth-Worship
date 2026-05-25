import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { ChevronRight, Music, Calendar, SlidersHorizontal, X } from 'lucide-react';
import SongViewer from './SongViewer';

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('ro-RO', options);
}

export default function Programe({ istoricData, songs, onUpdateSong }) {
  const { theme } = useSettings();
  const [selectedGroupName, setSelectedGroupName] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [viewingSong, setViewingSong] = useState(null);
  const [aranjamentSong, setAranjamentSong] = useState(null);

  const programeGrupate = istoricData
    .filter(p => !p.nume_eveniment?.toLowerCase().replace('ț','t').replace('ș','s').includes('repetitie'))
    .reduce((acc, program) => {
      const groupName = program.nume_eveniment;
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(program);
      acc[groupName].sort((a, b) => new Date(b.data_eveniment) - new Date(a.data_eveniment));
      return acc;
    }, {});

  const groupNames = Object.keys(programeGrupate);

  if (viewingSong) {
    const { song } = viewingSong;
    const masterSong = songs.find(s => s.id === song.songId);
    const changeKey = (newKey) => setViewingSong({ song: { ...song, selectedKey: newKey } });
    return (
      <SongViewer
        song={{ ...song, id: song.songId, versuri: masterSong?.versuri ?? '' }}
        onClose={() => setViewingSong(null)}
        onKeyChange={changeKey}
        onUpdate={onUpdateSong}
      />
    );
  }

  if (selectedProgram) {
    return (
      <div className="px-4 pt-2 max-w-md mx-auto">
        <button onClick={() => setSelectedProgram(null)} className="text-sm font-semibold mb-3" style={{ color: theme.accent }}>
          ‹ Înapoi la date
        </button>
        <div className="space-y-2.5">
          {selectedProgram.cantari.map((item, index) => {
            const hasAranjament = item.aranjament && Object.values(item.aranjament).some(v => v?.trim?.());
            return (
              <div key={index} className="rounded-xl p-3 border shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-base shrink-0" style={{ backgroundColor: theme.bg, color: theme.chord }}>
                    {item.selectedKey}
                  </span>
                  <button className="flex-1 min-w-0 text-left" onClick={() => setViewingSong({ song: item })}>
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold truncate" style={{ color: theme.text }}>{item.titlu}</h3>
                      <ChevronRight size={14} className="shrink-0" style={{ color: theme.muted }} />
                    </div>
                  </button>
                  <button
                    onClick={() => setAranjamentSong(item)}
                    className="p-1.5 rounded-lg shrink-0"
                    style={{
                      backgroundColor: hasAranjament ? theme.accent + '22' : theme.bg,
                      color: hasAranjament ? theme.accent : theme.muted,
                    }}
                  >
                    <SlidersHorizontal size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aranjament modal */}
        {aranjamentSong && (
          <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} onClick={() => setAranjamentSong(null)}>
            <div
              className="w-full rounded-t-3xl max-h-[85vh] flex flex-col"
              style={{ backgroundColor: theme.surface, borderTop: `2px solid ${theme.accent}` }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: theme.border }} />
              </div>
              <div className="flex items-start justify-between px-5 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
                <div>
                  <p className="font-bold text-base" style={{ color: theme.text }}>Aranjament</p>
                  <p className="text-xs mt-0.5" style={{ color: theme.muted }}>{aranjamentSong.titlu}</p>
                </div>
                <button onClick={() => setAranjamentSong(null)} className="p-2 rounded-xl" style={{ color: theme.muted }}><X size={18} /></button>
              </div>
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                {aranjamentSong.aranjament?.voceaLead ? (
                  <AranjamentField label="Voce Lead" value={aranjamentSong.aranjament.voceaLead} theme={theme} />
                ) : null}
                {aranjamentSong.aranjament?.tempo ? (
                  <AranjamentField label="Tempo / Ritm" value={aranjamentSong.aranjament.tempo} theme={theme} />
                ) : null}
                {aranjamentSong.aranjament?.structura ? (
                  <AranjamentField label="Structură / Ordine" value={aranjamentSong.aranjament.structura} theme={theme} multiline />
                ) : null}
                {aranjamentSong.aranjament?.notite ? (
                  <AranjamentField label="Notițe" value={aranjamentSong.aranjament.notite} theme={theme} multiline />
                ) : null}
                {!aranjamentSong.aranjament || !Object.values(aranjamentSong.aranjament).some(v => v?.trim?.()) ? (
                  <p className="text-sm text-center py-6" style={{ color: theme.muted }}>Niciun aranjament salvat pentru această cântare.</p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedGroupName) {
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
              className="w-full text-left rounded-xl p-4 border shadow-sm flex items-center justify-between active:scale-95 transition"
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
              className="w-full text-left rounded-xl p-4 border shadow-sm flex items-center justify-between active:scale-95 transition"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: theme.accent + '20' }}>
                  <Calendar size={16} style={{ color: theme.accent }} />
                </div>
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

function AranjamentField({ label, value, theme, multiline }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase mb-1" style={{ color: theme.muted }}>{label}</p>
      <p className="text-sm rounded-lg px-3 py-2 whitespace-pre-wrap" style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}>
        {value}
      </p>
    </div>
  );
}
