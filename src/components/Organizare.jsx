import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import SetlistPlanner from './SetlistPlanner';
import Programe from './Programe';
import Repetitii from './Repetitii';
import { Calendar, ListMusic, CheckSquare } from 'lucide-react';

const TABS = [
  { id: 'planificare', label: 'Planificare', icon: Calendar },
  { id: 'programe', label: 'Programe', icon: ListMusic },
  { id: 'repetitii', label: 'Repetiții', icon: CheckSquare },
];

export default function Organizare(props) {
  const { theme } = useSettings();
  const [activeTab, setActiveTab] = useState('planificare');

  const renderContent = () => {
    switch (activeTab) {
      case 'planificare':
        return <SetlistPlanner {...props} />;
      case 'programe':
        return <Programe {...props} />;
      case 'repetitii':
        return <Repetitii {...props} />;
      default:
        return null;
    }
  };
  
  const ActiveIcon = TABS.find(t => t.id === activeTab).icon;

  return (
    <div>
      <div className="px-4 pt-3 pb-2 sticky top-0 z-10" style={{ backgroundColor: theme.bg, borderBottom: `1px solid ${theme.border}`}}>
        <div className="flex items-center gap-2 mb-3">
          <ActiveIcon size={16} style={{ color: theme.accent }}/>
          <p className="text-lg font-bold" style={{ color: theme.text }}>
            {TABS.find(t => t.id === activeTab).label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={"px-3 py-1.5 rounded-full text-sm font-semibold transition whitespace-nowrap " + (activeTab === tab.id ? 'shadow':'')}
              style={
                activeTab === tab.id
                  ? { backgroundColor: theme.accent, color: theme.accentFg }
                  : { backgroundColor: theme.surface, color: theme.muted }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="pt-2">
        {renderContent()}
      </div>
    </div>
  );
}
