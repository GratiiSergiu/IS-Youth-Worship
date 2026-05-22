import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSettings } from './contexts/SettingsContext';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import SongList from './components/SongList';
import SetlistPlanner from './components/SetlistPlanner';
import Settings from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('repertoriu');
  const [showSettings, setShowSettings] = useState(false);
  const [songs, setSongs] = useLocalStorage('isworship_songs', []);
  const [setlist, setSetlist] = useLocalStorage('isworship_setlist', {
    eventName: 'Tineret Marți',
    songs: [],
  });
  const { theme } = useSettings();

  const handleUpdateSong = (updated) => {
    setSongs((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
  };

  return (
    <div className="min-h-screen selection:bg-yellow-500/30" style={{ backgroundColor: theme.bg, color: theme.text }}>
      <Header onSettingsClick={() => setShowSettings(true)} />
      {activeTab === 'repertoriu' && (
        <SongList
          songs={songs}
          onAdd={(song) => setSongs((prev) => [...prev, song])}
          onDelete={(id) => setSongs((prev) => prev.filter((s) => s.id !== id))}
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
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
