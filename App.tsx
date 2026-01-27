import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import DataTable from './components/DataTable.tsx';
import { Project, UserProfile, Transaction, UserRole } from './types.ts';
import { supabase } from './lib/supabase.ts';

const formatCFA = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val).replace('XOF', 'F CFA');

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Validé': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'En attente': 'bg-amber-50 text-amber-700 border-amber-100',
    'Rejeté': 'bg-rose-50 text-rose-700 border-rose-100',
    'verified': 'bg-blue-50 text-blue-700 border-blue-100',
    'pending': 'bg-orange-50 text-orange-700 border-orange-100',
    'active': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles[status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
      {status === 'verified' ? 'Vérifié' : status === 'pending' ? 'En attente' : status === 'active' ? 'Actif' : status}
    </span>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [userRole, setUserRole] = useState<UserRole>('investor');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // UI States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [simAmount, setSimAmount] = useState(500000);
  const [showBalanceModal, setShowBalanceModal] = useState<UserProfile | null>(null);
  const [balanceAdjustment, setBalanceAdjustment] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: proj } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      const { data: prof } = await supabase.from('profiles').select('*');
      const { data: trans } = await supabase.from('transactions').select('*').order('date', { ascending: false });

      if (proj) {
        setProjects(proj.map(p => ({
          ...p,
          targetAmount: p.target_amount || p.targetAmount,
          collectedAmount: p.collected_amount || p.collectedAmount,
          returnRate: p.return_rate || p.returnRate,
          imageUrl: p.image_url || p.imageUrl || 'https://images.unsplash.com/photo-1582408921715-18e7806367c1?q=80&w=1000'
        })));
      }
      if (prof) {
        setAllUsers(prof);
        const demoUser = prof.find(u => u.role !== 'admin') || prof[0];
        setCurrentUser(demoUser);
      }
      if (trans) setTransactions(trans);
    } catch (e) {
      console.error("Erreur de synchronisation", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (!showBalanceModal) return;
    const newBalance = (showBalanceModal.balance || 0) + balanceAdjustment;
    const { error } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', showBalanceModal.id);
    
    if (!error) {
      await supabase.from('transactions').insert([{
        userId: showBalanceModal.id,
        userName: showBalanceModal.name,
        amount: Math.abs(balanceAdjustment),
        type: balanceAdjustment > 0 ? 'Dépôt' : 'Retrait',
        status: 'Validé',
        date: new Date().toISOString(),
        method: 'Action Admin GESS'
      }]);
      setShowBalanceModal(null);
      setBalanceAdjustment(0);
      fetchData();
    }
  };

  const handleVerifyKYC = async (userId: string, status: 'verified' | 'rejected') => {
    await supabase.from('profiles').update({ kycStatus: status }).eq('id', userId);
    fetchData();
  };

  const renderAdminContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-fade">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900">Dashboard Admin</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Gestion globale du réseau GESS</p>
              </div>
              <button 
                onClick={() => setShowAddProjectModal(true)}
                className="bg-[#ff6b35] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#ff6b35]/20 hover:scale-105 transition-all"
              >
                + Nouveau Projet
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Collecte Totale", val: formatCFA(projects.reduce((acc, p) => acc + (p.collectedAmount || 0), 0)), color: "text-[#ff6b35]" },
                { label: "Membres GESS", val: allUsers.length, color: "text-slate-900" },
                { label: "Projets Actifs", val: projects.length, color: "text-slate-900" },
                { label: "En attente KYC", val: allUsers.filter(u => u.kycStatus === 'pending').length, color: "text-amber-500" },
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{s.label}</p>
                  <p className={`text-2xl font-black tracking-tight ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
              <DataTable title="Historique financier du réseau" data={transactions.slice(0, 10)} columns={[
                { header: 'Utilisateur', render: (t) => <span className="font-bold text-sm">{t.userName || 'Utilisateur GESS'}</span> },
                { header: 'Action', render: (t) => <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.type}</span> },
                { header: 'Montant', render: (t) => <span className={`font-black text-sm ${t.type === 'Dépôt' ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCFA(t.amount)}</span> },
                { header: 'Date', render: (t) => <span className="text-xs text-slate-400 font-bold">{new Date(t.date).toLocaleDateString()}</span> },
                { header: 'Statut', render: (t) => <StatusBadge status={t.status} /> }
              ]} />
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-6 animate-fade">
            <DataTable 
              title="Portefeuille des Membres"
              data={allUsers} columns={[
              { header: 'Nom', render: (u) => <div className="font-bold text-sm">{u.name}</div> },
              { header: 'Contact', render: (u) => <div className="text-slate-400 text-xs font-medium">{u.email}</div> },
              { header: 'Solde GESS', render: (u) => <div className="font-black text-slate-900">{formatCFA(u.balance || 0)}</div> },
              { header: 'Total Investi', render: (u) => <div className="text-slate-500 font-bold">{formatCFA(u.totalInvested || 0)}</div> },
              { header: 'Statut KYC', render: (u) => <StatusBadge status={u.kycStatus} /> },
              { header: 'Action Admin', render: (u) => (
                <button onClick={() => setShowBalanceModal(u)} className="bg-[#0d1b2a] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff6b35] transition-all">Gérer Solde</button>
              )}
            ]} />
          </div>
        );
      case 'kyc':
        return (
          <div className="space-y-6 animate-fade">
            <DataTable title="Vérifications d'identité à traiter" data={allUsers.filter(u => u.kycStatus === 'pending')} columns={[
              { header: 'Investisseur', render: (u) => <div className="font-bold text-sm">{u.name}</div> },
              { header: 'E-mail', render: (u) => <div className="text-slate-400 text-xs">{u.email}</div> },
              { header: 'Documents', render: (u) => <span className="text-[10px] font-black uppercase text-[#ff6b35]">Prêt pour examen</span> },
              { header: 'Validation', render: (u) => (
                <div className="flex gap-2">
                  <button onClick={() => handleVerifyKYC(u.id, 'verified')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Valider</button>
                  <button onClick={() => handleVerifyKYC(u.id, 'rejected')} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Rejeter</button>
                </div>
              )}
            ]} />
          </div>
        );
      case 'payouts':
        return (
          <div className="space-y-8 animate-fade text-center py-20">
             <div className="max-w-xl mx-auto bg-[#0d1b2a] p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-6 tracking-tighter uppercase italic">Cycles de Revenus</h3>
                  <p className="text-slate-400 text-sm font-medium mb-10">Cliquez pour déclencher le versement des dividendes mensuels pour tout le réseau GESS.</p>
                  <button className="bg-[#ff6b35] px-14 py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Lancer les Reversements</button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b35]/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  const renderInvestorContent = () => {
    if (selectedProject) {
      return (
        <div className="animate-fade">
          <button 
            onClick={() => setSelectedProject(null)}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Retour aux Actifs
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              <div className="rounded-[3rem] overflow-hidden h-[500px] shadow-2xl relative">
                <img src={selectedProject.imageUrl} className="w-full h-full object-cover" alt={selectedProject.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12">
                   <h2 className="text-5xl font-black text-white tracking-tighter mb-4">{selectedProject.name}</h2>
                   <div className="flex gap-4">
                      <span className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">{selectedProject.location}</span>
                      <span className="bg-[#ff6b35] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">Performance {selectedProject.returnRate}% / AN</span>
                   </div>
                </div>
              </div>
              <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-2xl font-black uppercase tracking-tight">Analyse de l'Actif Immobilier</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-medium">{selectedProject.description}</p>
                <div className="grid grid-cols-3 gap-8 pt-10 border-t">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Objectif GESS</p>
                    <p className="text-xl font-black text-slate-900">{formatCFA(selectedProject.targetAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Déjà Collecté</p>
                    <p className="text-xl font-black text-[#ff6b35]">{formatCFA(selectedProject.collectedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Horizon de l'actif</p>
                    <p className="text-xl font-black text-slate-900">{selectedProject.durationMonths} Mois</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-[#0d1b2a] text-white p-10 rounded-[3rem] shadow-2xl sticky top-8">
                <h4 className="text-xl font-black mb-10 tracking-tight uppercase italic underline decoration-[#ff6b35] decoration-4">Saisie de Part</h4>
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Votre investissement (F CFA)</label>
                    <input 
                      type="number" 
                      defaultValue="250000"
                      className="w-full bg-white/5 border border-white/10 p-6 rounded-[1.5rem] font-black text-2xl outline-none focus:border-[#ff6b35] transition-all shadow-inner text-white"
                    />
                  </div>
                  <div className="p-8 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase">
                       <span>Revenu Mensuel Estimé</span>
                       <span className="text-emerald-400">+2.500 F CFA</span>
                    </div>
                  </div>
                  <button className="w-full bg-[#ff6b35] py-7 rounded-[1.5rem] font-black text-[12px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Devenir Copropriétaire</button>
                  <p className="text-[10px] text-center text-slate-500 font-medium">Fonds sécurisé et audité par GESS INVEST.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-10 animate-fade">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#0d1b2a] rounded-[3rem] p-14 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Solde disponible GESS</p>
                    <h2 className="text-7xl font-black tracking-tighter">{formatCFA(currentUser?.balance || 0)}</h2>
                  </div>
                  <div className="mt-16 flex gap-6">
                    <button className="bg-[#ff6b35] text-white px-12 py-6 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#ff6b35]/30 hover:scale-105 transition-all">Approvisionner</button>
                    <button className="bg-white/10 text-white px-12 py-6 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all">Retrait</button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff6b35]/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
              </div>
              <div className="bg-white rounded-[3rem] p-12 border border-slate-100 flex flex-col justify-between shadow-sm">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-widest">Revenus générés</p>
                  <h3 className="text-5xl font-black text-emerald-600 tracking-tighter">{formatCFA((currentUser?.totalInvested || 0) * 0.12)}</h3>
                  <div className="mt-6 h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[70%]"></div>
                  </div>
                </div>
                <div className="pt-10 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut Membre</span>
                  <StatusBadge status={currentUser?.kycStatus || 'pending'} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
               <DataTable title="Mes opérations récentes" data={transactions.filter(t => t.userId === currentUser?.id).slice(0, 5)} columns={[
                 { header: 'Activité', render: (t) => <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.type}</span> },
                 { header: 'Montant', render: (t) => <span className={`font-black text-sm ${t.type === 'Dépôt' ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCFA(t.amount)}</span> },
                 { header: 'Date', render: (t) => <span className="text-xs text-slate-400 font-bold">{new Date(t.date).toLocaleDateString()}</span> },
                 { header: 'Statut', render: (t) => <StatusBadge status={t.status} /> }
               ]} />
            </div>
          </div>
        );
      case 'investments':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-fade">
            {projects.map(p => (
              <div 
                key={p.id} 
                onClick={() => setSelectedProject(p)}
                className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all group shadow-sm flex flex-col h-full cursor-pointer hover:-translate-y-2"
              >
                <div className="h-80 relative overflow-hidden">
                  <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" alt={p.name} />
                  <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black uppercase text-slate-900 shadow-xl">{p.location}</div>
                  <div className="absolute bottom-8 right-8 bg-[#ff6b35] text-white px-8 py-3.5 rounded-2xl text-[14px] font-black shadow-2xl">ROI {p.returnRate}% / AN</div>
                </div>
                <div className="p-12 flex-1 flex flex-col">
                  <h4 className="text-3xl font-black text-slate-900 leading-tight mb-10 tracking-tighter">{p.name}</h4>
                  <div className="mt-auto space-y-8">
                    <div className="space-y-3">
                       <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                          <span>Financement GESS</span>
                          <span className="text-slate-900">{Math.round(((p.collectedAmount || 0)/p.targetAmount)*100)}%</span>
                       </div>
                       <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                        <div className="h-full bg-[#ff6b35] rounded-full transition-all duration-[2000ms]" style={{ width: `${((p.collectedAmount || 0)/p.targetAmount)*100}%` }}></div>
                      </div>
                    </div>
                    <button className="w-full py-6 bg-[#0d1b2a] text-white rounded-[1.25rem] font-black text-[12px] uppercase tracking-widest group-hover:bg-[#ff6b35] transition-all shadow-xl">Analyser le Projet</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'simulator':
        return (
          <div className="max-w-2xl mx-auto py-10 animate-fade text-center">
            <div className="bg-white p-16 rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                <div className="w-24 h-24 bg-[#ff6b35]/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
                   <svg className="w-12 h-12 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Calculateur ROI</h3>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mb-16">Projetez vos revenus passifs GESS</p>
                <div className="space-y-16">
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-left">Capital de départ</label>
                    <div className="text-4xl font-black text-[#ff6b35] tracking-tighter">{formatCFA(simAmount)}</div>
                  </div>
                  <input type="range" min="10000" max="10000000" step="10000" value={simAmount} onChange={(e) => setSimAmount(parseInt(e.target.value))} className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#ff6b35]" />
                  <div className="bg-slate-50 p-14 rounded-[3rem] border border-slate-100 shadow-inner group">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Revenu mensuel estimé (12%/an)</p>
                    <div className="text-7xl font-black text-[#0d1b2a] tracking-tighter transition-transform group-hover:scale-110 duration-500">{formatCFA(simAmount * 0.12 / 12)}</div>
                  </div>
                </div>
            </div>
          </div>
        );
      case 'profil':
        return (
          <div className="max-w-md mx-auto py-10 space-y-10 animate-fade text-center">
             <div className="bg-white p-16 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="w-32 h-32 bg-[#0d1b2a] rounded-[3rem] mx-auto mb-8 flex items-center justify-center text-white text-5xl font-black border-4 border-white shadow-xl">
                   {currentUser?.name?.charAt(0)}
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">{currentUser?.name}</h3>
                <p className="text-slate-400 text-sm mb-12 font-bold tracking-widest uppercase">{currentUser?.email}</p>
                <StatusBadge status={currentUser?.kycStatus || 'pending'} />
             </div>
             <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
                <h4 className="text-[11px] font-black uppercase text-slate-400 mb-8 tracking-widest text-left">Documents d'Identité</h4>
                <div className="border-3 border-dashed border-slate-100 p-14 rounded-[2.5rem] text-center text-slate-400 text-xs font-black hover:border-[#ff6b35] hover:bg-[#ff6b35]/5 transition-all cursor-pointer group shadow-inner">
                   {currentUser?.kycStatus === 'verified' ? 'VÉRIFIÉ ET SÉCURISÉ' : 'TÉLÉCHARGER SCAN CNI / PASSEPORT'}
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <nav className="h-28 border-b flex items-center justify-between px-10 md:px-32 bg-white sticky top-0 z-50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#ff6b35] rounded-[1.25rem] flex items-center justify-center font-black text-white text-3xl shadow-2xl shadow-[#ff6b35]/20">G</div>
            <span className="text-4xl font-black tracking-tighter text-[#0d1b2a] uppercase italic underline decoration-[#ff6b35] decoration-4">GESS <span className="text-[#ff6b35]">INVEST</span></span>
          </div>
          <button onClick={() => setView('app')} className="bg-[#0d1b2a] text-white px-12 py-5 rounded-[1.25rem] font-black text-[12px] uppercase tracking-widest shadow-2xl hover:bg-[#ff6b35] transition-all">Accéder à la plateforme</button>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center px-10 text-center py-40 bg-[#fcfcfc]">
          <h1 className="text-[6rem] md:text-[10rem] font-black text-[#0d1b2a] tracking-tighter mb-16 leading-[0.8] animate-fade">
            Investissez au <br/><span className="text-[#ff6b35] italic">Tchad.</span>
          </h1>
          <p className="text-slate-400 text-2xl font-medium max-w-3xl mx-auto mb-20 leading-relaxed tracking-tight">
            Devenez copropriétaire d'actifs immobiliers prestigieux dès <span className="text-[#0d1b2a] font-black italic underline decoration-[#ff6b35] decoration-4">10.000 F CFA</span>.
          </p>
          <button onClick={() => setView('app')} className="bg-[#ff6b35] text-white px-20 py-8 rounded-[1.5rem] font-black text-[14px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Ouvrir un Compte GESS</button>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      userRole={userRole === 'admin' ? 'admin' : 'member'} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onGoHome={() => setView('landing')}
    >
      <div className="pb-52">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-10">
            <div className="w-20 h-20 border-[10px] border-[#ff6b35]/10 border-t-[#ff6b35] rounded-full animate-spin"></div>
            <p className="text-[12px] font-black text-[#0d1b2a] uppercase tracking-[0.6em] animate-pulse">SÉCURISATION DU RÉSEAU GESS...</p>
          </div>
        ) : (
          userRole === 'admin' ? renderAdminContent() : renderInvestorContent()
        )}
      </div>

      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 bg-[#0d1b2a]/95 backdrop-blur-3xl p-3 rounded-[3rem] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.6)] border border-white/10 z-[5000] flex gap-3 scale-90 md:scale-100">
        <button onClick={() => { setUserRole('investor'); setActiveTab('overview'); setSelectedProject(null); }} className={`px-14 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-700 ${userRole === 'investor' ? 'bg-[#ff6b35] text-white shadow-2xl shadow-[#ff6b35]/40 scale-105' : 'text-slate-500 hover:text-white'}`}>Investisseur</button>
        <button onClick={() => { setUserRole('admin'); setActiveTab('overview'); setSelectedProject(null); }} className={`px-14 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-700 ${userRole === 'admin' ? 'bg-white text-[#0d1b2a] shadow-2xl scale-105' : 'text-slate-500 hover:text-white'}`}>Admin GESS</button>
      </div>

      {showBalanceModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-8">
          <div className="bg-white w-full max-w-md rounded-[4rem] p-16 shadow-2xl animate-fade border border-slate-100">
            <h3 className="text-3xl font-black mb-10 tracking-tighter uppercase italic text-slate-900 underline decoration-[#ff6b35] decoration-4">Gestion Solde</h3>
            <div className="mb-10 p-6 bg-slate-50 rounded-3xl flex items-center gap-5 border border-slate-100 shadow-inner">
               <div className="w-14 h-14 bg-[#0d1b2a] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">{showBalanceModal.name.charAt(0)}</div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Membre du réseau</span>
                  <span className="text-lg font-black tracking-tight text-slate-900">{showBalanceModal.name}</span>
               </div>
            </div>
            <div className="space-y-6 mb-12">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Ajustement (F CFA)</label>
               <input type="number" value={balanceAdjustment} onChange={(e) => setBalanceAdjustment(Number(e.target.value))} className="w-full bg-slate-50 border-3 border-slate-100 p-7 rounded-3xl font-black text-3xl outline-none focus:border-[#ff6b35] transition-all shadow-inner text-slate-900" placeholder="0" />
            </div>
            <div className="flex gap-6">
              <button onClick={() => setShowBalanceModal(null)} className="flex-1 text-slate-400 font-black text-[12px] uppercase tracking-widest hover:text-slate-900 transition-colors">Annuler</button>
              <button onClick={handleUpdateBalance} className="flex-1 bg-[#ff6b35] text-white py-6 rounded-[1.5rem] font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-[#ff6b35]/30 hover:scale-105 active:scale-95 transition-all">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-8">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] p-16 shadow-2xl animate-fade border border-slate-100 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="mb-12">
              <h3 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 underline decoration-[#ff6b35] decoration-4">Nouvel Actif GESS</h3>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-12">
               <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">Intitulé de l'Actif</label>
                  <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold focus:border-[#ff6b35] outline-none transition-all shadow-inner" placeholder="Ex: Résidence Oasis - Bloc A" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">Objectif (F CFA)</label>
                  <input type="number" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-black text-xl focus:border-[#ff6b35] outline-none transition-all shadow-inner" placeholder="50.000.000" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">Rendement (%)</label>
                  <input type="number" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-black text-xl focus:border-[#ff6b35] outline-none transition-all shadow-inner" placeholder="12" />
               </div>
               <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">Description de l'actif</label>
                  <textarea className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-medium h-40 focus:border-[#ff6b35] outline-none transition-all shadow-inner" placeholder="Détails techniques, localisation exacte..."></textarea>
               </div>
            </div>
            <div className="flex gap-8 pt-6">
              <button onClick={() => setShowAddProjectModal(false)} className="flex-1 text-slate-400 font-black text-[12px] uppercase tracking-widest hover:text-slate-900 transition-colors">Abandonner</button>
              <button className="flex-1 bg-[#0d1b2a] text-white py-7 rounded-[1.5rem] font-black text-[12px] uppercase tracking-widest shadow-2xl hover:bg-[#ff6b35] transition-all">Publier l'Actif</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;