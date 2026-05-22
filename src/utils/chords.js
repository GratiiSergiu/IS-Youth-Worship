const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const FLAT_TO_SHARP = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'db': 'C#', 'eb': 'D#', 'gb': 'F#', 'ab': 'G#', 'bb': 'A#',
};

const SHARP_TO_FLAT = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

// Keys that conventionally use flat notation
const FLAT_KEY_SET = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'A#', 'D#', 'G#', 'C#']);

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
  return lyrics.replace(/\[([^\]]+)\]/g, (_, chord) => {
    return '[' + transposeChord(chord, semitones, useFlats) + ']';
  });
}

export function renderLyrics(lyrics) {
  return lyrics.split('\n').map((line, i) => {
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
    return { lineIndex: i, parts };
  });
}

export function getSemitonesBetween(fromNote, toNote) {
  const fromIndex = getNoteIndex(fromNote);
  const toIndex = getNoteIndex(toNote);
  return (toIndex - fromIndex + 12) % 12;
}
