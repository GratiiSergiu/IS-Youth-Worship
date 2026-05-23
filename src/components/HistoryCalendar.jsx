import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, TrendingUp, Clock, History, Trash2, CalendarDays, ChevronRight as ChevRight } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const MONTHS_RO = [
  'Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
  'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie',
];
const DAYS_SHORT = ['Lu','Ma','Mi','Jo','Vi','Sâ','Du'];

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function HistoryCalendar({ songs, istoricData, onDeleteProgram }) {
  const { theme } = useSettings();
  const today = new Date();

  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null); // { song, count, occurrences[] }
  const [period, setPeriod] = useState('30');

  // Map: dateStr → entries[]
  const historyByDate = useMemo(() => {
    const map = {};
    for (const entry of istoricData) {
      const d = entry.data_eveniment;
      if (!map[d]) map[d] = [];
      map[d].push(entry);
    }
    return map;
  }, [istoricData]);

  // Calendar grid (Monday-first)
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();
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

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    let fromDate;
    if (period === '30') {
      fromDate = new Date(now); fromDate.setDate(now.getDate() - 30);
    } else if (period === '90') {
      fromDate = new Date(now); fromDate.setDate(now.getDate() - 90);
    } else if (period === 'year') {
      fromDate = new Date(now.getFullYear(), 0, 1);
    } else {
      fromDate = new Date(0);
    }
    const fromStr = fromDate.toISOString().slice(0, 10);

    const counts = {};
    const occurrences = {}; // songId → [{ date, eventName }]
    for (const entry of istoricData) {
      if (entry.data_eveniment < fromStr) continue;
      for (const c of (entry.cantari ?? [])) {
        counts[c.songId] = (counts[c.songId] || 0) + 1;
        if (!occurrences[c.songId]) occurrences[c.songId] = [];
        occurrences[c.songId].push({ date: entry.data_eveniment, eventName: entry.nume_eveniment });
      }
    }
    // Sort occurrences newest first
    for (const id of Object.keys(occurrences)) {
      occurrences[id].sort((a, b) => b.date.localeCompare(a.date));
    }

    const top = [...songs]
      .filter(s => counts[s.id])
      .sort((a, b) => counts[b.id] - counts[a.id])
      .slice(0, 10)
      .map(s => ({ song: s, count: counts[s.id], occurrences: occurrences[s.id] ?? [] }));

    const rare = [...songs]
      .sort((a, b) => (counts[a.id] || 0) - (counts[b.id] || 0))
      .filter(s => !counts[s.id] || counts[s.id] <= 1)
      .slice(0, 10)
      .map(s => ({ song: s, count: counts[s.id] || 0 }));

    return { top, rare };
  }, [istoricData, songs, period]);

  return (
    <div className="pb-24 px-4 pt-2 max-w-md mx-auto">

      {/* Page header */}
      <div className="flex items-center gap-2 mb-4">
        <History size={20} style={{ color: theme.accent }} />
        <h2 className="text-xl font-bold" style={{ color: theme.text }}>Istoric & Statistici</h2>
      </div>

      {/* ── Calendar ── */}
      <div className="rounded-2xl p-4 border mb-4 shadow-lg" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>

        {/* Month navigation */}
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

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_SHORT.map(d => (
            <div key={d} className="text-center text-[11px] font-bold py-1 uppercase tracking-wide" style={{ color: theme.muted }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const dateStr   = toDateStr(viewYear, viewMonth, day);
            const hasEvents = !!historyByDate[dateStr];
            const isToday   = dateStr === todayStr;
            return (
              <button
                key={day}
                onClick={() => hasEvents && setSelectedDay({ date: dateStr, entries: historyByDate[dateStr] })}
                className="relative flex flex-col items-center justify-center h-9 rounded-xl transition-all"
                style={{
                  backgroundColor: isToday ? theme.accent + '30' : hasEvents ? theme.accent + '18' : 'transparent',
                  color:           isToday ? theme.accent : hasEvents ? theme.text : theme.muted,
                  fontWeight:      isToday || hasEvents ? '700' : '400',
                  cursor:          hasEvents ? 'pointer' : 'default',
                }}
              >
                <span className="text-sm leading-none">{day}</span>
                {hasEvents && (
                  <span
                    className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: theme.border }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: theme.accent }} />
          <span className="text-xs" style={{ color: theme.muted }}>Zi cu program salvat — apasă pentru detalii</span>
        </div>
      </div>

      {/* ── Statistics ── */}
      <div className="rounded-2xl p-4 border shadow-lg" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>

        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} style={{ color: theme.accent }} />
          <span className="font-bold text-base" style={{ color: theme.text }}>Statistici Repertoriu</span>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {[
            { v: '30',   l: '30 zile' },
            { v: '90',   l: '3 luni' },
            { v: 'year', l: 'Anul curent' },
            { v: 'all',  l: 'Tot timpul' },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setPeriod(v)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition"
              style={period === v
                ? { backgroundColor: theme.accent, color: theme.accentFg }
                : { backgroundColor: theme.bg, color: theme.muted, border: `1px solid ${theme.border}` }
              }
            >
              {l}
            </button>
          ))}
        </div>

        {istoricData.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: theme.muted }}>
              Niciun program salvat încă.<br />
              Salvează primul din tab-ul Planificare.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {/* Top repeated songs */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base leading-none">🔥</span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.muted }}>
                  Top Cântări Repetate
                </span>
              </div>
              {stats.top.length === 0 ? (
                <p className="text-xs px-1" style={{ color: theme.muted }}>Nicio cântare în această perioadă.</p>
              ) : (
                <div className="space-y-1.5">
                  {stats.top.map(({ song, count, occurrences }, i) => (
                    <button
                      key={song.id}
                      onClick={() => setSelectedSong({ song, count, occurrences })}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 active:scale-[0.98] transition-transform"
                      style={{ backgroundColor: theme.bg }}
                    >
                      <span className="text-xs font-mono font-bold w-5 text-right shrink-0" style={{ color: theme.muted }}>
                        {i + 1}.
                      </span>
                      <span className="flex-1 text-sm font-semibold truncate text-left" style={{ color: theme.text }}>
                        {song.titlu}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: '#4ade8025', color: '#4ade80' }}>
                        ×{count}
                      </span>
                      <ChevRight size={14} className="shrink-0" style={{ color: theme.muted }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rare / forgotten songs */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={14} style={{ color: '#fb923c' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.muted }}>
                  Cântări Rare / Uitate
                </span>
              </div>
              {stats.rare.length === 0 ? (
                <p className="text-xs px-1" style={{ color: theme.muted }}>
                  Toate cântările au fost cântate în această perioadă.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {stats.rare.map(({ song, count }) => (
                    <div key={song.id} className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: theme.bg }}>
                      <span className="flex-1 text-sm truncate" style={{ color: theme.muted }}>
                        {song.titlu}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: '#fb923c25', color: '#fb923c' }}>
                        {count === 0 ? 'niciodată' : `×${count}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ── Day detail bottom sheet ── */}
      {selectedDay && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={() => setSelectedDay(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full rounded-t-3xl shadow-2xl"
            style={{
              backgroundColor: theme.surface,
              borderTop: `2px solid ${theme.accent}`,
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1" style={{ flexShrink: 0 }}>
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: theme.border }} />
            </div>

            {/* Modal header */}
            <div className="flex items-start justify-between px-5 py-3"
              style={{ borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div>
                <p className="font-bold text-base capitalize" style={{ color: theme.text }}>
                  {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('ro-RO', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
                <p className="text-xs mt-0.5" style={{ color: theme.muted }}>
                  {selectedDay.entries.length === 1
                    ? '1 program salvat'
                    : `${selectedDay.entries.length} programe salvate`}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 rounded-xl mt-0.5"
                style={{ backgroundColor: theme.bg, color: theme.muted, flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div
              className="px-5 py-4 space-y-5"
              style={{ flex: '1 1 0', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
            >
              {selectedDay.entries.map((entry) => (
                <div key={entry.id}>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="font-bold text-sm" style={{ color: theme.accent }}>
                      {entry.nume_eveniment || 'Program'}
                    </p>
                    <button
                      onClick={async () => {
                        if (!window.confirm('Ștergi acest program din istoric?')) return;
                        await onDeleteProgram(entry.id);
                        const remaining = selectedDay.entries.filter(e => e.id !== entry.id);
                        if (remaining.length === 0) setSelectedDay(null);
                        else setSelectedDay({ ...selectedDay, entries: remaining });
                      }}
                      className="p-1.5 rounded-lg transition active:scale-90"
                      style={{ backgroundColor: '#450a0a', color: '#f87171' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(entry.cantari ?? []).map((c, ci) => (
                      <div key={ci} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ backgroundColor: theme.bg }}>
                        <span className="text-xs font-mono font-bold w-5 text-right" style={{ color: theme.muted, flexShrink: 0 }}>
                          {ci + 1}.
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg"
                          style={{ backgroundColor: theme.surface, color: theme.chord, flexShrink: 0 }}>
                          {c.selectedKey || c.originalKey}
                        </span>
                        <span className="text-sm font-semibold truncate" style={{ color: theme.text }}>
                          {c.titlu}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Song detail bottom sheet ── */}
      {selectedSong && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={() => setSelectedSong(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full rounded-t-3xl shadow-2xl"
            style={{
              backgroundColor: theme.surface,
              borderTop: `2px solid ${theme.accent}`,
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1" style={{ flexShrink: 0 }}>
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: theme.border }} />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-5 py-3"
              style={{ borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div className="min-w-0 pr-3" style={{ flex: 1 }}>
                <p className="font-bold text-base truncate" style={{ color: theme.text }}>
                  {selectedSong.song.titlu}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg"
                    style={{ backgroundColor: theme.bg, color: theme.chord }}>
                    {selectedSong.song.tonalitate}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#4ade8025', color: '#4ade80' }}>
                    cântată de {selectedSong.count} ori
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSong(null)}
                className="p-2 rounded-xl"
                style={{ backgroundColor: theme.bg, color: theme.muted, flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable occurrences */}
            <div
              className="px-5 py-4"
              style={{ flex: '1 1 0', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: theme.muted }}>
                Istoricul aparițiilor
              </p>
              <div className="space-y-2">
                {selectedSong.occurrences.map((occ, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3"
                    style={{ backgroundColor: theme.bg }}>
                    <CalendarDays size={15} style={{ color: theme.accent, flexShrink: 0 }} />
                    <div className="min-w-0" style={{ flex: 1 }}>
                      <p className="text-sm font-semibold capitalize" style={{ color: theme.text }}>
                        {new Date(occ.date + 'T12:00:00').toLocaleDateString('ro-RO', {
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                      {occ.eventName && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: theme.muted }}>
                          {occ.eventName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
