import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import SongList from './components/SongList';
import SetlistPlanner from './components/SetlistPlanner';

export default function App() {
  const [activeTab, setActiveTab] = useState('repertoriu');
  const [songs, setSongs] = useLocalStorage('isworship_songs', []);
  const [setlist, setSetlist] = useLocalStorage('isworship_setlist', {
    eventName: 'Tineret Marți',
    songs: [],
  });

  const handleUpdateSong = (updated) => {
    setSongs((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-yellow-500/30">
      <Header />
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
    </div>
  );
}

