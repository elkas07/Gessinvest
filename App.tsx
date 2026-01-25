
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DataTable from './components/DataTable';
import { Project, UserProfile, Transaction, UserRole } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from './lib/supabase';

const formatCFA = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val).replace('XOF', 'F CFA');

const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Validé': 'bg-emerald-100 text-emerald-700',
    'En attente': 'bg-amber-100 text-amber-700',
    'Rejeté': 'bg-red-100 text-red-700',
    'Terminé': 'bg-slate-100 text-slate-700',
    'active': 'bg-emerald-100 text-emerald-700',
    'verified': 'bg-blue-100 text-blue-700',
    'pending': 'bg-amber-100 text-amber-700',
    'rejected': 'bg-red-500 text-white',
  };
  return <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${styles[status] || styles['En attente']}`}>{status}</span>;
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: proj } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      const { data: prof } = await supabase.from('profiles').select('*');
      const { data: trans } = await supabase.from('transactions').select('*').order('date', { ascending: false });

      if (proj) setProjects(proj);
      if (prof) {
        setAllUsers(prof);
        setCurrentUser(prof[0] || null);
      }
      if (trans) setTransactions(trans);
    } catch (e) {
      console.error("Erreur de chargement", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce projet ? Cette action est irréversible.")) {
      await supabase.from('projects').delete().eq('id', id);
      fetchData();
    }
  };

  const handleVerifyKYC = async (userId: string, status: 'verified' | 'rejected') => {
    await supabase.from('profiles').update({ kycStatus: status }).eq('id', userId);
    fetchData();
  };

  // --- RENDU ADMIN ---
  const renderAdminContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Collecte Totale", val: formatCFA(154200000), color: "text-slate-900" },
                { label: "Nouveaux Membres", val: allUsers.length, color: "text-blue-600" },
                { label: "ROI à verser", val: formatCFA(12500000), color: "text-[#ff6b35]" },
                { label: "KYC en attente", val: allUsers.filter(u => u.kycStatus === 'pending').length, color: "text-amber-600" },
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.val}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DataTable title="Derniers Mouvements" data={transactions} columns={[
                { header: 'Utilisateur', render: (t) => <span className="font-bold">{t.userName || 'Investisseur'}</span> },
                { header: 'Projet', render: (t) => <span className="text-xs">{t.projectName}</span> },
                { header: 'Montant', render: (t) => <span className="font-black text-slate-900">{formatCFA(t.amount)}</span> },
                { header: 'Statut', render: (t) => <Badge status={t.status} /> }
              ]} />
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black uppercase mb-6 tracking-tighter">Performance GESS</h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={[{n:1, v:200}, {n:2, v:450}, {n:3, v:400}, {n:4, v:800}, {n:5, v:750}, {n:6, v:1200}]}>
                       <defs>
                        <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ff6b35" stopOpacity={0}/>
                        </linearGradient>
                       </defs>
                       <Area type="monotone" dataKey="v" stroke="#ff6b35" fillOpacity={1} fill="url(#colorV)" strokeWidth={4} />
                     </AreaChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="animate-in slide-in-from-bottom-10">
            <DataTable title="Gestion des Actifs" data={projects} columns={[
              { header: 'Nom du projet', render: (p) => <div className="font-black text-slate-900">{p.name}</div> },
              { header: 'Objectif', render: (p) => <span className="font-bold">{formatCFA(p.targetAmount)}</span> },
              { header: 'ROI', render: (p) => <span className="text-emerald-600 font-black">{p.returnRate}%</span> },
              { header: 'Actions', render: (p) => (
                <div className="flex gap-4">
                  <button className="text-blue-500 font-black text-[10px] uppercase hover:underline">Modifier</button>
                  <button onClick={() => handleDeleteProject(p.id)} className="text-red-500 font-black text-[10px] uppercase hover:underline">Supprimer</button>
                </div>
              )}
            ]} />
          </div>
        );
      case 'kyc':
        return (
          <DataTable title="Vérification KYC" data={allUsers.filter(u => u.kycStatus === 'pending')} columns={[
            { header: 'Nom', render: (u) => <span className="font-bold">{u.name}</span> },
            { header: 'Email', render: (u) => <span className="text-xs text-slate-50">{u.email}</span> },
            { header: 'Document', render: () => <button className="text-blue-500 underline text-xs">Ouvrir CNI/Passeport</button> },
            { header: 'Action', render: (u) => (
              <div className="flex gap-2">
                <button onClick={() => handleVerifyKYC(u.id, 'verified')} className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg">Valider</button>
                <button onClick={() => handleVerifyKYC(u.id, 'rejected')} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg">Rejeter</button>
              </div>
            )}
          ]} />
        );
      default: return null;
    }
  };

  // --- RENDU INVESTISSEUR ---
  const renderInvestorContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 bg-gradient-to-br from-[#0d1b2a] to-[#1b263b] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6b35]/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-all group-hover:bg-[#ff6b35]/20"></div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">Capital Disponible</p>
                    <h2 className="text-7xl font-black text-[#ff6b35] tracking-tighter mb-4">{formatCFA(currentUser?.balance || 0)}</h2>
                    <Badge status={currentUser?.kycStatus === 'verified' ? 'Compte Vérifié' : 'Vérification requise'} />
                  </div>
                  <div className="flex gap-4 mt-12">
                    <button className="flex-1 py-5 bg-[#ff6b35] rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Recharger</button>
                    <button className="flex-1 py-5 bg-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5">Retirer</button>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-96 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Revenus ROI Cumulés</p>
                  <h3 className="text-5xl font-black text-emerald-600 tracking-tighter">{formatCFA((currentUser?.totalInvested || 0) * 0.15)}</h3>
                </div>
                <div className="pt-8 border-t border-slate-50 mt-8 space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Total Investi</span>
                    <span className="text-slate-900">{formatCFA(currentUser?.totalInvested || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Part de marché</span>
                    <span className="text-slate-900">0.02%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'investments':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-5">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-[3.5rem] overflow-hidden shadow-lg border border-slate-50 group hover:shadow-2xl transition-all duration-500">
                <div className="h-72 relative">
                  <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name} />
                  <div className="absolute top-6 left-6 bg-[#0d1b2a]/80 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{p.location}</div>
                  <div className="absolute bottom-6 right-6 bg-[#ff6b35] text-white px-5 py-2 rounded-xl font-black text-xs shadow-xl">{p.returnRate}% ROI/AN</div>
                </div>
                <div className="p-10 space-y-8">
                  <h4 className="text-2xl font-black text-[#0d1b2a] uppercase tracking-tighter">{p.name}</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[11px] font-black uppercase text-slate-400">
                      <span>Progression</span>
                      <span className="text-slate-900">{Math.round((p.collectedAmount/p.targetAmount)*100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-[#ff6b35] rounded-full" style={{ width: `${(p.collectedAmount/p.targetAmount)*100}%` }}></div>
                    </div>
                  </div>
                  <button className="w-full py-5 bg-[#0d1b2a] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-[#ff6b35] transition-all">S'associer au projet</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'profil':
        return (
          <div className="max-w-4xl mx-auto bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100 space-y-12">
             <div className="flex items-center gap-10">
               <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden">
                 <img src="https://picsum.photos/200/200?random=42" className="w-full h-full object-cover" />
               </div>
               <div>
                 <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{currentUser?.name}</h3>
                 <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{currentUser?.email}</p>
                 <div className="mt-4"><Badge status={currentUser?.kycStatus || 'none'} /></div>
               </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vérification d'identité</h4>
                 <div className="flex flex-col gap-4">
                   <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                     <span className="text-sm font-bold">Pièce d'identité</span>
                     <button className="text-[10px] font-black text-[#ff6b35] uppercase">Uploader</button>
                   </div>
                   <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                     <span className="text-sm font-bold">Justificatif de domicile</span>
                     <button className="text-[10px] font-black text-[#ff6b35] uppercase">Uploader</button>
                   </div>
                 </div>
               </div>
               <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sécurité</h4>
                 <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0d1b2a] hover:text-white transition-all">Changer mon mot de passe</button>
                 <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 border-red-100">Désactiver mon compte</button>
               </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#0d1b2a] flex flex-col items-center justify-center p-10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#ff6b35]/10 rounded-full blur-[150px] -mt-[400px]"></div>
        <div className="w-24 h-24 bg-[#ff6b35] rounded-[2rem] flex items-center justify-center font-black text-5xl text-white mb-12 shadow-3xl shadow-[#ff6b35]/30">G</div>
        <h1 className="text-7xl md:text-[120px] font-black text-white leading-none tracking-tighter uppercase mb-6 text-center">
          GESS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-white">INVEST</span>
        </h1>
        <p className="text-slate-400 font-bold text-2xl max-w-2xl mb-16 text-center leading-relaxed">
          Le futur de l'immobilier tchadien commence ici. <br/>
          <span className="text-white">Sécurisé. Rentable. Transparent.</span>
        </p>
        <button onClick={() => setView('app')} className="bg-[#ff6b35] text-white px-16 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[#ff6b35]/20 hover:scale-110 transition-all">Lancer la plateforme</button>
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
      <div className="pb-24 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-6">
            <div className="w-16 h-16 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Connexion GESS INVEST sécurisée...</p>
          </div>
        ) : (
          userRole === 'admin' ? renderAdminContent() : renderInvestorContent()
        )}
      </div>

      <div className="fixed bottom-10 left-10 bg-[#0d1b2a]/90 backdrop-blur-xl p-2 rounded-full shadow-3xl border border-white/10 z-[2000] flex">
        <button onClick={() => { setUserRole('investor'); setActiveTab('overview'); }} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase transition-all tracking-widest ${userRole === 'investor' ? 'bg-[#ff6b35] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Investisseur</button>
        <button onClick={() => { setUserRole('admin'); setActiveTab('overview'); }} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase transition-all tracking-widest ${userRole === 'admin' ? 'bg-[#ff6b35] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>GESS Admin</button>
      </div>
    </Layout>
  );
};

export default App;
