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
        setCurrentUser(prof.find(u => u.role !== 'admin') || prof[0]);
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
        amount: balanceAdjustment,
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Capitaux Collectés", val: formatCFA(projects.reduce((acc, p) => acc + (p.collectedAmount || 0), 0)) },
                { label: "Membres GESS", val: allUsers.length },
                { label: "Projets Actifs", val: projects.length },
                { label: "Dossiers KYC", val: allUsers.filter(u => u.kycStatus === 'pending').length },
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-[#ff6b35]/30 transition-colors">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{s.val}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <DataTable title="Flux récents du réseau" data={transactions.slice(0, 10)} columns={[
                { header: 'Investisseur', render: (t) => <span className="font-bold text-sm">{t.userName || 'Membre GESS'}</span> },
                { header: 'Montant', render: (t) => <span className={`font-black text-sm ${t.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCFA(t.amount)}</span> },
                { header: 'Type', render: (t) => <span className="text-[10px] font-black uppercase text-slate-400">{t.type}</span> },
                { header: 'Statut', render: (t) => <StatusBadge status={t.status} /> }
              ]} />
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-6 animate-fade">
            <DataTable data={allUsers} columns={[
              { header: 'Nom Complet', render: (u) => <div className="font-bold text-sm">{u.name}</div> },
              { header: 'Solde Client', render: (u) => <div className="font-black text-slate-900">{formatCFA(u.balance || 0)}</div> },
              { header: 'Statut', render: (u) => <StatusBadge status={u.accountStatus || 'active'} /> },
              { header: 'Actions', render: (u) => (
                <button onClick={() => setShowBalanceModal(u)} className="bg-[#0d1b2a] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff6b35] transition-all">Gérer Solde</button>
              )}
            ]} />
          </div>
        );
      case 'kyc':
        return (
          <div className="space-y-6 animate-fade">
            <DataTable title="Dossiers de vérification d'identité" data={allUsers.filter(u => u.kycStatus === 'pending')} columns={[
              { header: 'Membre', render: (u) => <div className="font-bold text-sm">{u.name}</div> },
              { header: 'E-mail enregistré', render: (u) => <div className="text-slate-400 text-xs font-medium">{u.email}</div> },
              { header: 'Décision', render: (u) => (
                <div className="flex gap-2">
                  <button onClick={() => handleVerifyKYC(u.id, 'verified')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Approuver</button>
                  <button onClick={() => handleVerifyKYC(u.id, 'rejected')} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Rejeter</button>
                </div>
              )}
            ]} />
          </div>
        );
      case 'payouts':
        return (
          <div className="space-y-8 animate-fade">
             <div className="bg-[#0d1b2a] p-12 rounded-[3rem] text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-2 tracking-tighter uppercase italic">Distributions ROI</h3>
                  <p className="text-slate-500 text-sm font-medium">Lancez les reversements mensuels pour tous les investisseurs.</p>
                </div>
                <button className="bg-[#ff6b35] px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all relative z-10">Lancer Cycle Mensuel</button>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b35]/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Prochaine Échéance</h4>
                 <div className="flex justify-between items-end">
                    <span className="text-xl font-bold">15 Février 2024</span>
                    <span className="text-[#ff6b35] font-black">Dans 12 jours</span>
                 </div>
               </div>
               <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Volume estimé</h4>
                 <div className="flex justify-between items-end">
                    <span className="text-xl font-bold">{formatCFA(2450000)}</span>
                    <span className="text-emerald-500 font-black">+4.5% vs Janv</span>
                 </div>
               </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  const renderInvestorContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-10 animate-fade">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#0d1b2a] rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Capital disponible pour réinvestir</p>
                    <h2 className="text-7xl font-black tracking-tighter">{formatCFA(currentUser?.balance || 0)}</h2>
                  </div>
                  <div className="mt-14 flex gap-4">
                    <button className="bg-[#ff6b35] text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Approvisionner</button>
                    <button className="bg-white/10 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-white/5 hover:bg-white/20">Demander Retrait</button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff6b35]/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 flex flex-col justify-between shadow-sm">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase mb-2 tracking-widest">Dividendes déjà perçus</p>
                  <h3 className="text-5xl font-black text-emerald-600 tracking-tighter">{formatCFA((currentUser?.totalInvested || 0) * 0.12)}</h3>
                  <div className="mt-4 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[65%]"></div>
                  </div>
                </div>
                <div className="pt-10 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compte vérifié</span>
                  <StatusBadge status={currentUser?.kycStatus || 'pending'} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'investments':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-fade">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all group shadow-sm flex flex-col h-full">
                <div className="h-72 relative overflow-hidden">
                  <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" alt={p.name} />
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black uppercase text-slate-900 shadow-xl border border-white/10">{p.location}</div>
                  <div className="absolute bottom-6 right-6 bg-[#ff6b35] text-white px-6 py-3 rounded-2xl text-[14px] font-black shadow-2xl">{p.returnRate}% / AN</div>
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <h4 className="text-2xl font-black text-slate-900 leading-tight mb-8 tracking-tight">{p.name}</h4>
                  <div className="mt-auto space-y-6">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                          <span>Financement</span>
                          <span className="text-slate-900">{Math.round(((p.collectedAmount || 0)/p.targetAmount)*100)}%</span>
                       </div>
                       <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-[#ff6b35] rounded-full transition-all duration-1000" style={{ width: `${((p.collectedAmount || 0)/p.targetAmount)*100}%` }}></div>
                      </div>
                    </div>
                    <button className="w-full py-5 bg-[#0d1b2a] text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:bg-[#ff6b35] transition-all shadow-xl hover:scale-[1.02]">Investir maintenant</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'returns':
        return (
          <div className="space-y-8 animate-fade">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
              <div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Relevé de vos Dividendes</h2>
                 <p className="text-slate-400 text-sm font-medium italic">Tous les gains sont crédités sur votre solde disponible.</p>
              </div>
              <button className="bg-slate-50 text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-slate-200">Exporter PDF</button>
            </div>
            <DataTable data={transactions.filter(t => t.type === 'Dépôt' && t.method === 'ROI Payout')} columns={[
              { header: 'Actif Immobilier', render: (t) => <span className="font-bold">{t.projectName || 'Actif GESS'}</span> },
              { header: 'Rendement Versé', render: (t) => <span className="font-black text-emerald-600">+{formatCFA(t.amount)}</span> },
              { header: 'Date de Valeur', render: (t) => <span className="text-slate-400 font-medium">{new Date(t.date).toLocaleDateString()}</span> }
            ]} />
          </div>
        );
      case 'simulator':
        return (
          <div className="max-w-2xl mx-auto py-10 animate-fade text-center">
            <div className="bg-white p-14 rounded-[3.5rem] border border-slate-100 shadow-2xl">
                <div className="w-20 h-20 bg-[#ff6b35]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                   <svg className="w-10 h-10 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Calculateur de Rendement</h3>
                <p className="text-slate-400 font-medium mb-12">Simulez votre avenir financier avec l'immobilier.</p>
                <div className="space-y-12">
                  <div className="flex justify-between items-end">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-left">Votre investissement</label>
                    <div className="text-3xl font-black text-[#ff6b35] tracking-tighter">{formatCFA(simAmount)}</div>
                  </div>
                  <input type="range" min="10000" max="10000000" step="10000" value={simAmount} onChange={(e) => setSimAmount(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                  <div className="bg-slate-50 p-12 rounded-[2.5rem] border border-slate-100 shadow-inner relative overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest relative z-10">Revenu mensuel estimé (12%/an)</p>
                    <div className="text-6xl font-black text-[#0d1b2a] tracking-tighter relative z-10">{formatCFA(simAmount * 0.12 / 12)}</div>
                    <div className="absolute bottom-0 right-0 p-6 opacity-5 rotate-12">
                       <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        );
      case 'profil':
        return (
          <div className="max-w-md mx-auto py-10 space-y-8 animate-fade text-center">
             <div className="bg-white p-14 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="w-24 h-24 bg-[#0d1b2a] rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center text-white text-4xl font-black shadow-2xl relative z-10">
                   {currentUser?.name?.charAt(0)}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1 relative z-10 tracking-tight">{currentUser?.name}</h3>
                <p className="text-slate-400 text-sm mb-10 relative z-10 font-medium tracking-wide">{currentUser?.email}</p>
                <div className="relative z-10">
                  <StatusBadge status={currentUser?.kycStatus || 'pending'} />
                </div>
                <div className="absolute top-0 left-0 w-24 h-24 bg-slate-50 rounded-full -ml-12 -mt-12 opacity-50"></div>
             </div>
             <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-[11px] font-black uppercase text-slate-400 mb-6 tracking-widest text-left">Document d'identité</h4>
                <div className="border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center text-slate-400 text-xs font-bold hover:border-[#ff6b35] hover:bg-[#ff6b35]/5 transition-all cursor-pointer group flex flex-col items-center">
                   <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#ff6b35]/10 transition-all">
                      <svg className="w-7 h-7 group-hover:text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                   </div>
                   {currentUser?.kycStatus === 'verified' ? 'Identité Validée' : 'Envoyer un Scan (CNI / Passeport)'}
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
        <nav className="h-24 border-b flex items-center justify-between px-10 md:px-24 bg-white sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ff6b35] rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-[#ff6b35]/20">G</div>
            <span className="text-3xl font-black tracking-tighter text-[#0d1b2a] uppercase">GESS <span className="text-[#ff6b35]">INVEST</span></span>
          </div>
          <button onClick={() => setView('app')} className="bg-[#ff6b35] text-white px-10 py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.1em] shadow-2xl shadow-[#ff6b35]/30 hover:scale-105 transition-all">Connexion</button>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-32 bg-[#fcfcfc] relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-[5rem] md:text-[9rem] font-black text-[#0d1b2a] tracking-tighter mb-12 leading-[0.75] animate-fade">
              L'immo au <br/><span className="text-[#ff6b35]">Tchad</span> pour tous.
            </h1>
            <p className="text-slate-400 text-2xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
              Investissez dès <span className="text-[#0d1b2a] font-black underline decoration-[#ff6b35] decoration-4">10.000 F CFA</span> dans des projets de construction prestigieux et recevez vos dividendes chaque mois.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <button onClick={() => setView('app')} className="bg-[#0d1b2a] text-white px-16 py-7 rounded-3xl font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all">Découvrir les actifs</button>
              <button className="bg-white text-[#0d1b2a] px-16 py-7 rounded-3xl font-black text-[13px] uppercase tracking-[0.2em] border-2 border-[#0d1b2a] hover:bg-slate-50 transition-all">Comment ça marche ?</button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-50/50 to-transparent -z-10"></div>
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
      <div className="pb-40">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-8">
            <div className="w-16 h-16 border-[8px] border-[#ff6b35]/5 border-t-[#ff6b35] rounded-full animate-spin"></div>
            <p className="text-[12px] font-black text-[#0d1b2a] uppercase tracking-[0.5em] animate-pulse">Synchronisation Réseau GESS...</p>
          </div>
        ) : (
          userRole === 'admin' ? renderAdminContent() : renderInvestorContent()
        )}
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-[#0d1b2a]/95 backdrop-blur-2xl p-2.5 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 z-[5000] flex gap-2">
        <button onClick={() => { setUserRole('investor'); setActiveTab('overview'); }} className={`px-12 py-5 rounded-[1.75rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${userRole === 'investor' ? 'bg-[#ff6b35] text-white shadow-xl shadow-[#ff6b35]/20' : 'text-slate-500 hover:text-white'}`}>Investisseur</button>
        <button onClick={() => { setUserRole('admin'); setActiveTab('overview'); }} className={`px-12 py-5 rounded-[1.75rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${userRole === 'admin' ? 'bg-white text-[#0d1b2a] shadow-xl' : 'text-slate-500 hover:text-white'}`}>Admin GESS</button>
      </div>

      {showBalanceModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9999] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] animate-fade border border-slate-100">
            <h3 className="text-2xl font-black mb-8 tracking-tighter uppercase">Ajuster Solde Client</h3>
            <div className="mb-8 p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
               <div className="w-10 h-10 bg-[#0d1b2a] rounded-xl flex items-center justify-center text-white font-black">{showBalanceModal.name.charAt(0)}</div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Membre</span>
                  <span className="text-sm font-bold">{showBalanceModal.name}</span>
               </div>
            </div>
            <div className="space-y-4 mb-10">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Montant à ajouter/retirer</label>
               <input type="number" value={balanceAdjustment} onChange={(e) => setBalanceAdjustment(Number(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-black text-xl outline-none focus:border-[#ff6b35] transition-all shadow-inner" placeholder="Ex: 500000" />
               <p className="text-[10px] text-slate-400 font-medium">*Utilisez un signe négatif (-) pour un retrait manuel.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowBalanceModal(null)} className="flex-1 text-slate-400 font-black text-[12px] uppercase tracking-widest hover:text-slate-900 transition-colors">Annuler</button>
              <button onClick={handleUpdateBalance} className="flex-1 bg-[#ff6b35] text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-[#ff6b35]/20 hover:scale-105 transition-all">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;