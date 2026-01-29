import React from 'react';
import { ICONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'investor' | 'agency' | 'developer';
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
    { id: 'payouts', name: 'Distributions', icon: ICONS.Payments },
    { id: 'kyc', name: 'Validations', icon: ICONS.Users },
    { id: 'users', name: 'Membres', icon: ICONS.Users },
  ];

  const investorTabs = [
    { id: 'overview', name: 'Portfolio', icon: ICONS.Dashboard },
    { id: 'investments', name: 'Marché', icon: ICONS.Projects },
    { id: 'returns', name: 'Mes Revenus', icon: ICONS.Payments },
    { id: 'simulator', name: 'ROI Calc', icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 v14a2 2 0 002 2z" /></svg> },
  ];

  const agencyTabs = [
    { id: 'overview', name: 'GESS Now', icon: ICONS.Dashboard },
    { id: 'history', name: 'Dossiers', icon: ICONS.Projects },
    { id: 'settings', name: 'Profil Agence', icon: ICONS.Users },
  ];

  const developerTabs = [
    { id: 'overview', name: 'Mes Chantiers', icon: ICONS.Dashboard },
    { id: 'funding', name: 'Collectes', icon: ICONS.Projects },
    { id: 'docs', name: 'Documents', icon: ICONS.Users },
  ];

  const getTabs = () => {
    switch(userRole) {
      case 'admin': return adminTabs;
      case 'agency': return agencyTabs;
      case 'developer': return developerTabs;
      default: return investorTabs;
    }
  };

  const tabs = getTabs();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-[#0d1b2a] text-white flex flex-col hidden md:flex shrink-0">
        <button onClick={onGoHome} className="p-8 flex items-center gap-3 text-left focus:outline-none hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-[#ff6b35] rounded-lg flex items-center justify-center font-black text-xl">G</div>
          <span className="text-lg font-black tracking-tighter uppercase italic">GESS <span className="text-[#ff6b35]">INVEST</span></span>
        </button>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
                activeTab === tab.id 
                  ? 'bg-[#ff6b35] text-white shadow-lg scale-[1.02]' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {typeof tab.icon === 'function' ? <tab.icon /> : null}
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest">{tab.name}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-white/5">
          <button onClick={onGoHome} className="w-full flex items-center gap-4 px-5 py-3.5 text-slate-500 hover:text-rose-400 transition-all font-black text-[10px] uppercase tracking-widest bg-white/5 rounded-xl">
            <ICONS.Logout />
            <span>Sortie</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center justify-between px-10 shrink-0">
          <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
            <span className="w-2 h-2 bg-[#ff6b35] rounded-full"></span>
            {tabs.find(t => t.id === activeTab)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compte GESS</span>
                <span className="text-xs font-black text-slate-900 capitalize">{userRole}</span>
             </div>
             <div className="w-10 h-10 bg-slate-100 rounded-xl border-2 border-white shadow-md overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${userRole}&background=0d1b2a&color=fff`} alt="avatar" />
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#fcfcfc]">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;