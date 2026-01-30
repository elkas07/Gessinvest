import React from 'react';
import { ICONS } from "./constants";

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
    { id: 'overview', name: 'Vue d\'ensemble', icon: ICONS.Dashboard },
    { id: 'users', name: 'Gestion Membres', icon: ICONS.Users },
    { id: 'kyc', name: 'Validations KYC', icon: ICONS.Users },
    { id: 'projects', name: 'Gestion Projets', icon: ICONS.Projects },
  ];

  const investorTabs = [
    { id: 'overview', name: 'Mon Portefeuille', icon: ICONS.Dashboard },
    { id: 'investments', name: 'Le Marché Immo', icon: ICONS.Projects },
    { id: 'returns', name: 'Mes Revenus', icon: ICONS.Payments },
    { id: 'simulator', name: 'Simulateur ROI', icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 v14a2 2 0 002 2z" /></svg> },
  ];

  const agencyTabs = [
    { id: 'overview', name: 'Tableau GESS Now', icon: ICONS.Dashboard },
    { id: 'history', name: 'Mes Dossiers', icon: ICONS.Projects },
    { id: 'settings', name: 'Compte Certifié', icon: ICONS.Users },
  ];

  const developerTabs = [
    { id: 'overview', name: 'Mes Chantiers', icon: ICONS.Dashboard },
    { id: 'funding', name: 'Levées de Fonds', icon: ICONS.Projects },
    { id: 'docs', name: 'Documents Pro', icon: ICONS.Users },
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
      <aside className="w-80 bg-[#0d1b2a] text-white flex flex-col hidden lg:flex shrink-0 shadow-2xl z-20">
        <button onClick={onGoHome} className="p-12 flex items-center gap-5 text-left focus:outline-none hover:opacity-80 transition-opacity">
          <div className="w-14 h-14 bg-[#ff6b35] rounded-2xl flex items-center justify-center font-black text-4xl">G</div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">GESS <span className="text-[#ff6b35]">INVEST</span></span>
        </button>

        <nav className="flex-1 px-8 space-y-4 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-6 px-8 py-5 rounded-[1.5rem] transition-all duration-300 group ${
                activeTab === tab.id 
                  ? 'bg-[#ff6b35] text-white shadow-2xl scale-[1.05]' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center group-hover:scale-125 transition-transform">
                {typeof tab.icon === 'function' ? <tab.icon /> : null}
              </div>
              <span className="font-black text-sm uppercase tracking-[0.2em]">{tab.name}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-10 border-t border-white/5">
          <button onClick={onGoHome} className="w-full flex items-center gap-6 px-8 py-5 text-slate-500 hover:text-rose-400 transition-all font-black text-sm uppercase tracking-[0.2em] bg-white/5 rounded-2xl group">
            <ICONS.Logout />
            <span className="group-hover:translate-x-2 transition-transform">Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-32 bg-white border-b flex items-center justify-between px-16 shrink-0 shadow-sm z-10">
          <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-5 italic">
            <span className="w-4 h-4 bg-[#ff6b35] rounded-full shadow-[0_0_15px_rgba(255,107,53,0.6)] animate-pulse"></span>
            {tabs.find(t => t.id === activeTab)?.name || 'Espace Membre'}
          </h1>
          <div className="flex items-center gap-10">
             <div className="flex flex-col items-end">
                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-1.5">Plateforme GESS</span>
                <span className="text-base font-black text-slate-900 capitalize px-5 py-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">{userRole}</span>
             </div>
             <div className="w-16 h-16 bg-[#0d1b2a] rounded-[1.5rem] border-2 border-white shadow-xl overflow-hidden group cursor-pointer hover:scale-110 transition-transform">
                <img src={`https://ui-avatars.com/api/?name=${userRole}&background=0d1b2a&color=fff&bold=true&size=128`} alt="avatar" />
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-16 custom-scrollbar bg-[#fcfcfc]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;