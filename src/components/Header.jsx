import { Settings } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function Header({ onSettingsClick }) {
  const { theme } = useSettings();
  return (
    <div className="px-4 pt-6 pb-2 flex items-center justify-between select-none"
      style={{ backgroundColor: theme.bg }}>
      <div>
        <h1 className="text-xl font-black tracking-tight leading-none">
          <span style={{ color: theme.text }}>IS</span>
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">Youth</span>
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] font-medium mt-0.5" style={{ color: theme.muted }}>
          Worship
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
