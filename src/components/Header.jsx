import { Settings } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function Header({ onSettingsClick }) {
  const { theme } = useSettings();
  return (
    <div className="px-4 pt-6 pb-2 flex items-center justify-between select-none"
      style={{ backgroundColor: theme.bg }}>
      <div>
        <h1
          className="font-black tracking-tight leading-none bg-clip-text text-transparent"
          style={{
            fontSize: '1.35rem',
            backgroundImage: 'linear-gradient(90deg, #f43f5e 0%, #a855f7 50%, #6366f1 100%)',
          }}
        >
          ISYouth
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] font-semibold mt-0.5" style={{ color: theme.muted }}>
          Worship App
        </p>
      </div>
      <button
        onClick={onSettingsClick}
        className="p-2 rounded-xl transition active:scale-90"
        style={{ color: theme.muted, backgroundColor: theme.surface }}>
        <Settings size={20} />
      </button>
    </div>
  );
}
