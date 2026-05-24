import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const MONTHS_RO = [
  'Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
  'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie',
];
const DAYS_SHORT = ['Lu','Ma','Mi','Jo','Vi','Sâ','Du'];

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function RepetitiiCalendar({ repetitii, onSelectDate }) {
  const { theme } = useSettings();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const repetitiiByDate = useMemo(() => {
    const map = {};
    for (const entry of repetitii) {
      const d = entry.date;
      if (!map[d]) map[d] = [];
      map[d].push(entry);
    }
    return map;
  }, [repetitii]);

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
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl active:scale-90 transition"
          style={{ backgroundColor: theme.bg, color: theme.muted }}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-bold text-base" style={{ color: theme.text }}>
          {MONTHS_RO[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl active:scale-90 transition"
          style={{ backgroundColor: theme.bg, color: theme.muted }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[11px] font-bold py-1 uppercase tracking-wide" style={{ color: theme.muted }}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = toDateStr(viewYear, viewMonth, day);
          const hasRepetitii = !!repetitiiByDate[dateStr];
          const isToday = dateStr === todayStr;

          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateStr)}
              className="relative flex flex-col items-center justify-center h-9 rounded-xl transition-all"
              style={{
                backgroundColor: isToday ? theme.accent + '30' : 'transparent',
                color: isToday ? theme.accent : theme.text,
                fontWeight: isToday || hasRepetitii ? '700' : '400',
              }}
            >
              <span className="text-sm leading-none">{day}</span>
              {hasRepetitii && (
                <span
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
