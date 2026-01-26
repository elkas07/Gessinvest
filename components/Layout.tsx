import React from 'react';
import { ICONS } from './constants.tsx';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'member';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoHome?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  userRole, 
  activeTab, 
  setActiveTab, 
  onGoHome 
}) => {
  const adminTabs = [
    { id: 'overview', name: 'Dashboard', icon: ICONS.Dashboard },
    { id: 'payouts', name: 'Paiements ROI', icon: ICONS.Payments },
    { id: 'kyc', name: 'Vérification KYC', icon: ICONS.Users },
    { id: 'users', name: 'Membres', icon: ICONS.Users },
  ];

  const memberTabs = [
    { id: 'overview', name: 'Mon Portfolio', icon: ICONS.Dashboard },
    { id: 'investments', name: 'Marché Immo', icon: ICONS.Projects },
    { id: 'returns', name: 'Mes Dividendes', icon: ICONS.Payments },
    { id: 'simulator', name: 'Simulateur', icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 v14a2 2 0 002 2z" /></svg> },
    { id: 'profil', name: 'Mon Profil', icon: ICONS.Users },
  ];

  const tabs = userRole === 'admin' ? adminTabs : memberTabs;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-[#0d1b2a] text-white flex flex-col hidden md:flex shrink-0 border-r border-slate-800">
        <button onClick={onGoHome} className="p-8 flex items-center gap-3 group text-left focus:outline-none">
          <div className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center font-black text-xl">G</div>
          <span className="text-lg font-black tracking-tighter uppercase">GESS <span className="text-[#ff6b35]">INVEST</span></span>
        </button>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {typeof tab.icon === 'function' ? <tab.icon /> : null}
              </div>
              <span className="font-bold text-sm">{tab.name}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-6">
          <button onClick={onGoHome} className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-rose-400 transition-all font-bold text-sm">
            <ICONS.Logout />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center justify-between px-10 shrink-0">
          <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">
            {tabs.find(t => t.id === activeTab)?.name}
          </h1>
          <div className="w-10 h-10 bg-slate-100 rounded-xl border-2 border-white shadow-sm"></div>
        </header>
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;