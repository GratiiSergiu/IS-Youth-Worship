const CHORD_TOKEN =
  /^[A-G][#b]?(m|maj|maj7|min|dim|aug|sus[24]?|add[0-9]+|[0-9]+)*(\/[A-G][#b]?)?$/;

function isChordLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 1 && trimmed.length < 2) return false;
  return tokens.every((t) => CHORD_TOKEN.test(t));
}

function mergeChordLineWithLyrics(chordLine, lyricLine) {
  const regex = /\S+/g;
  let match;
  const chords = [];
  while ((match = regex.exec(chordLine)) !== null) {
    chords.push({ pos: match.index, chord: match[0] });
  }
  let result = lyricLine;
  for (let i = chords.length - 1; i >= 0; i--) {
    const { pos, chord } = chords[i];
    const insertPos = Math.min(pos, result.length);
    result = result.slice(0, insertPos) + `[${chord}]` + result.slice(insertPos);
  }
  return result;
}

export function convertToOurFormat(text) {
  if (!text || !text.trim()) return text;

  // Already [Chord] format
  if (/\[[A-G][^\]]{0,10}\]/.test(text)) return text;

  // (Chord) format → [Chord]
  if (/\([A-G][^)]{0,10}\)/.test(text)) {
    return text.replace(/\(([A-G][^)]{0,10})\)/g, '[$1]').trim();
  }

  // Chords-above-lyrics format
  const lines = text.split('\n');
  const result = [];
  let i = 0;
  while (i < lines.length) {
    if (
      isChordLine(lines[i]) &&
      i + 1 < lines.length &&
      !isChordLine(lines[i + 1])
    ) {
      result.push(mergeChordLineWithLyrics(lines[i], lines[i + 1]));
      i += 2;
    } else {
      result.push(lines[i]);
      i++;
    }
  }
  return result.join('\n').trim();
}

function detectKeyFromLyrics(lyrics) {
  const match = lyrics.match(/\[([A-G][#b]?)/);
  return match ? match[1] : 'G';
}

export async function fetchSongFromUrl(url) {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error('proxy_error');
  const data = await res.json();
  const html = data.contents;
  if (!html) throw new Error('empty');

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Title
  let title = doc.querySelector('h1')?.textContent?.trim() || '';
  if (!title) title = doc.title.split(/[|\-–]/)[0].trim();

  // Author
  let author = '';
  const authorEl = doc.querySelector(
    '.author, .artist, [itemprop="byArtist"], .song-author, .performer'
  );
  if (authorEl) author = authorEl.textContent.trim();

  // Lyrics / chords content
  const selectors = [
    'pre',
    '.lyrics', '.chords', '.tab-content', '.song-text', '.song-content',
    '[class*="lyric"]', '[class*="chord"]', '[class*="tab"]',
    'article', 'main',
  ];

  let rawText = '';
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el && el.textContent.trim().length > 60) {
      rawText = el.textContent;
      break;
    }
  }
  if (!rawText) rawText = doc.body?.textContent || '';

  const lyrics = convertToOurFormat(rawText.trim());
  const key = detectKeyFromLyrics(lyrics);

  return { title, author, lyrics, key };
}
