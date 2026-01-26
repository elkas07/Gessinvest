
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DataTable from './components/DataTable';
import { Project, UserProfile, Transaction, UserRole } from './types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from './lib/supabase';

const formatCFA = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val).replace('XOF', 'F CFA');

// Composant Badge style Bricks
const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Validé': 'bg-green-50 text-green-700 border-green-100',
    'En attente': 'bg-orange-50 text-orange-700 border-orange-100',
    'Rejeté': 'bg-red-50 text-red-700 border-red-100',
    'verified': 'bg-blue-50 text-blue-700 border-blue-100',
    'pending': 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight ${styles[status] || 'bg-gray-50 text-gray-500'}`}>
      {status === 'verified' ? 'Vérifié' : status === 'pending' ? 'En attente' : status}
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

  // Simulation gains
  const [simAmount, setSimAmount] = useState(1000000);

  // Modals Admin
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

  // --- RENDU ADMIN (STYLE BRICKS) ---
  const renderAdminContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Volume d'Investissement", val: formatCFA(projects.reduce((acc, p) => acc + (p.collectedAmount || 0), 0)), sub: "Collecté à ce jour" },
                { label: "Membres GESS", val: allUsers.length, sub: "Inscrits sur la plateforme" },
                { label: "Biens en ligne", val: projects.length, sub: "Opportunités actives" },
                { label: "Alertes KYC", val: allUsers.filter(u => u.kycStatus === 'pending').length, sub: "Vérifications requises" },
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-slate-900">{s.val}</p>
                  <p className="text-[10px] text-slate-400 mt-2">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
               <DataTable title="Dernières Activités" data={transactions} columns={[
                 { header: 'Utilisateur', render: (t) => <span className="font-semibold">{t.userName || 'Investisseur'}</span> },
                 { header: 'Montant', render: (t) => <span className="font-bold">{formatCFA(t.amount)}</span> },
                 { header: 'Date', render: (t) => <span className="text-slate-500 text-sm">{new Date(t.date).toLocaleDateString()}</span> },
                 { header: 'Statut', render: (t) => <Badge status={t.status} /> }
               ]} />
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Gestion des Biens</h2>
              <button onClick={() => setShowProjectModal(true)} className="bg-[#ff6b35] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#e85a2a] transition-colors shadow-lg shadow-orange-500/20">Ajouter un bien</button>
            </div>
            <DataTable data={projects} columns={[
              { header: 'Nom du Projet', render: (p) => <div className="font-bold">{p.name}</div> },
              { header: 'Localisation', render: (p) => <div className="text-slate-500">{p.location}</div> },
              { header: 'Objectif', render: (p) => <span className="font-semibold">{formatCFA(p.targetAmount)}</span> },
              { header: 'Collecté', render: (p) => <div className="text-orange-600 font-bold">{Math.round((p.collectedAmount/p.targetAmount)*100)}%</div> },
              { header: 'Action', render: (p) => (
                <button onClick={async () => { if(confirm('Supprimer ce projet ?')) { await supabase.from('projects').delete().eq('id', p.id); fetchData(); } }} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase underline">Supprimer</button>
              )}
            ]} />

            {showProjectModal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[3000] flex items-center justify-center p-6">
                <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl animate-in zoom-in-95">
                   <h3 className="text-2xl font-bold mb-6">Nouveau Bien Immobilier</h3>
                   <div className="space-y-5">
                     <input value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-orange-500" placeholder="Nom du projet" />
                     <div className="grid grid-cols-2 gap-4">
                        <input type="number" value={newProject.target} onChange={e => setNewProject({...newProject, target: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none" placeholder="Objectif CFA" />
                        <input type="number" value={newProject.rate} onChange={e => setNewProject({...newProject, rate: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none" placeholder="ROI %" />
                     </div>
                     <div className="flex gap-4 mt-6">
                       <button onClick={() => setShowProjectModal(false)} className="flex-1 py-3 text-slate-500 font-bold text-sm">Annuler</button>
                       <button onClick={handleCreateProject} className="flex-2 bg-[#ff6b35] text-white px-8 py-3 rounded-xl font-bold text-sm">Publier le bien</button>
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
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="text-lg font-bold">Validation des Identités</h3>
               <p className="text-slate-400 text-sm">Vérifiez les documents pour activer les retraits.</p>
             </div>
             <DataTable data={allUsers.filter(u => u.kycStatus === 'pending' || u.kycStatus === 'verified')} columns={[
               { header: 'Utilisateur', render: (u) => <div className="font-bold">{u.name}</div> },
               { header: 'Statut', render: (u) => <Badge status={u.kycStatus} /> },
               { header: 'Actions', render: (u) => (
                 <div className="flex gap-3">
                   <button onClick={() => handleVerifyKYC(u.id, 'verified')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase">Approuver</button>
                   <button onClick={() => handleVerifyKYC(u.id, 'rejected')} className="bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase">Rejeter</button>
                 </div>
               )}
             ]} />
          </div>
        );
      default: return null;
    }
  };

  // --- RENDU INVESTISSEUR (STYLE BRICKS) ---
  const renderInvestorContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Valeur totale du portefeuille</p>
                    <h2 className="text-6xl font-black tracking-tighter">{formatCFA(currentUser?.balance || 0)}</h2>
                    <div className="mt-6 flex items-center gap-2">
                       <Badge status={currentUser?.kycStatus === 'verified' ? 'Compte Vérifié' : 'Identité à confirmer'} />
                    </div>
                  </div>
                  <div className="mt-12 flex gap-4">
                    <button className="bg-[#ff6b35] text-white px-10 py-4 rounded-xl font-bold text-sm hover:scale-105 transition-all">Approvisionner</button>
                    <button className="bg-white/10 text-white px-10 py-4 rounded-xl font-bold text-sm border border-white/10">Retirer</button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Revenus versés</p>
                  <h3 className="text-4xl font-black text-green-600 tracking-tighter">{formatCFA((currentUser?.totalInvested || 0) * 0.12)}</h3>
                </div>
                <div className="pt-8 border-t border-slate-100 space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase">Rendement Annuel</span>
                    <span className="font-bold">12-15%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase">Prochain versement</span>
                    <span className="font-bold text-orange-600">01 du mois</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'investments':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all group">
                <div className="h-64 relative overflow-hidden">
                  <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase shadow-sm">{p.location}</div>
                  <div className="absolute bottom-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg">{p.returnRate}% / AN</div>
                </div>
                <div className="p-8 space-y-6">
                  <h4 className="text-xl font-bold text-slate-900">{p.name}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400">
                      <span>Financé</span>
                      <span className="text-slate-900">{Math.round((p.collectedAmount/p.targetAmount)*100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(p.collectedAmount/p.targetAmount)*100}%` }}></div>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#ff6b35] transition-colors shadow-lg shadow-slate-900/10">Détails de l'actif</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'simulator':
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95">
            <div className="bg-white p-16 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col md:flex-row gap-16">
              <div className="flex-1 space-y-12">
                <h3 className="text-4xl font-bold text-slate-900">Simulateur de revenus</h3>
                <div className="space-y-6">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Montant de votre investissement</label>
                  <input type="range" min="10000" max="10000000" step="10000" value={simAmount} onChange={(e) => setSimAmount(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-orange-500" />
                  <div className="text-3xl font-black text-slate-900">{formatCFA(simAmount)}</div>
                </div>
              </div>
              <div className="w-full md:w-80 bg-slate-50 p-10 rounded-3xl border border-slate-100 text-center space-y-6">
                <p className="text-xs font-bold text-slate-400 uppercase">Revenu Mensuel Estimé</p>
                <div className="text-5xl font-black text-orange-600">{formatCFA(simAmount * 0.12 / 12)}</div>
                <div className="h-px bg-slate-200"></div>
                <p className="text-xs font-bold text-slate-400 uppercase">Revenu Annuel</p>
                <p className="text-2xl font-black text-green-600">{formatCFA(simAmount * 0.12)}</p>
              </div>
            </div>
          </div>
        );
      case 'profil':
        return (
          <div className="max-w-3xl mx-auto space-y-8">
             <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-10">
                <div className="w-32 h-32 bg-slate-100 rounded-3xl border-4 border-white shadow-lg overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name}&backgroundColor=0d1b2a`} className="w-full h-full object-cover" />
                </div>
                <div>
                   <h2 className="text-3xl font-bold text-slate-900">{currentUser?.name}</h2>
                   <p className="text-slate-400 text-sm mb-4">{currentUser?.email}</p>
                   <Badge status={currentUser?.kycStatus || 'pending'} />
                </div>
             </div>
             <div className="bg-white p-10 rounded-3xl border border-slate-100 space-y-6">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Vérification du compte</h4>
                <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex justify-between items-center group cursor-pointer hover:border-orange-300 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">Pièce d'identité</span>
                    <span className="text-[10px] text-slate-400">Carte NNI ou Passeport</span>
                  </div>
                  <button className="bg-slate-900 text-white p-2 rounded-lg group-hover:bg-orange-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></button>
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
        {/* Header Landing Style Bricks */}
        <nav className="h-20 border-b flex items-center justify-between px-12 bg-white sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center font-black text-white text-xl">G</div>
            <span className="text-xl font-bold tracking-tight">GESS <span className="text-[#ff6b35]">INVEST</span></span>
          </div>
          <div className="flex gap-6">
            <button onClick={() => setView('app')} className="text-sm font-bold text-slate-600 hover:text-slate-900">Se connecter</button>
            <button onClick={() => setView('app')} className="bg-[#ff6b35] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:scale-105 transition-all">S'inscrire</button>
          </div>
        </nav>

        {/* Hero Section Style Bricks */}
        <div className="flex-1 flex flex-col items-center justify-center px-10 text-center py-20 bg-slate-50">
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 max-w-5xl leading-none">
            Investissez dans l'immobilier <span className="text-[#ff6b35]">dès 10 000 F.</span>
          </h1>
          <p className="text-slate-500 text-xl font-medium max-w-2xl mb-12">
            La première plateforme tchadienne qui démocratise l'accès à la propriété rentable. Sécurisé, transparent, et 100% digital.
          </p>
          <div className="flex gap-6 mb-20">
            <button onClick={() => setView('app')} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-colors">Découvrir les biens</button>
            <button onClick={() => { setView('app'); setActiveTab('simulator'); }} className="bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm">Simuler mes revenus</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl w-full">
            {[
              { t: "12% à 15%", d: "Rendement annuel moyen" },
              { t: "Sécurisé", d: "Actifs gérés par GESS" },
              { t: "Flexible", d: "Retrait des dividendes mensuel" },
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
                <p className="text-3xl font-black text-slate-900 mb-2">{f.t}</p>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{f.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer simple */}
        <footer className="py-12 border-t text-center bg-white">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2024 GESS INVEST TCHAD - Tous droits réservés</p>
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
            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accès sécurisé en cours...</p>
          </div>
        ) : (
          userRole === 'admin' ? renderAdminContent() : renderInvestorContent()
        )}
      </div>

      {/* Switcher de rôle (Simulé pour la démo) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-100 z-[4000] flex gap-2">
        <button onClick={() => { setUserRole('investor'); setActiveTab('overview'); }} className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${userRole === 'investor' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}>Investisseur</button>
        <button onClick={() => { setUserRole('admin'); setActiveTab('overview'); }} className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${userRole === 'admin' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-orange-500'}`}>Gérant GESS</button>
      </div>
    </Layout>
  );
};

export default App;
