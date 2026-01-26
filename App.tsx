
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DataTable from './components/DataTable';
import { Project, UserProfile, Transaction, UserRole } from './types';
import { supabase } from './lib/supabase';

const formatCFA = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val).replace('XOF', 'F CFA');

// Composant de badge pour les statuts
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
  const [newProject, setNewProject] = useState({ name: '', target: 50000000, rate: 12, location: 'N\'Djamena' });

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
          imageUrl: p.image_url || p.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000'
        })));
      }
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
      image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000'
    };
    const { error } = await supabase.from('projects').insert([projectData]);
    if (error) alert("Erreur lors de la création");
    setShowProjectModal(false);
    fetchData();
  };

  const handleVerifyKYC = async (userId: string, status: 'verified' | 'rejected') => {
    await supabase.from('profiles').update({ kycStatus: status }).eq('id', userId);
    fetchData();
  };

  // --- VUES ADMIN ---
  const renderAdminContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-fade">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Volume total investi", val: formatCFA(projects.reduce((acc, p) => acc + (p.collectedAmount || 0), 0)) },
                { label: "Membres actifs", val: allUsers.length },
                { label: "Actifs en cours", val: projects.length },
                { label: "Dossiers KYC", val: allUsers.filter(u => u.kycStatus === 'pending').length },
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 bricks-shadow">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                  <p className="text-2xl font-black text-slate-900">{s.val}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden bricks-shadow">
              <DataTable title="Flux récents" data={transactions} columns={[
                { header: 'Utilisateur', render: (t) => <span className="font-bold text-sm text-slate-700">{t.userName || 'Membre'}</span> },
                { header: 'Montant', render: (t) => <span className="font-black text-sm text-[#ff6b35]">{formatCFA(t.amount)}</span> },
                { header: 'Type', render: (t) => <span className="text-slate-400 text-xs font-bold uppercase">{t.type}</span> },
                { header: 'Statut', render: (t) => <StatusBadge status={t.status} /> }
              ]} />
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-8 animate-fade">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Catalogue Immobilier</h2>
                <p className="text-slate-400 text-sm">Gérez les opportunités d'investissement.</p>
              </div>
              <button onClick={() => setShowProjectModal(true)} className="bg-[#ff6b35] text-white px-8 py-3.5 rounded-2xl font-black text-xs bricks-button-shadow transition-transform hover:scale-105 uppercase tracking-widest">Ajouter un bien</button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <DataTable data={projects} columns={[
                { header: 'Nom de l\'actif', render: (p) => <div className="font-black text-sm text-slate-800">{p.name}</div> },
                { header: 'Ville', render: (p) => <div className="text-slate-500 text-xs font-bold uppercase">{p.location}</div> },
                { header: 'Objectif', render: (p) => <span className="font-bold text-sm text-slate-600">{formatCFA(p.targetAmount)}</span> },
                { header: 'Financement', render: (p) => <div className="text-[#ff6b35] font-black text-sm">{Math.round(((p.collectedAmount || 0)/p.targetAmount)*100)}%</div> },
                { header: 'Gestion', render: (p) => (
                  <button onClick={async () => { if(confirm('Voulez-vous supprimer ce projet ?')) { await supabase.from('projects').delete().eq('id', p.id); fetchData(); } }} className="text-rose-500 font-black text-[10px] uppercase hover:underline tracking-widest">Supprimer</button>
                )}
              ]} />
            </div>
            {showProjectModal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[9999] flex items-center justify-center p-6">
                <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-fade">
                   <h3 className="text-2xl font-black mb-8 text-slate-900 tracking-tight">Nouvel Actif</h3>
                   <div className="space-y-5">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de l'immeuble</label>
                        <input value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#ff6b35] transition-all" placeholder="ex: Résidence des Palmiers" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objectif (CFA)</label>
                           <input type="number" value={newProject.target} onChange={e => setNewProject({...newProject, target: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#ff6b35]" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ROI Cible %</label>
                           <input type="number" value={newProject.rate} onChange={e => setNewProject({...newProject, rate: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#ff6b35]" />
                        </div>
                     </div>
                     <div className="flex gap-4 pt-6">
                       <button onClick={() => setShowProjectModal(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Annuler</button>
                       <button onClick={handleCreateProject} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#ff6b35] transition-colors">Publier l'actif</button>
                     </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'kyc':
        return (
          <div className="space-y-8 animate-fade">
             <div className="bg-white p-8 rounded-3xl border border-slate-100 bricks-shadow">
               <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Centre de Conformité</h3>
               <p className="text-slate-400 text-sm">Validez les documents d'identité pour autoriser les investissements.</p>
             </div>
             <DataTable data={allUsers.filter(u => u.kycStatus === 'pending' || u.kycStatus === 'verified' || u.kycStatus === 'rejected')} columns={[
               { header: 'Membre', render: (u) => <div className="font-black text-sm text-slate-800">{u.name}</div> },
               { header: 'E-mail', render: (u) => <div className="text-slate-400 text-xs font-medium">{u.email}</div> },
               { header: 'Statut', render: (u) => <StatusBadge status={u.kycStatus} /> },
               { header: 'Gestion', render: (u) => (
                 <div className="flex gap-2">
                   <button onClick={() => handleVerifyKYC(u.id, 'verified')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">Valider</button>
                   <button onClick={() => handleVerifyKYC(u.id, 'rejected')} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">Rejeter</button>
                 </div>
               )}
             ]} />
          </div>
        );
      default: return null;
    }
  };

  // --- VUES INVESTISSEUR ---
  const renderInvestorContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-10 animate-fade">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#0d1b2a] rounded-[2.5rem] p-12 text-white relative overflow-hidden bricks-shadow">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Solde de votre compte</p>
                    <h2 className="text-6xl font-black tracking-tighter">{formatCFA(currentUser?.balance || 0)}</h2>
                  </div>
                  <div className="mt-12 flex gap-4">
                    <button className="bg-[#ff6b35] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bricks-button-shadow hover:scale-105 transition-all">Approvisionner</button>
                    <button className="bg-white/10 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-white/20 transition-all">Retrait</button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6b35]/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 bricks-shadow flex flex-col justify-between">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase mb-2 tracking-widest">Rendements cumulés</p>
                  <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">{formatCFA((currentUser?.totalInvested || 0) * 0.12)}</h3>
                </div>
                <div className="pt-8 border-t border-slate-50 space-y-4">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>ROI Moyen GESS</span>
                    <span className="text-slate-900">+12.4% / an</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>État KYC</span>
                    <StatusBadge status={currentUser?.kycStatus || 'pending'} />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Activité du portfolio</h3>
               <div className="bg-white rounded-[2rem] border border-slate-100 bricks-shadow overflow-hidden">
                 <DataTable data={transactions.slice(0, 5)} columns={[
                    { header: 'Actif', render: (t) => <span className="font-bold text-sm text-slate-700">{t.projectName || 'Dépôt direct'}</span> },
                    { header: 'Montant', render: (t) => <span className="font-black text-sm text-slate-900">{formatCFA(t.amount)}</span> },
                    { header: 'Statut', render: (t) => <StatusBadge status={t.status} /> }
                 ]} />
               </div>
            </div>
          </div>
        );
      case 'investments':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-fade">
            {projects.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold italic">Aucune opportunité disponible actuellement.</div>
            ) : projects.map(p => (
              <div key={p.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all group bricks-shadow">
                <div className="h-64 relative overflow-hidden">
                  <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name} />
                  <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black uppercase text-slate-900 shadow-xl">{p.location}</div>
                  <div className="absolute bottom-5 right-5 bg-[#ff6b35] text-white px-5 py-2.5 rounded-2xl text-[12px] font-black shadow-2xl">{p.returnRate}% / AN</div>
                </div>
                <div className="p-10 space-y-8">
                  <h4 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{p.name}</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <span>Collecte en cours</span>
                      <span className="text-slate-900">{Math.round(((p.collectedAmount || 0)/p.targetAmount)*100)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff6b35] rounded-full transition-all duration-1000" style={{ width: `${((p.collectedAmount || 0)/p.targetAmount)*100}%` }}></div>
                    </div>
                  </div>
                  <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#ff6b35] transition-all bricks-button-shadow shadow-xl">Investir dès 10k</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'simulator':
        return (
          <div className="max-w-2xl mx-auto space-y-10 animate-fade py-10">
            <div className="bg-white p-14 rounded-[3rem] border border-slate-100 bricks-shadow flex flex-col gap-12">
              <div className="space-y-10">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Votre futur financier</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Montant de l'investissement</label>
                    <div className="text-3xl font-black text-[#ff6b35] tracking-tighter">{formatCFA(simAmount)}</div>
                  </div>
                  <input type="range" min="10000" max="10000000" step="10000" value={simAmount} onChange={(e) => setSimAmount(parseInt(e.target.value))} className="w-full h-2.5 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                </div>
              </div>
              <div className="bg-slate-50 p-10 rounded-[2.5rem] text-center space-y-8 border border-slate-100">
                <div>
                   <p className="text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">Rente mensuelle estimée (ROI 12%)</p>
                   <div className="text-6xl font-black text-[#ff6b35] tracking-tighter">{formatCFA(simAmount * 0.12 / 12)}</div>
                </div>
                <div className="pt-8 border-t border-slate-200">
                   <p className="text-sm font-bold text-slate-500">Soit un gain total de <span className="text-emerald-600 font-black">{formatCFA(simAmount * 0.12)}</span> par an.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profil':
        return (
          <div className="max-w-md mx-auto space-y-8 animate-fade py-10">
             <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 bricks-shadow flex items-center gap-10">
                <div className="w-28 h-28 bg-[#0d1b2a] rounded-[2rem] border-4 border-white shadow-2xl overflow-hidden shrink-0">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name || 'User'}`} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight truncate">{currentUser?.name || 'Investisseur'}</h2>
                   <p className="text-slate-400 text-sm font-medium mb-5 truncate">{currentUser?.email}</p>
                   <StatusBadge status={currentUser?.kycStatus || 'pending'} />
                </div>
             </div>
             <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 bricks-shadow space-y-8">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Sécurité & Documents</h4>
                <div className="p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex justify-between items-center group cursor-pointer hover:border-[#ff6b35] transition-all">
                  <div className="flex flex-col">
                    <span className="text-base font-black text-slate-800 tracking-tight">Pièce d'identité</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Uploader NNI / Passeport</span>
                  </div>
                  <div className="bg-slate-900 text-white p-4 rounded-2xl group-hover:bg-[#ff6b35] transition-colors shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  // --- RENDU LANDING ---
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <nav className="h-24 border-b flex items-center justify-between px-10 md:px-20 bg-white sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ff6b35] rounded-2xl flex items-center justify-center font-black text-white text-2xl bricks-button-shadow">G</div>
            <span className="text-2xl font-black tracking-tighter text-[#0d1b2a]">GESS <span className="text-[#ff6b35]">INVEST</span></span>
          </div>
          <div className="flex gap-8 items-center">
            <button onClick={() => setView('app')} className="text-sm font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Connexion</button>
            <button onClick={() => setView('app')} className="bg-[#ff6b35] text-white px-8 py-3.5 rounded-2xl font-black text-[11px] bricks-button-shadow hover:scale-105 transition-all uppercase tracking-[0.1em]">Ouvrir un compte</button>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-32 bg-[#fcfcfc] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none opacity-5">
             <div className="absolute top-20 left-10 w-64 h-64 bg-[#ff6b35] rounded-full blur-[100px]"></div>
             <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0d1b2a] rounded-full blur-[150px]"></div>
          </div>
          
          <h1 className="text-7xl md:text-[10rem] font-black text-[#0d1b2a] tracking-tighter mb-12 max-w-7xl leading-[0.8] animate-fade">
            Investissez <br/><span className="text-[#ff6b35]">collectif.</span>
          </h1>
          <p className="text-slate-400 text-2xl font-medium max-w-2xl mb-16 leading-relaxed">
            Devenez copropriétaire d'actifs immobiliers de prestige au Tchad dès <span className="text-[#0d1b2a] font-black">10 000 F CFA</span>.
          </p>
          <div className="flex flex-col md:flex-row gap-6 mb-24 relative z-10">
            <button onClick={() => setView('app')} className="bg-[#0d1b2a] text-white px-14 py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">Parcourir les actifs</button>
            <button onClick={() => { setView('app'); setActiveTab('simulator'); }} className="bg-white text-[#0d1b2a] border border-slate-200 px-14 py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-sm">Simuler mes gains</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl w-full">
            {[
              { t: "12% / AN", d: "Rendement moyen cible" },
              { t: "0 GESTION", d: "On s'occupe de tout" },
              { t: "MENSUEL", d: "Dividendes versés" },
            ].map((f, i) => (
              <div key={i} className="bg-white p-12 rounded-[3rem] border border-slate-100 bricks-shadow transition-transform hover:-translate-y-2 duration-500">
                <p className="text-4xl font-black text-[#0d1b2a] mb-3 tracking-tighter">{f.t}</p>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">{f.d}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="py-16 border-t text-center bg-white">
          <div className="flex flex-col items-center gap-6">
             <div className="flex items-center gap-2 opacity-30 grayscale">
               <div className="w-8 h-8 bg-slate-900 rounded-lg"></div>
               <span className="font-black tracking-tighter">GESS INVEST</span>
             </div>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">© 2024 GESS INVEST TCHAD • N'DJAMENA • GESTION IMMOBILIÈRE</p>
          </div>
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
      <div className="pb-40">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-8">
            <div className="w-16 h-16 border-[6px] border-[#ff6b35]/10 border-t-[#ff6b35] rounded-full animate-spin"></div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">GESS CONNECTION...</p>
          </div>
        ) : (
          userRole === 'admin' ? renderAdminContent() : renderInvestorContent()
        )}
      </div>

      {/* Switcher de rôle discret pour le développement/démo */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#0d1b2a]/95 backdrop-blur-xl p-2 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 z-[5000] flex gap-2">
        <button 
          onClick={() => { setUserRole('investor'); setActiveTab('overview'); }} 
          className={`px-10 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${userRole === 'investor' ? 'bg-[#ff6b35] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          Espace Investisseur
        </button>
        <button 
          onClick={() => { setUserRole('admin'); setActiveTab('overview'); }} 
          className={`px-10 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${userRole === 'admin' ? 'bg-white text-[#0d1b2a] shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          Gestion GESS
        </button>
      </div>
    </Layout>
  );
};

export default App;
