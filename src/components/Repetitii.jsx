import { useState } from 'react';
import { Calendar, Plus, X, Users, Trash2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import RepetitiiCalendar from './RepetitiiCalendar';

export default function Repetitii({ repetitii, membri, onUpdate }) {
  const { theme } = useSettings();
  const [selectedDate, setSelectedDate] = useState(null);

  const addRepetitie = (date) => {
    const newRepetitie = {
      id: String(Date.now()),
      date: date,
      prezenti: [],
    };
    onUpdate([newRepetitie, ...repetitii]);
    setSelectedDate(date);
  };

  const deleteRepetitie = (date) => {
    onUpdate(repetitii.filter(r => r.date !== date));
    setSelectedDate(null);
  };

  const togglePrezenta = (repetitieId, membruId) => {
    const updatedRepetitii = repetitii.map(r => {
      if (r.id === repetitieId) {
        const prezenti = r.prezenti.includes(membruId)
          ? r.prezenti.filter(id => id !== membruId)
          : [...r.prezenti, membruId];
        return { ...r, prezenti };
      }
      return r;
    });
    onUpdate(updatedRepetitii);
  };

  const selectedRepetitie = repetitii.find(r => r.date === selectedDate);

  return (
    <div className="space-y-4">
      <RepetitiiCalendar repetitii={repetitii} onSelectDate={setSelectedDate} />

      {selectedDate && (
        <div className="p-3 rounded-xl" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} style={{ color: theme.muted }} />
              <p className="font-bold" style={{ color: theme.text }}>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {selectedRepetitie && (
              <button onClick={() => deleteRepetitie(selectedDate)} style={{ color: theme.muted }}><Trash2 size={16} /></button>
            )}
          </div>

          {selectedRepetitie ? (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase" style={{ color: theme.muted }}>Participanti:</h4>
              {membri.map(membru => (
                <div key={membru.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: theme.bg }}>
                    <p className="text-sm font-semibold" style={{ color: theme.text }}>{membru.nume}</p>
                    <input
                      type="checkbox"
                      checked={selectedRepetitie.prezenti.includes(membru.id)}
                      onChange={() => togglePrezenta(selectedRepetitie.id, membru.id)}
                      className="h-5 w-5 rounded-md accent-teal-500"
                    />
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2">
                  <Users size={16} style={{ color: theme.muted }} />
                  <p className="text-sm" style={{ color: theme.muted }}>{selectedRepetitie.prezenti.length} / {membri.length} participanti</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => addRepetitie(selectedDate)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition"
              style={{ backgroundColor: theme.accent, color: theme.accentFg }}
            >
              <Plus size={16} /> Adaugă repetiție
            </button>
          )}
        </div>
      )}
    </div>
  );
}
