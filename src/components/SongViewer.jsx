import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Music2, FileText, Pencil, Check, X } from 'lucide-react';
import { getSemitonesBetween, transposeLyrics, renderLyrics } from '../utils/chords';
import { useSettings } from '../contexts/SettingsContext';

// 12 tonalități cromatice — fiecare aparte
const KEYS = [
  { k: 'C',  label: 'C'  },
  { k: 'C#', label: 'C#' },
  { k: 'D',  label: 'D'  },
  { k: 'D#', label: 'D#' },
  { k: 'E',  label: 'E'  },
  { k: 'F',  label: 'F'  },
  { k: 'F#', label: 'F#' },
  { k: 'G',  label: 'G'  },
  { k: 'G#', label: 'G#' },
  { k: 'A',  label: 'A'  },
  { k: 'A#', label: 'A#' },
  { k: 'B',  label: 'B'  },
];
const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

function detectKey(versuri) {
  const m = versuri.match(/\[([A-G][#b]?)/);
  if (!m) return 'C';
  return FLAT_TO_SHARP[m[1]] || m[1];
}

// Returns the quality suffix of the first chord (m, dim, aug) — empty for major
function detectKeyQuality(versuri) {
  const m = versuri.match(/\[[A-G][#b]?([a-z]*)/);
  if (!m || !m[1]) return '';
  const q = m[1];
  if (q === 'dim') return 'dim';
  if (q === 'aug') return 'aug';
  if (q.startsWith('m') && !q.startsWith('maj')) return 'm';
  return '';
}

function buildChordRow(parts) {
  let row = '', textPos = 0;
  for (const p of parts) {
    if (p.type === 'text') {
      textPos += p.content.length;
    } else {
      row += ' '.repeat(Math.max(0, textPos - row.length)) + p.content;
    }
  }
  return row;
}

function buildLyricRow(parts) {
  return parts.filter((p) => p.type === 'text').map((p) => p.content).join('');
}

// Split rendered lines into sections (groups separated by empty lines)
function splitIntoSections(lines) {
  const sections = [];
  let current = [];
  for (const line of lines) {
    if (line.parts.length === 0) {
      if (current.length > 0) { sections.push(current); current = []; }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) sections.push(current);
  return sections;
}

export default function SongViewer({ song, onClose, onNext, onPrev, hasNext, hasPrev, onKeyChange, onUpdate }) {
  const { theme, font, size, settings } = useSettings();
  const [showChords, setShowChords] = useState(true);
  const [currentKey, setCurrentKey] = useState(song.selectedKey || song.originalKey || 'C');
  const [showKeyPicker, setShowKeyPicker] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ titlu: song.titlu, autor: song.autor, versuri: song.versuri });
  const [pageIndex, setPageIndex] = useState(0);

  const originalKey = song.originalKey || currentKey;
  const keyQuality = useMemo(() => detectKeyQuality(song.versuri), [song.versuri]);
  const semitones = getSemitonesBetween(originalKey, currentKey);
  const transposed = transposeLyrics(editForm.versuri, semitones, currentKey);
  const lines = renderLyrics(transposed);
  const sections = useMemo(() => splitIntoSections(lines), [lines]);
  const isPaged = settings.layout === 'paged';

  const handleKeySelect = (key) => {
    setCurrentKey(key);
    setShowKeyPicker(false);
    onKeyChange?.(key);
  };

  const handleSave = () => {
    const newKey = detectKey(editForm.versuri);
    onUpdate?.({ ...song, titlu: editForm.titlu.trim(), autor: editForm.autor.trim(), versuri: editForm.versuri, tonalitate: newKey, originalKey: newKey });
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditForm({ titlu: song.titlu, autor: song.autor, versuri: song.versuri });
    setEditMode(false);
  };

  const fontStyle = { fontFamily: font.css };
  const lyricStyle = { ...fontStyle, fontSize: size.lyric, color: theme.text };
  const chordStyle = { ...fontStyle, fontSize: size.chord, color: theme.chord };

  function renderLines(linesToRender) {
    return linesToRender.map((line) => {
      const hasChords = line.parts.some((p) => p.type === 'chord');
      const lyricRow = buildLyricRow(line.parts);
      if (!hasChords || !showChords) {
        return <div key={line.lineIndex} style={lyricStyle} className="leading-snug">{lyricRow || ' '}</div>;
      }
      return (
        <div key={line.lineIndex} className="mb-1">
          <div style={{ ...chordStyle, fontWeight: 700 }} className="leading-tight whitespace-pre">{buildChordRow(line.parts)}</div>
          <div style={lyricStyle} className="leading-snug">{lyricRow || ' '}</div>
        </div>
      );
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col anim-slide-right" style={{ backgroundColor: theme.bg }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
        <button onClick={editMode ? handleCancelEdit : onClose} className="p-2 -ml-2 active:opacity-60 transition"
          style={{ color: theme.text }}>
          {editMode ? <X size={24} /> : <ArrowLeft size={24} />}
        </button>

        <div className="text-center min-w-0 px-2 flex-1">
          {editMode ? (
            <input
              className="w-full rounded-lg px-3 py-1.5 text-sm font-bold text-center focus:outline-none"
              style={{ backgroundColor: theme.surface, color: theme.text, border: `1px solid ${theme.border}` }}
              value={editForm.titlu}
              onChange={(e) => setEditForm((f) => ({ ...f, titlu: e.target.value }))}
            />
          ) : (
            <>
              <h2 className="font-bold text-sm truncate" style={{ color: theme.text }}>{song.titlu}</h2>
              <div className="relative inline-block">
                <button onClick={() => setShowKeyPicker((v) => !v)}
                  className="mt-0.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition active:scale-95"
                  style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
                  <span className="font-mono text-xs font-bold" style={{ color: theme.accent }}>{currentKey}{keyQuality}</span>
                  {semitones !== 0 && <span className="text-[10px]" style={{ color: theme.muted }}>din {originalKey}{keyQuality}</span>}
                  <span className="text-[9px]" style={{ color: theme.muted }}>{showKeyPicker ? '▲' : '▼'}</span>
                </button>

                {showKeyPicker && (
                  <>
                    <div className="fixed inset-0" style={{ zIndex: 55 }} onClick={() => setShowKeyPicker(false)} />
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 rounded-2xl border shadow-2xl p-3"
                      style={{ top: '100%', zIndex: 60, backgroundColor: theme.surface, borderColor: theme.border, width: '220px' }}>
                      <div className="grid grid-cols-3 gap-2">
                        {KEYS.map(({ k, label }) => (
                          <button key={k} onClick={() => handleKeySelect(k)}
                            className="py-2.5 rounded-xl font-mono font-bold text-sm transition active:scale-95"
                            style={k === currentKey
                              ? { backgroundColor: theme.accent, color: theme.accentFg }
                              : { backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {editMode ? (
            <button onClick={handleSave} className="p-2 active:opacity-60" style={{ color: theme.accent }}>
              <Check size={22} />
            </button>
          ) : (
            <>
              <button onClick={() => setShowChords((v) => !v)} className="p-2 rounded-lg transition"
                style={{ color: showChords ? theme.accent : theme.muted }}>
                {showChords ? <Music2 size={20} /> : <FileText size={20} />}
              </button>
              {onUpdate && (
                <button onClick={() => setEditMode(true)} className="p-2 transition" style={{ color: theme.muted }}>
                  <Pencil size={18} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Body */}
      {editMode ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <input
            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            style={{ backgroundColor: theme.surface, color: theme.text, border: `1px solid ${theme.border}` }}
            value={editForm.autor}
            onChange={(e) => setEditForm((f) => ({ ...f, autor: e.target.value }))}
            placeholder="Autor"
          />
          <textarea
            className="w-full rounded-xl px-3 py-2.5 text-sm leading-relaxed focus:outline-none"
            style={{ backgroundColor: theme.surface, color: theme.text, border: `1px solid ${theme.border}`, fontFamily: font.css }}
            rows={20}
            value={editForm.versuri}
            onChange={(e) => setEditForm((f) => ({ ...f, versuri: e.target.value }))}
            placeholder="Versuri cu acorduri [G] ..."
          />
          <button onClick={handleSave}
            className="w-full font-bold py-3 rounded-xl active:scale-95 transition"
            style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
            Salvează modificările
          </button>
        </div>
      ) : isPaged ? (
        /* ── Paginat ── */
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden px-5 py-6 flex flex-col justify-center">
            <div>{renderLines(sections[pageIndex] ?? [])}</div>
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-t"
            style={{ borderColor: theme.border }}>
            <button onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              disabled={pageIndex === 0}
              className="flex items-center gap-1 text-sm font-medium transition disabled:opacity-30"
              style={{ color: theme.text }}>
              <ChevronLeft size={20} /> Înapoi
            </button>
            <span className="text-xs" style={{ color: theme.muted }}>
              {pageIndex + 1} / {sections.length}
            </span>
            <button onClick={() => setPageIndex((i) => Math.min(sections.length - 1, i + 1))}
              disabled={pageIndex === sections.length - 1}
              className="flex items-center gap-1 text-sm font-medium transition disabled:opacity-30"
              style={{ color: theme.text }}>
              Înainte <ChevronRight size={20} />
            </button>
          </div>
        </div>
      ) : (
        /* ── Continuu ── */
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div>
            {lines.map((line) => {
              if (line.parts.length === 0) return <div key={line.lineIndex} className="h-5" />;
              return renderLines([line]);
            })}
          </div>
        </div>
      )}

      {/* Footer nav (scroll mode) */}
      {!editMode && !isPaged && (
        <div className="flex justify-between items-center px-4 py-3 border-t shrink-0"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
          <button onClick={onPrev} disabled={!hasPrev}
            className="flex items-center gap-1 text-sm font-medium transition disabled:opacity-30"
            style={{ color: theme.text }}>
            <ChevronLeft size={20} /> Anterior
          </button>
          <span className="text-xs truncate max-w-[120px]" style={{ color: theme.muted }}>{song.autor}</span>
          <button onClick={onNext} disabled={!hasNext}
            className="flex items-center gap-1 text-sm font-medium transition disabled:opacity-30"
            style={{ color: theme.text }}>
            Următor <ChevronRight size={20} />
          </button>
        </div>
      )}

    </div>
  );
}
