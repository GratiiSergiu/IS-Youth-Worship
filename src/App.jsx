import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSettings } from './contexts/SettingsContext';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './supabaseClient';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import SongList from './components/SongList';
import Organizare from './components/Organizare';
import Collections from './components/Collections';
import Echipa from './components/Echipa';
import Settings from './components/Settings';
import HistoryCalendar from './components/HistoryCalendar';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('repertoriu');
  const [showSettings, setShowSettings] = useState(false);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [setlists, setSetlists] = useLocalStorage('isworship_setlists', () => {
    const old = localStorage.getItem('isworship_setlist');
    if (old) {
      try {
        const parsed = JSON.parse(old);
        localStorage.removeItem('isworship_setlist');
        return [{ id: '1', eventName: parsed.eventName || 'Tineret Marți', songs: parsed.songs || [] }];
      } catch { /* ignore */ }
    }
    return [
      { id: '1', eventName: 'Tineret Marți', songs: [] },
      { id: '2', eventName: 'Slujire Duminică', songs: [] },
    ];
  });
  const [collections, setCollections] = useLocalStorage('isworship_collections', []);
  const [membri, setMembri] = useLocalStorage('isworship_membri', []);
  const [istoricData, setIstoricData] = useState([]);
  const { theme } = useSettings();

  // Normalize DB row (capitalized cols) → internal object (lowercase keys)
  const fromDb = (row) => ({
    id: String(row.id),
    titlu: row['Titlu'] ?? '',
    autor: row['Autor'] ?? '',
    tonalitate: row['Tonalitate'] ?? 'C',
    versuri: row['Versuri'] ?? '',
  });

  // Map internal object → DB columns
  const toDb = ({ titlu, autor, tonalitate, versuri }) => ({
    Titlu: titlu ?? '',
    Autor: autor ?? '',
    Tonalitate: tonalitate ?? 'C',
    Versuri: versuri ?? '',
  });

  // ── Fetch all songs from Supabase ──────────────────────────────────────────
  const fetchSongs = useCallback(async () => {
    const { data, error } = await supabase
      .from('Cântări')
      .select('*')
      .order('Titlu', { ascending: true });
    if (error) {
      setDbError(error.message);
    } else {
      setSongs((data ?? []).map(fromDb));
      setDbError(null);
    }
    setLoading(false);
  }, []);

  const fetchIstoric = useCallback(async () => {
    const { data } = await supabase
      .from('Istoric')
      .select('*')
      .order('data_eveniment', { ascending: false });
    if (data) setIstoricData(data);
  }, []);

  // ── One-time migration: localStorage → Supabase ───────────────────────────
  useEffect(() => {
    const migrate = async () => {
      const raw = localStorage.getItem('isworship_songs');
      if (!raw) return;
      let local = [];
      try { local = JSON.parse(raw); } catch { return; }
      if (!Array.isArray(local) || local.length === 0) {
        localStorage.removeItem('isworship_songs');
        return;
      }
      const rows = local.map(toDb);
      const { error } = await supabase.from('Cântări').insert(rows);
      if (!error) {
        localStorage.removeItem('isworship_songs');
        fetchSongs();
      }
    };
    migrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSongs();
    fetchIstoric();

    const channel = supabase
      .channel('app-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Cântări' }, fetchSongs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Istoric' }, fetchIstoric)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchSongs, fetchIstoric]);

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const handleAddSong = async (song) => {
    const { data, error } = await supabase
      .from('Cântări')
      .insert(toDb(song))
      .select()
      .single();
    if (error) { setDbError(error.message); return; }
    if (data) setSongs((prev) => [...prev, fromDb(data)]);
  };

  const handleDeleteSong = async (id) => {
    const { error } = await supabase.from('Cântări').delete().eq('id', id);
    if (error) { setDbError(error.message); return; }
    setSongs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDeleteProgram = async (id) => {
    const { error } = await supabase.from('Istoric').delete().eq('id', id);
    if (!error) fetchIstoric();
    return { error };
  };

  const handleSaveProgram = async (entry) => {
    const { error } = await supabase.from('Istoric').insert({
      data_eveniment: entry.data_eveniment,
      nume_eveniment: entry.nume_eveniment,
      cantari: entry.cantari,
    });
    if (!error) fetchIstoric();
    return { error };
  };

  const handleUpdateProgram = async (program) => {
    const { error } = await supabase
      .from('Istoric')
      .update(program)
      .eq('id', program.id);
    if (!error) fetchIstoric();
    return { error };
  };

  const handleSaveRepetitie = async (dateStr) => {
    const { data, error } = await supabase
      .from('Istoric')
      .insert({ data_eveniment: dateStr, nume_eveniment: 'Repetitie', cantari: [], prezenta: [] })
      .select()
      .single();
    if (!error && data) setIstoricData(prev => [...prev, data]);
    return { data, error };
  };

  const handleUpdatePrezenta = async (id, prezenta) => {
    const { error } = await supabase
      .from('Istoric')
      .update({ prezenta })
      .eq('id', id);
    if (!error) setIstoricData(prev => prev.map(item => item.id === id ? { ...item, prezenta } : item));
    return { error };
  };

  const handleUpdateSong = async (updated) => {
    const { id } = updated;
    const { data, error } = await supabase
      .from('Cântări')
      .update(toDb(updated))
      .eq('id', id)
      .select()
      .single();
    if (error) { setDbError(error.message); return; }
    if (data) setSongs((prev) => prev.map((s) => s.id === id ? fromDb(data) : s));
  };

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (authLoading) return null;
  if (!user) return <LoginScreen />;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
    {showSplash && (
      <SplashScreen
        dataReady={!loading}
        onDone={() => setShowSplash(false)}
      />
    )}
    <div className="min-h-screen selection:bg-yellow-500/30" style={{ backgroundColor: theme.bg, color: theme.text }}>
      <Header onSettingsClick={() => setShowSettings(true)} />

      {/* Error banner */}
      {dbError && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs font-mono break-all">
          <p className="font-bold mb-1">Eroare Supabase:</p>
          <p>{dbError}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm" style={{ color: theme.muted }}>Se încarcă repertoriul…</p>
        </div>
      ) : (
        <div className="px-4 pt-3 pb-24">
          {activeTab === 'repertoriu' && (
            <SongList
              songs={songs}
              onAdd={handleAddSong}
              onDelete={handleDeleteSong}
              onUpdate={handleUpdateSong}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'colectii' && (
            <Collections
              songs={songs}
              collections={collections}
              onUpdateCollections={setCollections}
              onUpdateSong={handleUpdateSong}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'organizare' && (
            <Organizare
              songs={songs}
              setlists={setlists}
              onUpdateSetlists={setSetlists}
              onUpdateSong={handleUpdateSong}
              onSaveProgram={handleSaveProgram}
              onUpdateProgram={handleUpdateProgram}
              istoricData={istoricData}
              onUpdateIstoric={setIstoricData}
              onSaveRepetitie={handleSaveRepetitie}
              onUpdatePrezenta={handleUpdatePrezenta}
              membri={membri}
              onUpdateMembri={setMembri}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'echipa' && (
            <Echipa
              membri={membri}
              onUpdate={setMembri}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'istoric' && (
            <HistoryCalendar
              songs={songs}
              istoricData={istoricData}
              onDeleteProgram={handleDeleteProgram}
              isAdmin={isAdmin}
            />
          )}
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
    </>
  );
}
