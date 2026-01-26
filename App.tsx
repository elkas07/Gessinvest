
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DataTable from './components/DataTable';
import { Project, UserProfile, Transaction, UserRole } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from './lib/supabase';

const formatCFA = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val).replace('XOF', 'F CFA');

const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Validé': 'bg-emerald-100 text-emerald-700',
    'En attente': 'bg-amber-100 text-amber-700',
    'Rejeté': 'bg-red-100 text-red-700',
    'Terminé': 'bg-slate-100 text-slate-700',
    'verified': 'bg-blue-100 text-blue-700 border border-blue-200',
    'pending': 'bg-amber-50 text-amber-600 border border-amber-100',
  };
  return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[status] || 'bg-slate-100 text-slate-500'}`}>{status}</span>;
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

  // Modals & Forms
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', target: 10000000, rate: 15, location: 'N\'Djamena' });

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
      console.error("Erreur de synchronisation", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    const projectData = {
      name: newProject.name,
      target_amount: newProject.target,
      return_rate: newProject.rate,
      location: newProject.location,
      status: 'active',
      collected_amount: 0,
      image_url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800'
    };
    await supabase.from('projects').insert([projectData]);
    setShowProjectModal(false);
    fetchData();
  };

  // --- RENDU ADMIN ---
  const renderAdminContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Collecte Globale", val: formatCFA(projects.reduce((acc, p) => acc + (p.collectedAmount || 0), 0)), color: "text-[#ff6b35]" },
                { label: "Membres Actifs", val: allUsers.length, color: "text-slate-900" },
                { label: "Projets en cours", val: projects.length, color: "text-emerald-600" },
                { label: "KYC à valider", val: allUsers.filter(u => u.kycStatus === 'pending').length, color: "text-amber-500" },
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <DataTable title="Dernières Transactions" data={transactions} columns={[
                  { header: 'Utilisateur', render: (t) => <span className="font-bold">{t.userName || 'Anonyme'}</span> },
                  { header: 'Type', render: (t) => <span className="text-xs font-bold uppercase">{t.type}</span> },
                  { header: 'Montant', render: (t) => <span className="font-black text-slate-900">{formatCFA(t.amount)}</span> },
                  { header: 'Statut', render: (t) => <Badge status={t.status} /> }
                ]} />
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-black uppercase mb-6 tracking-tighter">Répartition de l'épargne</h3>
                <div className="h-64 flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={[{n:'Immo',v:70}, {n:'Land',v:30}]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="v">
                         <Cell fill="#ff6b35" />
                         <Cell fill="#0d1b2a" />
                       </Pie>
                       <Tooltip />
                     </PieChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100">
              <h2 className="text-xl font-black uppercase tracking-tight">Portefeuille Immobilier</h2>
              <button onClick={() => setShowProjectModal(true)} className="bg-[#ff6b35] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#ff6b35]/20">+ Nouveau Projet</button>
            </div>
            <DataTable data={projects} columns={[
              { header: 'Projet', render: (p) => <div className="font-bold">{p.name}</div> },
              { header: 'Objectif', render: (p) => formatCFA(p.targetAmount) },
              { header: 'Collecté', render: (p) => <div className="text-emerald-600 font-bold">{Math.round((p.collectedAmount/p.targetAmount)*100)}%</div> },
              { header: 'Actions', render: (p) => (
                <div className="flex gap-4">
                  <button className="text-blue-500 font-black text-[10px] uppercase underline">Éditer</button>
                  <button onClick={async () => { if(confirm('Sûr ?')) { await supabase.from('projects').delete().eq('id', p.id); fetchData(); } }} className="text-red-500 font-black text-[10px] uppercase underline">Supprimer</button>
                </div>
              )}
            ]} />

            {showProjectModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[3000] flex items-center justify-center p-6">
                <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
                   <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Lancer un projet</h3>
                   <div className="space-y-6">
                     <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Nom du bâtiment</label>
                       <input value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 ring-[#ff6b35]" placeholder="Ex: Résidence GESS I" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Objectif (CFA)</label>
                          <input type="number" value={newProject.target} onChange={e => setNewProject({...newProject, target: parseInt(e.target.value)})} className="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">ROI (%)</label>
                          <input type="number" value={newProject.rate} onChange={e => setNewProject({...newProject, rate: parseInt(e.target.value)})} className="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold" />
                        </div>
                     </div>
                     <div className="flex gap-4 pt-6">
                       <button onClick={() => setShowProjectModal(false)} className="flex-1 py-4 font-black text-[10px] uppercase text-slate-400">Annuler</button>
                       <button onClick={handleCreateProject} className="flex-2 bg-[#0d1b2a] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Créer le projet</button>
                     </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'kyc':
        return (
          <div className="space-y-6">
             <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl text-amber-700 font-bold text-sm">
               ⚠️ {allUsers.filter(u => u.kycStatus === 'pending').length} membres attendent une vérification d'identité.
             </div>
             <DataTable title="Vérification des Documents" data={allUsers} columns={[
               { header: 'Utilisateur', render: (u) => <div className="font-bold">{u.name}</div> },
               { header: 'Email', render: (u) => <div className="text-xs text-slate-400">{u.email}</div> },
               { header: 'Document', render: () => <button className="text-blue-500 font-bold text-xs underline">Visualiser</button> },
               { header: 'Action', render: (u) => (
                 <div className="flex gap-2">
                   <button className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase">Valider</button>
                   <button className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase">Refuser</button>
                 </div>
               )}
             ]} />
          </div>
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
                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">Portefeuille Digital</p>
                    <h2 className="text-7xl font-black text-[#ff6b35] tracking-tighter mb-4">{formatCFA(currentUser?.balance || 0)}</h2>
                    <Badge status={currentUser?.kycStatus === 'verified' ? 'verified' : 'pending'} />
                  </div>
                  <div className="flex gap-4 mt-12">
                    <button className="flex-1 py-5 bg-[#ff6b35] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Approvisionner</button>
                    <button className="flex-1 py-5 bg-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5">Retrait</button>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-96 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Total des Profits ROI</p>
                  <h3 className="text-5xl font-black text-emerald-600 tracking-tighter">{formatCFA((currentUser?.totalInvested || 0) * 0.15)}</h3>
                </div>
                <div className="pt-8 border-t border-slate-50 mt-8 space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Capital Actif</span>
                    <span className="text-slate-900 font-black">{formatCFA(currentUser?.totalInvested || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Dividendes Prochains</span>
                    <span className="text-emerald-500 font-black">+ {formatCFA((currentUser?.totalInvested || 0) * 0.0125)} / mois</span>
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
                      <span>Levée de fonds</span>
                      <span className="text-slate-900 font-bold">{Math.round((p.collectedAmount/p.targetAmount)*100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ff8e53]" style={{ width: `${(p.collectedAmount/p.targetAmount)*100}%` }}></div>
                    </div>
                  </div>
                  <button className="w-full py-5 bg-[#0d1b2a] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-[#ff6b35] transition-all">Devenir Co-propriétaire</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'simulator':
        return (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 skew-x-12 translate-x-20 z-0"></div>
              <div className="flex-1 space-y-12 relative z-10">
                <h3 className="text-4xl font-black text-[#0d1b2a] uppercase tracking-tighter">Votre Projection <br/><span className="text-[#ff6b35]">Financière</span></h3>
                <div className="space-y-6">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant de l'investissement (CFA)</label>
                  <input type="range" min="10000" max="10000000" step="10000" defaultValue="1000000" className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#ff6b35]" />
                  <div className="text-4xl font-black text-[#0d1b2a]">1.000.000 F CFA</div>
                </div>
              </div>
              <div className="w-full md:w-96 bg-[#0d1b2a] p-12 rounded-[3.5rem] shadow-xl text-white flex flex-col justify-center text-center space-y-6 relative z-10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Revenus mensuels estimés</p>
                <div className="text-5xl font-black text-[#ff6b35] tracking-tighter">12.500 F</div>
                <div className="h-px bg-white/10 w-full my-4"></div>
                <p className="text-[11px] font-bold text-emerald-400">Rendement Annuel: 15%</p>
              </div>
            </div>
          </div>
        );
      case 'profil':
        return (
          <div className="max-w-4xl mx-auto space-y-10">
             <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 flex items-center gap-12">
                <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden relative group">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="text-[9px] font-black text-white uppercase">Modifier</span>
                  </div>
                </div>
                <div>
                   <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">{currentUser?.name}</h2>
                   <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">{currentUser?.email}</p>
                   <Badge status={currentUser?.kycStatus || 'none'} />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 space-y-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mes Documents KYC</h4>
                  <div className="space-y-4">
                     <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-dashed border-slate-200">
                        <span className="text-xs font-bold text-slate-500">Pièce d'Identité</span>
                        <button className="text-[#ff6b35] font-black text-[10px] uppercase">Uploader</button>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-dashed border-slate-200">
                        <span className="text-xs font-bold text-slate-500">Photo Selfie</span>
                        <button className="text-[#ff6b35] font-black text-[10px] uppercase">Prendre</button>
                     </div>
                  </div>
               </div>
               <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 space-y-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordonnées de Retrait</h4>
                  <div className="p-5 bg-blue-50 border border-blue-100 rounded-3xl flex items-center gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">🏦</div>
                     <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-blue-900">Banque / Mobile Money</p>
                        <p className="text-xs font-bold text-blue-700">Non configuré</p>
                     </div>
                     <button className="text-[10px] font-black text-blue-900 uppercase underline">Ajouter</button>
                  </div>
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
          Propulsez votre patrimoine. <br/>
          <span className="text-white">L'investissement immobilier premium au Tchad.</span>
        </p>
        <button onClick={() => setView('app')} className="bg-[#ff6b35] text-white px-16 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[#ff6b35]/20 hover:scale-110 transition-all">Ouvrir mon dashboard</button>
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Chargement sécurisé GESS...</p>
          </div>
        ) : (
          userRole === 'admin' ? renderAdminContent() : renderInvestorContent()
        )}
      </div>

      <div className="fixed bottom-10 left-10 bg-[#0d1b2a]/95 backdrop-blur-xl p-2 rounded-full shadow-3xl border border-white/10 z-[2000] flex">
        <button onClick={() => { setUserRole('investor'); setActiveTab('overview'); }} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase transition-all tracking-widest ${userRole === 'investor' ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20' : 'text-slate-500 hover:text-white'}`}>Investisseur</button>
        <button onClick={() => { setUserRole('admin'); setActiveTab('overview'); }} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase transition-all tracking-widest ${userRole === 'admin' ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20' : 'text-slate-500 hover:text-white'}`}>Gérant GESS</button>
      </div>
    </Layout>
  );
};

export default App;
