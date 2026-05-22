const CHORD_TOKEN =
  /^[A-G][#b]?(m|maj|maj7|min|dim|aug|sus[24]?|add[0-9]+|[0-9]+)*(\/[A-G][#b]?)?$/;

const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

function normalizeKey(note) {
  return FLAT_TO_SHARP[note] || note;
}

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

// Parses lines where chords are embedded directly in text without delimiters
// e.g. "EmNu voi uiCta miGnunea ce-ai fDăcut-o" → "[Em]Nu voi ui[C]ta mi[G]nunea ce-ai f[D]ăcut-o"
const INLINE_CHORD_RE = /^([A-G][#b]?(maj7?|m(?:aj)?7?|min|dim7?|aug|sus[24]?|add\d+|\d+)?(\/[A-G][#b]?)?)/;

function parseInlineChordsLine(line) {
  let result = '';
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    const prev = i > 0 ? line[i - 1] : null;
    // Try chord match at line start or right after a non-space character
    if ('ABCDEFG'.includes(ch) && (prev === null || prev !== ' ')) {
      const m = line.slice(i).match(INLINE_CHORD_RE);
      if (m) {
        result += `[${m[1]}]`;
        i += m[1].length;
        continue;
      }
    }
    result += ch;
    i++;
  }
  return result;
}

function looksLikeInlineChords(text) {
  // At least 2 lines start directly with a chord-like pattern (no space before)
  const lines = text.split('\n').filter((l) => l.trim());
  let count = 0;
  for (const line of lines) {
    if (/^[A-G][#b]?(m(?:aj)?7?|7|dim|aug|sus[24]?)?[A-ZÀ-Ÿa-zà-ÿ]/.test(line.trim())) {
      count++;
    }
  }
  return count >= 2;
}

export function convertToOurFormat(text) {
  if (!text || !text.trim()) return text;

  // Already [Chord] format
  if (/\[[A-G][^\]]{0,10}\]/.test(text)) return text;

  // (Chord) format → [Chord]
  if (/\([A-G][^)]{0,10}\)/.test(text)) {
    return text.replace(/\(([A-G][^)]{0,10})\)/g, '[$1]').trim();
  }

  // Inline embedded chords (e.g. melodia.ro copy-paste: "EmNu voi uiCta mi")
  if (looksLikeInlineChords(text)) {
    return text.split('\n').map(parseInlineChordsLine).join('\n').trim();
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
  if (!match) return 'G';
  return normalizeKey(match[1]);
}

// ─── melodia.ro parser ───────────────────────────────────────────────────────
// Structure: <div class="with-chords verse">
//   <div class="chord">Fm</div>"text node"<div class="chord">Db</div>"text"...<br>
// </div>
function parseMelodiaSection(sectionEl) {
  const lines = [];
  let currentLine = '';

  for (const node of sectionEl.childNodes) {
    if (node.nodeType === 1) {
      // element node
      const tag = node.tagName.toUpperCase();
      if (node.classList.contains('chord')) {
        currentLine += `[${node.textContent.trim()}]`;
      } else if (tag === 'BR') {
        lines.push(currentLine);
        currentLine = '';
      }
    } else if (node.nodeType === 3) {
      // text node
      const text = node.textContent.replace(/\s+/g, ' ').trim();
      if (text) currentLine += text;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);
  return lines.join('\n');
}

function parseMelodiaRo(doc) {
  const title =
    doc.querySelector('h1')?.textContent?.trim() ||
    doc.title.split(/[|\-–]/)[0].trim();

  const author =
    doc.querySelector('.artist, .author, .artist-name, [class*="artist"], [class*="author"]')
      ?.textContent?.trim() || '';

  const sections = Array.from(doc.querySelectorAll('[class*="with-chords"]'));
  const sectionTexts = sections.map(parseMelodiaSection).filter(Boolean);
  const lyrics = sectionTexts.join('\n\n');
  const key = detectKeyFromLyrics(lyrics);

  return { title, author, lyrics, key };
}

// ─── resursecrestine.ro parser ────────────────────────────────────────────────
function parseResurseCrestine(doc) {
  const title =
    doc.querySelector('h1, .song-title, .entry-title')?.textContent?.trim() ||
    doc.title.split(/[|\-–]/)[0].trim();

  const author =
    doc.querySelector('.author, .artist, .entry-author')?.textContent?.trim() || '';

  const contentEl = doc.querySelector(
    '.song-content, .entry-content, .lyrics, article, main'
  );
  const rawText = contentEl?.textContent || doc.body?.textContent || '';
  const lyrics = convertToOurFormat(rawText.trim());
  const key = detectKeyFromLyrics(lyrics);

  return { title, author, lyrics, key };
}

// ─── generic fallback ─────────────────────────────────────────────────────────
function parseGeneric(doc) {
  let title = doc.querySelector('h1')?.textContent?.trim() || '';
  if (!title) title = doc.title.split(/[|\-–]/)[0].trim();

  const author =
    doc.querySelector('.author, .artist, [itemprop="byArtist"], .song-author, .performer')
      ?.textContent?.trim() || '';

  const selectors = [
    'pre',
    '.lyrics', '.chords', '.tab-content', '.song-text', '.song-content',
    '[class*="lyric"]', '[class*="tab"]',
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

// ─── main export ──────────────────────────────────────────────────────────────
async function fetchHtml(url) {
  const encoded = encodeURIComponent(url);
  const proxies = [
    async () => {
      const r = await fetch(`https://api.allorigins.win/get?url=${encoded}`, { signal: AbortSignal.timeout(12000) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      if (!d.contents || d.contents.length < 200) throw new Error();
      return d.contents;
    },
    async () => {
      const r = await fetch(`https://corsproxy.io/?${encoded}`, { signal: AbortSignal.timeout(12000) });
      if (!r.ok) throw new Error();
      const t = await r.text();
      if (!t || t.length < 200) throw new Error();
      return t;
    },
    async () => {
      const r = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encoded}`, { signal: AbortSignal.timeout(12000) });
      if (!r.ok) throw new Error();
      const t = await r.text();
      if (!t || t.length < 200) throw new Error();
      return t;
    },
  ];

  for (const tryProxy of proxies) {
    try {
      return await tryProxy();
    } catch {
      // try next
    }
  }
  throw new Error('blocked');
}

export async function fetchSongFromUrl(url) {
  const html = await fetchHtml(url);

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  if (url.includes('melodia.ro')) return parseMelodiaRo(doc);
  if (url.includes('resursecrestine.ro')) return parseResurseCrestine(doc);
  return parseGeneric(doc);
}
