import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSettings } from './contexts/SettingsContext';
import { supabase } from './supabaseClient';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import SongList from './components/SongList';
import SetlistPlanner from './components/SetlistPlanner';
import Settings from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('repertoriu');
  const [showSettings, setShowSettings] = useState(false);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setlist, setSetlist] = useLocalStorage('isworship_setlist', {
    eventName: 'Tineret Marți',
    songs: [],
  });
  const { theme } = useSettings();

  // ── Fetch all songs from Supabase ──────────────────────────────────────────
  const fetchSongs = useCallback(async () => {
    const { data, error } = await supabase
      .from('cantari')
      .select('*')
      .order('titlu', { ascending: true });
    if (!error) setSongs(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSongs();

    // Real-time subscription — changes on any device update all clients instantly
    const channel = supabase
      .channel('cantari-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cantari' }, fetchSongs)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchSongs]);

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const handleAddSong = async (song) => {
    const { titlu, autor, tonalitate, versuri } = song;
    const { data, error } = await supabase
      .from('cantari')
      .insert({ titlu, autor, tonalitate, versuri })
      .select()
      .single();
    if (!error && data) setSongs((prev) => [...prev, data]);
  };

  const handleDeleteSong = async (id) => {
    const { error } = await supabase.from('cantari').delete().eq('id', id);
    if (!error) setSongs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSong = async (updated) => {
    const { id, titlu, autor, tonalitate, versuri } = updated;
    const { data, error } = await supabase
      .from('cantari')
      .update({ titlu, autor, tonalitate, versuri })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) setSongs((prev) => prev.map((s) => s.id === id ? data : s));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen selection:bg-yellow-500/30" style={{ backgroundColor: theme.bg, color: theme.text }}>
      <Header onSettingsClick={() => setShowSettings(true)} />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm" style={{ color: theme.muted }}>Se încarcă repertoriul…</p>
        </div>
      ) : (
        <>
          {activeTab === 'repertoriu' && (
            <SongList
              songs={songs}
              onAdd={handleAddSong}
              onDelete={handleDeleteSong}
              onUpdate={handleUpdateSong}
            />
          )}
          {activeTab === 'planificare' && (
            <SetlistPlanner
              songs={songs}
              setlist={setlist}
              onUpdateSetlist={setSetlist}
              onUpdateSong={handleUpdateSong}
            />
          )}
        </>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
