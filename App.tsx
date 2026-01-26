
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DataTable from './components/DataTable';
import { Project, UserProfile, Transaction, UserRole } from './types';
import { supabase } from './lib/supabase';

const formatCFA = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val).replace('XOF', 'F CFA');

// Composant Badge stylisé
const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Validé': 'bg-green-50 text-green-700 border-green-100',
    'En attente': 'bg-orange-50 text-orange-700 border-orange-100',
    'Rejeté': 'bg-red-50 text-red-700 border-red-100',
    'verified': 'bg-blue-50 text-blue-700 border-blue-100',
    'pending': 'bg-amber-50 text-amber-700 border-amber-100',
    'active': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-tight ${styles[status] || 'bg-gray-50 text-gray-500'}`}>
      {status === 'verified' ? 'Vérifié' : status === 'pending' ? 'Attente' : status}
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

  const [simAmount, setSimAmount] = useState(1000000);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', target: 10000000, rate: 12, location: 'N\'Djamena' });

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
          imageUrl: p.image_url || p.imageUrl
        })));
      }
      if (prof) {
        setAllUsers(prof);
        setCurrentUser(prof[0] || null);
      }
      if (trans) setTransactions(trans);
    } catch (e) {
      console.error("Erreur Supabase", e);
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
      image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000'
    };
    await supabase.from('projects').insert([projectData]);
    setShowProjectModal(false);
    fetchData();
  };

  const handleVerifyKYC = async (userId: string, status: 'verified' | 'rejected') => {
    await supabase.from('profiles').update({ kycStatus: status }).eq('id', userId);
    fetchData();
  };

  const renderAdminContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fade">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Collecte Totale", val: formatCFA(projects.reduce((acc, p) => acc + (p.collectedAmount || 0), 0)) },
                { label: "Investisseurs", val: allUsers.length },
                { label: "Projets Actifs", val: projects.length },
                { label: "KYC à valider", val: allUsers.filter(u => u.kycStatus === 'pending').length },
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 bricks-shadow">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-xl font-black text-slate-900">{s.val}</p>
                </div>
              ))}
            </div>
            <DataTable title="Dernières Transactions" data={transactions} columns={[
              { header: 'Utilisateur', render: (t) => <span className="font-bold text-sm text-slate-700">{t.userName || 'Investisseur'}</span> },
              { header: 'Montant', render: (t) => <span className="font-bold text-sm text-[#ff6b35]">{formatCFA(t.amount)}</span> },
              { header: 'Date', render: (t) => <span className="text-slate-400 text-xs">{new Date(t.date).toLocaleDateString()}</span> },
              { header: 'Statut', render: (t) => <Badge status={t.status} /> }
            ]} />
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-6 animate-fade">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Gestion Immobilière</h2>
              <button onClick={() => setShowProjectModal(true)} className="bg-[#ff6b35] text-white px-6 py-2.5 rounded-xl font-bold text-xs bricks-button-shadow transition-transform hover:scale-105">Nouveau Projet</button>
            </div>
            <DataTable data={projects} columns={[
              { header: 'Bien', render: (p) => <div className="font-bold text-sm">{p.name}</div> },
              { header: 'Lieu', render: (p) => <div className="text-slate-500 text-sm">{p.location}</div> },
              { header: 'Objectif', render: (p) => <span className="font-semibold text-sm">{formatCFA(p.targetAmount)}</span> },
              { header: 'Progression', render: (p) => <div className="text-[#ff6b35] font-black text-sm">{Math.round(((p.collectedAmount || 0)/p.targetAmount)*100)}%</div> },
              { header: 'Actions', render: (p) => (
                <button onClick={async () => { if(confirm('Supprimer ce projet ?')) { await supabase.from('projects').delete().eq('id', p.id); fetchData(); } }} className="text-red-500 font-bold text-[10px] uppercase hover:underline">Supprimer</button>
              )}
            ]} />
            {showProjectModal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
                <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-fade">
                   <h3 className="text-xl font-bold mb-6">Ajouter un actif</h3>
                   <div className="space-y-4">
                     <input value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm outline-none focus:border-[#ff6b35]" placeholder="Nom de l'immeuble" />
                     <div className="grid grid-cols-2 gap-4">
                        <input type="number" value={newProject.target} onChange={e => setNewProject({...newProject, target: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm outline-none" placeholder="CFA" />
                        <input type="number" value={newProject.rate} onChange={e => setNewProject({...newProject, rate: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm outline-none" placeholder="ROI %" />
                     </div>
                     <div className="flex gap-4 pt-4">
                       <button onClick={() => setShowProjectModal(false)} className="flex-1 py-3 text-slate-400 font-bold text-xs uppercase">Annuler</button>
                       <button onClick={handleCreateProject} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs uppercase">Publier</button>
                     </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'kyc':
        return (
          <div className="space-y-6 animate-fade">
             <DataTable title="Vérification des Comptes" data={allUsers.filter(u => u.kycStatus === 'pending' || u.kycStatus === 'verified')} columns={[
               { header: 'Utilisateur', render: (u) => <div className="font-bold text-sm">{u.name}</div> },
               { header: 'Statut', render: (u) => <Badge status={u.kycStatus} /> },
               { header: 'Actions', render: (u) => (
                 <div className="flex gap-2">
                   <button onClick={() => handleVerifyKYC(u.id, 'verified')} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase">Valider</button>
                   <button onClick={() => handleVerifyKYC(u.id, 'rejected')} className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase">Rejeter</button>
                 </div>
               )}
             ]} />
          </div>
        );
      default: return null;
    }
  };

  const renderInvestorContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-fade">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#0d1b2a] rounded-[2rem] p-10 text-white relative overflow-hidden bricks-shadow">
                <div className="relative z-10">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Valeur du portefeuille</p>
                  <h2 className="text-6xl font-black tracking-tighter">{formatCFA(currentUser?.balance || 0)}</h2>
                  <div className="mt-8 flex gap-3">
                    <button className="bg-[#ff6b35] text-white px-8 py-3.5 rounded-xl font-bold text-xs bricks-button-shadow hover:scale-105 transition-all">Approvisionner</button>
                    <button className="bg-white/10 text-white px-8 py-3.5 rounded-xl font-bold text-xs border border-white/5 hover:bg-white/20">Retirer</button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b35]/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
              </div>
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 bricks-shadow flex flex-col justify-between">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Dividendes versés</p>
                  <h3 className="text-4xl font-black text-emerald-600">{formatCFA((currentUser?.totalInvested || 0) * 0.12)}</h3>
                </div>
                <div className="pt-6 border-t border-slate-50 space-y-3">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Performance GESS</span>
                    <span className="text-slate-900">+12.4% / an</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Compte</span>
                    <Badge status={currentUser?.kycStatus || 'pending'} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'investments':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all group bricks-shadow">
                <div className="h-56 relative overflow-hidden">
                  <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase text-slate-900">{p.location}</div>
                  <div className="absolute bottom-4 right-4 bg-[#ff6b35] text-white px-4 py-2 rounded-xl text-[11px] font-black shadow-lg">{p.returnRate}% / AN</div>
                </div>
                <div className="p-8 space-y-6">
                  <h4 className="text-xl font-bold text-slate-900 leading-tight">{p.name}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                      <span>Collecte</span>
                      <span className="text-slate-900 font-black">{Math.round(((p.collectedAmount || 0)/p.targetAmount)*100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff6b35] rounded-full transition-all duration-1000" style={{ width: `${((p.collectedAmount || 0)/p.targetAmount)*100}%` }}></div>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#ff6b35] transition-colors bricks-button-shadow">Investir maintenant</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'simulator':
        return (
          <div className="max-w-xl mx-auto space-y-8 animate-fade py-10">
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 bricks-shadow flex flex-col gap-10">
              <div className="space-y-8">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Simulateur de revenus</h3>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital investi</label>
                  <input type="range" min="10000" max="10000000" step="10000" value={simAmount} onChange={(e) => setSimAmount(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-[#ff6b35] cursor-pointer" />
                  <div className="text-4xl font-black text-slate-900 tracking-tighter">{formatCFA(simAmount)}</div>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Dividendes mensuels</p>
                <div className="text-5xl font-black text-[#ff6b35] tracking-tighter">{formatCFA(simAmount * 0.12 / 12)}</div>
              </div>
            </div>
          </div>
        );
      case 'profil':
        return (
          <div className="max-w-md mx-auto space-y-6 animate-fade py-10">
             <div className="bg-white p-10 rounded-[2rem] border border-slate-100 bricks-shadow flex items-center gap-8">
                <div className="w-24 h-24 bg-[#0d1b2a] rounded-3xl border-4 border-white shadow-xl overflow-hidden shrink-0">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                   <h2 className="text-2xl font-bold text-slate-900 truncate">{currentUser?.name}</h2>
                   <p className="text-slate-400 text-xs mb-4 truncate">{currentUser?.email}</p>
                   <Badge status={currentUser?.kycStatus || 'pending'} />
                </div>
             </div>
             <div className="bg-white p-10 rounded-[2rem] border border-slate-100 bricks-shadow space-y-6">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Identité & Sécurité</h4>
                <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex justify-between items-center group cursor-pointer hover:border-[#ff6b35] transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">Pièce d'identité</span>
                    <span className="text-[9px] text-slate-400 uppercase font-black">Charger mon document</span>
                  </div>
                  <div className="bg-slate-900 text-white p-3 rounded-xl group-hover:bg-[#ff6b35] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
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
      <div className="min-h-screen bg-white flex flex-col">
        <nav className="h-20 border-b flex items-center justify-between px-8 md:px-16 bg-white sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center font-black text-white text-xl bricks-button-shadow">G</div>
            <span className="text-xl font-black tracking-tight text-[#0d1b2a]">GESS <span className="text-[#ff6b35]">INVEST</span></span>
          </div>
          <div className="flex gap-6 items-center">
            <button onClick={() => setView('app')} className="text-sm font-bold text-slate-500 hover:text-slate-900">Se connecter</button>
            <button onClick={() => setView('app')} className="bg-[#ff6b35] text-white px-7 py-2.5 rounded-xl font-bold text-xs bricks-button-shadow hover:scale-105 transition-all uppercase">Rejoindre GESS</button>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24 bg-[#fcfcfc]">
          <h1 className="text-6xl md:text-8xl font-black text-[#0d1b2a] tracking-tighter mb-8 max-w-5xl leading-[0.9]">
            L'immobilier rentable <br/><span className="text-[#ff6b35]">en un clic.</span>
          </h1>
          <p className="text-slate-400 text-xl font-medium max-w-xl mb-12 leading-relaxed">
            Devenez copropriétaire d'actifs prestigieux au Tchad dès 10.000 F CFA.
          </p>
          <div className="flex flex-col md:flex-row gap-4 mb-20">
            <button onClick={() => setView('app')} className="bg-[#0d1b2a] text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">Explorer le catalogue</button>
            <button onClick={() => { setView('app'); setActiveTab('simulator'); }} className="bg-white text-[#0d1b2a] border border-slate-200 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Calculer mes dividendes</button>
          </div>
        </div>

        <footer className="py-12 border-t text-center bg-white">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">© 2024 GESS INVEST TCHAD • N'DJAMENA • GESTION IMMOBILIÈRE</p>
        </footer>
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
      <div className="pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
            <div className="w-14 h-14 border-4 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chargement sécurisé...</p>
          </div>
        ) : (
          userRole === 'admin' ? renderAdminContent() : renderInvestorContent()
        )}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0d1b2a]/95 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-white/10 z-[5000] flex gap-1">
        <button onClick={() => { setUserRole('investor'); setActiveTab('overview'); }} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRole === 'investor' ? 'bg-[#ff6b35] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Côté Client</button>
        <button onClick={() => { setUserRole('admin'); setActiveTab('overview'); }} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRole === 'admin' ? 'bg-white text-[#0d1b2a] shadow-lg' : 'text-slate-400 hover:text-white'}`}>Côté GESS</button>
      </div>
    </Layout>
  );
};

export default App;
