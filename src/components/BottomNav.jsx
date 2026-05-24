import { Music, CalendarDays, FolderOpen, History, Users } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const tabs = [
  { id: 'repertoriu',  label: 'Repertoriu',  icon: Music },
  { id: 'planificare', label: 'Planificare',  icon: CalendarDays },
  { id: 'echipa',      label: 'Echipă',      icon: Users },
  { id: 'colectii',    label: 'Colecții',    icon: FolderOpen },
  { id: 'istoric',     label: 'Istoric',     icon: History },
];

export default function BottomNav({ activeTab, onTabChange }) {
  const { theme } = useSettings();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 backdrop-blur border-t z-50 pb-safe"
      style={{ backgroundColor: theme.surface + 'f5', borderColor: theme.border }}
    >
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors"
              style={{ color: isActive ? theme.accent : theme.muted }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
