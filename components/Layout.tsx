
import React from 'react';
import { ICONS } from '../constants';

// --- Coordonnées de contact ---
const CONTACT_EMAIL = "gess.srh.td@gmail.com";
const CONTACT_PHONE = "+235 66 59 08 78";

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'member';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoHome?: () => void;
  customTabs?: { id: string, name: string, icon: React.FC }[];
  notificationBadgeCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  userRole, 
  activeTab, 
  setActiveTab, 
  onGoHome,
  customTabs, 
  notificationBadgeCount = 0 
}) => {
  const adminTabs = customTabs || [
    { id: 'overview', name: 'Dashboard Global', icon: ICONS.Dashboard },
    { id: 'projects', name: 'Gestion Projets', icon: ICONS.Projects },
    { id: 'payouts', name: 'Paiements ROI/Capital', icon: ICONS.Payments },
    { id: 'kyc', name: 'Vérification KYC', icon: ICONS.Users },
    { id: 'users', name: 'Gestion Utilisateurs', icon: ICONS.Users },
  ];

  const memberTabs = [
    { id: 'overview', name: 'Mon Portfolio', icon: ICONS.Dashboard },
    { id: 'investments', name: 'Marché', icon: ICONS.Projects },
    { id: 'returns', name: 'Mes Dividendes', icon: ICONS.Payments },
    { id: 'simulator', name: 'Simulateur', icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 v14a2 2 0 002 2z" /></svg> },
    { id: 'profil', name: 'Mon Profil', icon: ICONS.Users },
  ];

  const tabs = userRole === 'admin' ? adminTabs : memberTabs;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-[#0d1b2a] text-white flex flex-col hidden md:flex shrink-0 border-r border-slate-800">
        <button 
          onClick={onGoHome}
          className="p-8 flex items-center gap-3 group cursor-pointer text-left focus:outline-none"
        >
          <div className="w-12 h-12 bg-[#ff6b35] rounded-2xl flex items-center justify-center font-black text-2xl group-hover:scale-105 transition-transform">G</div>
          <div className="flex flex-col">
            <span className="text-xl font-black leading-none tracking-tighter uppercase">GESS <span className="text-[#ff6b35]">INVEST</span></span>
          </div>
        </button>

        <div className="px-4 mb-4">
          <button
            onClick={onGoHome}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all font-bold text-sm tracking-tight border border-slate-800/50"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <ICONS.Home />
            </div>
            <span>Page d'accueil</span>
          </button>
        </div>

        <div className="px-6 mb-2">
           <div className="h-px bg-slate-800/50 w-full"></div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 group ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-[#ff6b35] to-[#ff8e53] text-white shadow-xl shadow-[#ff6b35]/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 flex items-center justify-center">
                  {/* @ts-ignore */}
                  <tab.icon />
                </div>
                <span className="font-bold text-sm tracking-tight">{tab.name}</span>
              </div>
              
              {(tab.id === 'returns' || tab.id === 'payouts' || tab.id === 'kyc') && notificationBadgeCount > 0 && (
                <div className="w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
                  {notificationBadgeCount}
                </div>
              )}
            </button>
          ))}

          <div className="pt-8 px-4 pb-4">
             <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Support 24/7</p>
                <div className="space-y-3">
                   <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 text-xs font-bold text-slate-400 hover:text-[#ff6b35] transition-colors truncate">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      {CONTACT_EMAIL}
                   </a>
                   <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-3 text-xs font-bold text-slate-400 hover:text-[#ff6b35] transition-colors">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {CONTACT_PHONE}
                   </a>
                </div>
             </div>
          </div>
        </nav>
        
        <div className="p-6">
          <button 
            onClick={onGoHome}
            className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-400 transition-all font-bold text-sm"
          >
            <ICONS.Logout />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-10 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={onGoHome}
              className="md:hidden w-10 h-10 bg-[#0d1b2a] text-white rounded-xl flex items-center justify-center shadow-lg"
            >
              <ICONS.Home />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              {tabs.find(t => t.id === activeTab)?.name}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
               {notificationBadgeCount > 0 && (
                 <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
               )}
               <div className="w-10 h-10 bg-slate-100 rounded-xl border-2 border-white shadow-sm overflow-hidden">
                 <img src="https://picsum.photos/100/100?random=1" alt="profile" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
