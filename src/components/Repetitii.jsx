import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Check, ChevronRight, Users, X } from 'lucide-react';

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('ro-RO', options);
}

export default function Repetitii({ istoricData, onUpdateProgram, onUpdateIstoric, membri }) {
  const { theme } = useSettings();
  const [selectedRep, setSelectedRep] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const repetitii = istoricData.filter(p => p.nume_eveniment?.toLowerCase().includes('repetitie'));

  const updatePrezenta = (repetitieId, membruId) => {
    const rep = repetitii.find(r => r.id === repetitieId);
    if (!rep) return;

    const prezenta = rep.prezenta ?? [];
    const newPrezenta = prezenta.includes(membruId)
      ? prezenta.filter(id => id !== membruId)
      : [...prezenta, membruId];

    const updatedRep = { ...rep, prezenta: newPrezenta };

    // Optimistically update local state for instant UI feedback
    const updatedIstoric = istoricData.map(item => item.id === repetitieId ? updatedRep : item);
    onUpdateIstoric(updatedIstoric);

    // Persist the change to Supabase
    onUpdateProgram(updatedRep);
  };
  
  const getStats = () => {
      if (!membri || membri.length === 0) return [];

      const stats = membri.map(membru => {
          const totalRepetitii = repetitii.length;
          const prezente = repetitii.filter(r => r.prezenta?.includes(membru.id)).length;
          const absente = totalRepetitii - prezente;
          const procentaj = totalRepetitii > 0 ? Math.round((prezente / totalRepetitii) * 100) : 0;

          return {
              ...membru,
              prezente,
              absente,
              procentaj
          };
      });

      return stats.sort((a, b) => b.procentaj - a.procentaj);
  };

  const stats = getStats();

  if (showStats) {
    return (
      <div className="px-4 pt-2 max-w-md mx-auto">
        <button onClick={() => setShowStats(false)} className="text-sm font-semibold mb-3" style={{ color: theme.accent }}>
          ‹ Înapoi la repetiții
        </button>
        <h2 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Statistici Prezență</h2>
        <div className="space-y-2">
          {stats.map(membru => (
            <div key={membru.id} className="rounded-xl p-3 border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <div className="flex items-center justify-between">
                <p className="font-bold" style={{ color: theme.text }}>{membru.nume}</p>
                <span className="font-bold text-sm" style={{ color: theme.accent }}>{membru.procentaj}%</span>
              </div>
              <div className="text-xs mt-1" style={{ color: theme.muted }}>
                <span>Prezent: {membru.prezente}</span>
                <span className="mx-2">|</span>
                <span>Absent: {membru.absente}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (selectedRep) {
    const prezenta = selectedRep.prezenta ?? [];
    return (
      <div className="px-4 pt-2 max-w-md mx-auto">
        <button onClick={() => setSelectedRep(null)} className="text-sm font-semibold mb-3" style={{ color: theme.accent }}>
          ‹ Înapoi la listă
        </button>
        <h3 className="font-bold mb-2" style={{ color: theme.text }}>Pontaj Prezență</h3>
        <div className="space-y-2 mb-6">
          {membri.map(membru => (
            <label key={membru.id} 
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"
              style={{ backgroundColor: prezenta.includes(membru.id) ? theme.accent + '20' : theme.bg, border: `1px solid ${prezenta.includes(membru.id) ? theme.accent + '40' : theme.border}`}}
              onClick={() => updatePrezenta(selectedRep.id, membru.id)}
            >
              <div className="w-5 h-5 rounded-md border flex items-center justify-center transition"
                style={{ borderColor: prezenta.includes(membru.id) ? theme.accent : theme.muted, backgroundColor: prezenta.includes(membru.id) ? theme.accent : 'transparent' }}
              >
                {prezenta.includes(membru.id) && <Check size={14} color={theme.accentFg} />}
              </div>
              <span className="text-sm font-medium" style={{ color: theme.text }}>{membru.nume}</span>
            </label>
          ))}
        </div>
        <h3 className="font-bold mb-3 mt-4" style={{ color: theme.text }}>Cântări Repetiție</h3>
        <div className="space-y-2.5">
          {selectedRep.cantari.map((item, index) => (
              <div key={index} className="rounded-xl p-3 border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-base shrink-0" style={{ backgroundColor: theme.bg, color: theme.chord }}>
                          {item.selectedKey}
                      </span>
                      <h3 className="font-bold truncate" style={{ color: theme.text }}>{item.titlu}</h3>
                  </div>
              </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 max-w-md mx-auto">
      <button 
        onClick={() => setShowStats(true)}
        className="w-full flex items-center justify-between p-4 rounded-xl border mb-4 shadow-sm"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-200 rounded-lg" style={{ backgroundColor: theme.accent + '20'}}><Users size={16} style={{ color: theme.accent }} /></div>
          <p className="font-bold" style={{ color: theme.text }}>Statistici Prezență</p>
        </div>
        <ChevronRight size={20} style={{ color: theme.muted }} />
      </button>

      {repetitii.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl m-4" style={{ borderColor: theme.border }}>
            <p className="text-sm" style={{ color: theme.muted }}>Nicio repetiție salvată.<br/>Asigură-te că evenimentele conțin cuvântul "Repetiție".</p>
        </div>
      ) : (
        <div className="space-y-3">
          {repetitii.map((rep) => (
            <button
              key={rep.id}
              onClick={() => setSelectedRep(rep)}
              className="w-full text-left bg-white rounded-xl p-4 border shadow-sm flex items-center justify-between active:scale-95 transition"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <div>
                <p className="font-bold" style={{ color: theme.text }}>{rep.nume_eveniment}</p>
                <p className="text-sm mt-1" style={{ color: theme.muted }}>{formatDate(rep.data_eveniment)}</p>
              </div>
              <ChevronRight size={20} style={{ color: theme.muted }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
