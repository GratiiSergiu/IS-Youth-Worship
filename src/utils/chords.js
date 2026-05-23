const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const FLAT_TO_SHARP = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'db': 'C#', 'eb': 'D#', 'gb': 'F#', 'ab': 'G#', 'bb': 'A#',
};

const SHARP_TO_FLAT = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

// Keys that conventionally use flat notation
const FLAT_KEY_SET = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'A#', 'D#', 'G#', 'C#']);

// Matches a single chord token (C, Gm, Bb, F#m7, Csus4, G/D, etc.)
const CHORD_TOKEN_RE = /^[A-G][b#]?(m(aj7?|in7?)?|dim7?|aug|sus[24]?|add[2469]?|M7?|[0-9]+)*(\/[A-G][b#]?)?$/;

function isChordToken(t) {
  return CHORD_TOKEN_RE.test(t);
}

function isChordOnlyLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return trimmed.split(/\s+/).every(isChordToken);
}

// Build parts by mapping chord column positions onto the lyric string.
// The chord row positions are used as lyric character offsets so that
// buildChordRow() will reproduce the original horizontal alignment.
function buildPartsFromChordAboveLyric(chordLine, lyricLine) {
  const entries = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(chordLine)) !== null) {
    entries.push({ chord: m[0], pos: m.index });
  }
  if (!entries.length) return [];

  const parts = [];
  let lastPos = 0;

  for (const { chord, pos } of entries) {
    if (pos > lastPos) {
      const slice = lyricLine.slice(lastPos, pos);
      if (slice) parts.push({ type: 'text', content: slice });
      lastPos = pos;
    }
    parts.push({ type: 'chord', content: chord });
  }

  const remaining = lyricLine.slice(lastPos);
  if (remaining) parts.push({ type: 'text', content: remaining });

  return parts;
}

export function normalizeNote(note) {
  if (!note) return 'C';
  const base = note.charAt(0).toUpperCase() + note.slice(1);
  return FLAT_TO_SHARP[base] || base;
}

export function getNoteIndex(note) {
  const normalized = normalizeNote(note);
  const idx = NOTES.indexOf(normalized);
  return idx === -1 ? 0 : idx;
}

export function transposeChord(chord, semitones, useFlats = false) {
  const match = chord.match(/^([A-Ga-g])([#b♭]?)(.*)$/);
  if (!match) return chord;
  let [, root, accidental, suffix] = match;
  const original = root.toUpperCase() + (accidental || '');
  const normalized = normalizeNote(original);
  const index = NOTES.indexOf(normalized);
  if (index === -1) return chord;
  const newIndex = (index + semitones + 12) % 12;
  const newNote = NOTES[newIndex];
  const display = useFlats && SHARP_TO_FLAT[newNote] ? SHARP_TO_FLAT[newNote] : newNote;
  return display + suffix;
}

export function transposeLyrics(lyrics, semitones, targetKey = '') {
  if (semitones === 0) return lyrics;
  const useFlats = FLAT_KEY_SET.has(normalizeNote(targetKey)) || targetKey.includes('b');
  return lyrics.split('\n').map(line => {
    // Bracket format: [G], [Am], etc.
    if (line.includes('[')) {
      return line.replace(/\[([^\]]+)\]/g, (_, chord) =>
        '[' + transposeChord(chord, semitones, useFlats) + ']'
      );
    }
    // Plain chord-above-lyric line: transpose every chord token individually
    if (isChordOnlyLine(line)) {
      return line.replace(/\S+/g, token =>
        isChordToken(token) ? transposeChord(token, semitones, useFlats) : token
      );
    }
    return line;
  }).join('\n');
}

export function renderLyrics(lyrics) {
  const rawLines = lyrics.split('\n');
  const result = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];

    // Detect plain "chords above lyrics" format: a line with only chord tokens,
    // no brackets, followed by a non-empty non-chord lyric line.
    if (!line.includes('[') && isChordOnlyLine(line)) {
      const nextIdx = i + 1;
      if (nextIdx < rawLines.length) {
        const nextLine = rawLines[nextIdx];
        if (nextLine !== '' && !isChordOnlyLine(nextLine) && !nextLine.includes('[')) {
          const parts = buildPartsFromChordAboveLyric(line, nextLine);
          result.push({ lineIndex: result.length, parts });
          i += 2;
          continue;
        }
      }
    }

    // Normal [chord] bracket format
    const parts = [];
    let lastIndex = 0;
    const regex = /\[([^\]]+)\]/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: line.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'chord', content: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) {
      parts.push({ type: 'text', content: line.slice(lastIndex) });
    }
    result.push({ lineIndex: result.length, parts });
    i++;
  }

  return result;
}

export function getSemitonesBetween(fromNote, toNote) {
  const fromIndex = getNoteIndex(fromNote);
  const toIndex = getNoteIndex(toNote);
  return (toIndex - fromIndex + 12) % 12;
}
