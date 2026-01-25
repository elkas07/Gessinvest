
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DataTable from './components/DataTable';
import { Project, UserProfile, Transaction, UserRole } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from './lib/supabase';

const formatCFA = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val).replace('XOF', 'F CFA');

const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Validé': 'bg-emerald-100 text-emerald-700',
    'En attente': 'bg-amber-100 text-amber-700',
    'Rejeté': 'bg-red-100 text-red-700',
    'Terminé': 'bg-slate-100 text-slate-700',
    'active': 'bg-emerald-100 text-emerald-700',
    'pending': 'bg-amber-100 text-amber-700',
    'verified': 'bg-blue-100 text-blue-700',
    'rejected': 'bg-red-100 text-red-700',
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

  // Simulateur State
  const [simAmount, setSimAmount] = useState(500000);
  const [simDuration, setSimDuration] = useState(12);

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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDU ADMIN ---
  const renderAdminContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-10 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Volume Total", val: formatCFA(154000000), color: "text-slate-900" },
                { label: "Membres", val: allUsers.length, color: "text-slate-900" },
                { label: "Projets Actifs", val: projects.length, color: "text-emerald-600" },
                { label: "Retraits en attente", val: "450.000 F", color: "text-[#ff6b35]" },
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DataTable title="Derniers Inscrits" data={allUsers} columns={[
                { header: 'Nom', render: (u) => <div className="font-bold">{u.name}</div> },
                { header: 'Email', render: (u) => <div className="text-xs">{u.email}</div> },
                { header: 'KYC', render: (u) => <Badge status={u.kycStatus} /> }
              ]} />
              <DataTable title="Transactions" data={transactions} columns={[
                { header: 'Type', render: (t) => <span className="font-bold">{t.type}</span> },
                { header: 'Montant', render: (t) => <span className="font-black">{formatCFA(t.amount)}</span> },
                { header: 'Statut', render: (t) => <Badge status={t.status} /> }
              ]} />
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-6">
            <DataTable title="Gestion des projets immobiliers" data={projects} columns={[
              { header: 'Projet', render: (p) => <div className="font-bold">{p.name}</div> },
              { header: 'Objectif', render: (p) => formatCFA(p.targetAmount) },
              { header: 'Collecté', render: (p) => <span className="text-[#ff6b35] font-bold">{Math.round((p.collectedAmount/p.targetAmount)*100)}%</span> },
              { header: 'Actions', render: () => <button className="text-[#ff6b35] font-black text-[10px] uppercase">Modifier</button> }
            ]} />
          </div>
        );
      case 'kyc':
        return (
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
             <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">Vérification des Identités</h3>
             <DataTable data={allUsers.filter(u => u.kycStatus === 'pending')} columns={[
               { header: 'Candidat', render: (u) => <div className="font-bold">{u.name}</div> },
               { header: 'Document', render: () => <button className="text-blue-500 font-bold text-xs underline">Voir la CNI</button> },
               { header: 'Validation', render: () => (
                 <div className="flex gap-2">
                   <button className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase">Valider</button>
                   <button className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase">Rejeter</button>
                 </div>
               )}
             ]} />
          </div>
        );
      default: return <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest">En cours de développement</div>;
    }
  };

  // --- RENDU INVESTISSEUR ---
  const renderInvestorContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 bg-[#0d1b2a] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-2">Mon Capital GESS</p>
                  <h2 className="text-6xl font-black text-[#ff6b35] tracking-tighter">{formatCFA(currentUser?.balance || 0)}</h2>
                  <div className="flex gap-4 mt-8">
                    <button className="px-8 py-3 bg-[#ff6b35] rounded-xl font-black text-[10px] uppercase tracking-widest">Recharger</button>
                    <button className="px-8 py-3 bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest">Retirer</button>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-96 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Rendements Cumulés</p>
                  <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">{formatCFA((currentUser?.totalInvested || 0) * 0.15)}</h3>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase">Taux moyen: 15% / an</div>
              </div>
            </div>
            
            <div className="space-y-6">
               <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Mes derniers investissements</h3>
               <DataTable data={transactions.slice(0, 3)} columns={[
                 { header: 'Projet', render: (t) => <div className="font-bold">{t.projectName}</div> },
                 { header: 'Montant', render: (t) => <div className="font-black">{formatCFA(t.amount)}</div> },
                 { header: 'Date', render: (t) => <div className="text-slate-400">{t.date}</div> },
                 { header: 'Statut', render: () => <Badge status="Validé" /> }
               ]} />
            </div>
          </div>
        );
      case 'investments':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-[3rem] overflow-hidden shadow-lg border border-slate-50 group hover:shadow-2xl transition-all">
                <div className="h-64 relative">
                  <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.name} />
                  <div className="absolute top-6 left-6 bg-[#0d1b2a]/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase">{p.location}</div>
                  <div className="absolute bottom-6 right-6 bg-white px-4 py-2 rounded-xl font-black text-[#ff6b35] shadow-lg">{p.returnRate}% ROI</div>
                </div>
                <div className="p-8 space-y-6">
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{p.name}</h4>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#ff6b35]" style={{ width: `${(p.collectedAmount/p.targetAmount)*100}%` }}></div>
                  </div>
                  <button className="w-full py-4 border-2 border-[#0d1b2a] text-[#0d1b2a] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0d1b2a] hover:text-white transition-all">Investir maintenant</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'simulator':
        return (
          <div className="max-w-4xl mx-auto bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-16">
            <div className="flex-1 space-y-10">
              <h3 className="text-3xl font-black text-[#0d1b2a] uppercase tracking-tighter">Simulateur de Gains</h3>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant à investir (CFA)</label>
                <input type="range" min="10000" max="5000000" step="10000" value={simAmount} onChange={(e) => setSimAmount(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#ff6b35]" />
                <div className="text-3xl font-black text-[#ff6b35]">{formatCFA(simAmount)}</div>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Durée (mois)</label>
                <input type="range" min="6" max="36" step="6" value={simDuration} onChange={(e) => setSimDuration(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#ff6b35]" />
                <div className="text-3xl font-black text-[#0d1b2a]">{simDuration} MOIS</div>
              </div>
            </div>
            <div className="w-full md:w-80 bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 flex flex-col justify-center text-center space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenu Total Estimé</p>
              <div className="text-4xl font-black text-emerald-600 tracking-tighter">{formatCFA(simAmount * (1 + (0.15 * (simDuration/12))))}</div>
              <div className="h-px bg-slate-200 w-full my-4"></div>
              <p className="text-[10px] font-black text-emerald-500 uppercase">Gain net: +{formatCFA(simAmount * (0.15 * (simDuration/12)))}</p>
            </div>
          </div>
        );
      default: return <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest italic">Contenu en cours de chargement...</div>;
    }
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#0d1b2a] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-20 h-20 bg-[#ff6b35] rounded-3xl flex items-center justify-center font-black text-4xl text-white mb-10 shadow-3xl shadow-[#ff6b35]/20">G</div>
        <h1 className="text-6xl md:text-[100px] font-black text-white leading-none tracking-tighter uppercase mb-6">GESS <span className="text-[#ff6b35]">INVEST</span></h1>
        <p className="text-slate-400 font-bold text-xl max-w-xl mb-12 uppercase tracking-tighter">L'Immobilier de prestige au Tchad, accessible à tous dès 10.000 CFA.</p>
        <div className="flex gap-6">
          <button onClick={() => setView('app')} className="bg-[#ff6b35] text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-[#ff6b35]/20 hover:scale-105 transition-all">Accéder à la plateforme</button>
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
      <div className="pb-20 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          userRole === 'admin' ? renderAdminContent() : renderInvestorContent()
        )}
      </div>

      <div className="fixed bottom-10 left-10 bg-white/10 backdrop-blur-xl p-1.5 rounded-full shadow-2xl border border-white/10 z-[2000] flex">
        <button onClick={() => { setUserRole('investor'); setActiveTab('overview'); }} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase transition-all ${userRole === 'investor' ? 'bg-[#ff6b35] text-white' : 'text-white/50 hover:text-white'}`}>Client</button>
        <button onClick={() => { setUserRole('admin'); setActiveTab('overview'); }} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase transition-all ${userRole === 'admin' ? 'bg-[#ff6b35] text-white' : 'text-white/50 hover:text-white'}`}>Gérant GESS</button>
      </div>
    </Layout>
  );
};

export default App;
