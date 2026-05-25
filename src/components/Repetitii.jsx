import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, Users, CalendarDays, Plus, ArrowLeft, ChevronRight as ChevronRightIcon, ChevronDown } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const MONTHS_RO = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
const DAYS_SHORT = ['Lu','Ma','Mi','Jo','Vi','Sâ','Du'];

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDate(dateString, options = {}) {
  const defaultOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString + 'T12:00:00').toLocaleDateString('ro-RO', { ...defaultOptions, ...options });
}

// --- Main Component ---
export default function Repetitii({ istoricData, onUpdateIstoric, membri }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [istoricOpen, setIstoricOpen] = useState(false);
  const [statisticiOpen, setStatisticiOpen] = useState(false);

  const repetitii = useMemo(() => {
      return istoricData
          .filter(p => p.nume_eveniment?.toLowerCase().replace('ț','t').replace('ș','s').includes('repetitie'))
          .sort((a,b) => new Date(b.data_eveniment) - new Date(a.data_eveniment));
  }, [istoricData]);
  
  const repetitiiByDate = useMemo(() => {
    const map = {};
    for (const entry of repetitii) {
      map[entry.data_eveniment] = entry;
    }
    return map;
  }, [repetitii]);

  const handleSelectDate = (date) => setSelectedDate(date);
  const handleBack = () => setSelectedDate(null);

  const addRepetitie = (dateStr) => {
    const newRepetitie = {
      id: crypto.randomUUID(),
      nume_eveniment: 'Repetitie',
      data_eveniment: dateStr,
      cantari: [],
      prezenta: []
    };
    onUpdateIstoric([...istoricData, newRepetitie]);
    handleSelectDate(dateStr); // Open pontaj for the new repetition
  };

  if (selectedDate) {
    return <PontajView 
      onBack={handleBack}
      date={selectedDate}
      repetitiiByDate={repetitiiByDate}
      membri={membri}
      istoricData={istoricData}
      onUpdateIstoric={onUpdateIstoric} 
      onAddRepetitie={addRepetitie}
    />;
  }

  return (
    <div className="px-4 pt-3 pb-24 anim-page">
      <CalendarView
        repetitiiByDate={repetitiiByDate}
        onSelectDate={handleSelectDate}
      />
      <CollapsibleSection
        icon={<CalendarDays size={18} />}
        title="Istoric Repetiții"
        count={repetitii.length}
        open={istoricOpen}
        onToggle={() => setIstoricOpen(o => !o)}
      >
        <IstoricListView repetitii={repetitii} onSelectDate={handleSelectDate} />
      </CollapsibleSection>
      <CollapsibleSection
        icon={<Users size={18} />}
        title="Statistică Prezență"
        open={statisticiOpen}
        onToggle={() => setStatisticiOpen(o => !o)}
      >
        <StatisticiListView repetitii={repetitii} membri={membri} />
      </CollapsibleSection>
    </div>
  );
}

// --- Collapsible Section ---
function CollapsibleSection({ icon, title, count, open, onToggle, children }) {
  const { theme } = useSettings();
  return (
    <div className="mt-4 rounded-2xl border overflow-hidden" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 font-bold text-base" style={{ color: theme.text }}>
          <span style={{ color: theme.accent }}>{icon}</span>
          {title}
          {count > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.accent + '25', color: theme.accent }}>
              {count}
            </span>
          )}
        </span>
        <ChevronDown size={18} style={{ color: theme.muted, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: theme.border }}>
          {children}
        </div>
      )}
    </div>
  );
}

// --- Calendar View ---
function CalendarView({ repetitiiByDate, onSelectDate }) {
  const { theme } = useSettings();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="rounded-2xl p-4 border shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-xl active:scale-90 transition" style={{ backgroundColor: theme.bg, color: theme.muted }}><ChevronLeft size={18} /></button>
            <span className="font-bold text-base" style={{ color: theme.text }}>{MONTHS_RO[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="p-2 rounded-xl active:scale-90 transition" style={{ backgroundColor: theme.bg, color: theme.muted }}><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 mb-1">
            {DAYS_SHORT.map(d => <div key={d} className="text-center text-[11px] font-bold py-1 uppercase tracking-wide" style={{ color: theme.muted }}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const dateStr = toDateStr(viewYear, viewMonth, day);
                const hasRep = !!repetitiiByDate[dateStr];
                const isToday = dateStr === todayStr;
                return (
                    <button key={day} onClick={() => onSelectDate(dateStr)}
                        className="relative flex flex-col items-center justify-center h-9 rounded-xl transition-all"
                        style={{
                            backgroundColor: isToday ? theme.accent + '30' : 'transparent',
                            color: isToday ? theme.accent : theme.text,
                            fontWeight: isToday || hasRep ? '700' : '400',
                        }}>
                        <span className="text-sm leading-none">{day}</span>
                        {hasRep && (<span className="absolute bottom-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accent }}/>)}
                    </button>
                );
            })}
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: theme.border }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: theme.accent }} />
            <span className="text-xs" style={{ color: theme.muted }}>Apasă pe o zi pentru a crea o repetiție sau a edita prezența.</span>
        </div>
    </div>
  );
}

// --- Istoric List View ---
function IstoricListView({ repetitii, onSelectDate }) {
    const { theme } = useSettings();
    if (repetitii.length === 0) {
        return (
            <div className="text-center py-8 border-2 border-dashed rounded-2xl" style={{ borderColor: theme.border }}>
                <p className="text-sm" style={{ color: theme.muted }}>Nicio repetiție salvată.</p>
            </div>
        )
    }
    return (
        <div className="space-y-2.5">
            {repetitii.map(rep => (
                <button 
                    key={rep.id} 
                    onClick={() => onSelectDate(rep.data_eveniment)}
                    className="w-full text-left flex items-center justify-between p-4 rounded-xl border shadow-sm active:scale-95 transition"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    >
                    <p className="font-bold" style={{ color: theme.text }}>{formatDate(rep.data_eveniment, { weekday: 'short', day: 'numeric', month: 'long' })}</p>
                    <ChevronRightIcon size={20} style={{ color: theme.muted }} />
                </button>
            ))}
        </div>
    )
}

// --- Statistici List View ---
function StatisticiListView({ repetitii, membri }) {
    const { theme } = useSettings();
    const stats = useMemo(() => {
        if (!membri || membri.length === 0) return [];
        const totalRepetitii = repetitii.length;
        const statsData = membri.map(membru => {
            if (totalRepetitii === 0) return { ...membru, prezente: 0, absente: 0, procentaj: 0 };
            const prezente = repetitii.filter(r => r.prezenta?.includes(membru.id)).length;
            const absente = totalRepetitii - prezente;
            const procentaj = Math.round((prezente / totalRepetitii) * 100);
            return { ...membru, prezente, absente, procentaj };
        });
        return statsData.sort((a, b) => b.procentaj - a.procentaj);
    }, [repetitii, membri]);

    if (stats.length === 0) {
        return (
             <div className="text-center py-8 border-2 border-dashed rounded-2xl" style={{ borderColor: theme.border }}>
                  <p className="text-sm" style={{ color: theme.muted }}>Nu există membri sau repetiții.</p>
            </div>
        )
    }

    return (
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
    );
}

// --- Pontaj View ---
function PontajView({ onBack, date, repetitiiByDate, membri, istoricData, onUpdateIstoric, onAddRepetitie }) {
    const { theme } = useSettings();
    const rep = repetitiiByDate[date];
    const prezenta = rep?.prezenta ?? [];

    const updatePrezenta = (membruId) => {
        if (!rep) return;
        const newPrezenta = prezenta.includes(membruId)
            ? prezenta.filter(id => id !== membruId)
            : [...prezenta, membruId];
        const updatedRep = { ...rep, prezenta: newPrezenta };
        onUpdateIstoric(istoricData.map(item => item.id === updatedRep.id ? updatedRep : item));
    };

    return (
        <div className="px-4 pt-3 pb-24 anim-page">
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold mb-3" style={{ color: theme.accent }}>
                <ArrowLeft size={16} /> Înapoi
            </button>
            <p className="font-bold text-xl mb-1" style={{color: theme.text}}>{formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="text-sm mb-4" style={{color: theme.muted}}>{rep ? "Bifează membrii prezenți la repetiție." : "Nu există o repetiție pentru această zi."}</p>

            {!rep ? (
               <button onClick={() => onAddRepetitie(date)}
                className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl active:scale-95 transition"
                style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
                <Plus size={16} /> Creează repetiție
              </button>
            ) : (
              membri.length > 0 ? (
                <div className="space-y-2">
                    {membri.map(membru => (
                    <label key={membru.id} 
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"
                        style={{ backgroundColor: prezenta.includes(membru.id) ? theme.accent + '20' : theme.bg, border: `1px solid ${prezenta.includes(membru.id) ? theme.accent + '40' : theme.border}`}}
                        onClick={() => updatePrezenta(membru.id)}
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
               ) : (
                  <div className="text-center py-10 border-2 border-dashed rounded-2xl mt-4" style={{ borderColor: theme.border }}>
                      <p className="text-sm" style={{ color: theme.muted }}>Nu sunt membri adăugați în echipă.</p>
                  </div>
               )
            )}
        </div>
    );
}