import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DataTable from './components/DataTable';
import { Project, UserProfile, Transaction } from './types';
import { supabase } from './lib/supabase';

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
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${styles[status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
      {status === 'verified' ? 'Vérifié' : status === 'pending' ? 'Attente' : status}
    </span>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [userRole, setUserRole] = useState<'investor' | 'admin' | 'agency' | 'developer'>('investor');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Simulation States (Landing & Agency)
  const [commAmount, setCommAmount] = useState(2000000);
  const [perc, setPerc] = useState(60);
  const [simInvAmount, setSimInvAmount] = useState(500000);

  // Modals
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
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
        setCurrentUser(prof[0]);
      }
      if (trans) setTransactions(trans);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleUpdateBalance = async () => {
    if (!showBalanceModal) return;
    const newBalance = (showBalanceModal.balance || 0) + balanceAdjustment;
    const { error } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', showBalanceModal.id);
    if (!error) {
      await supabase.from('transactions').insert([{
        userId: showBalanceModal.id, amount: Math.abs(balanceAdjustment),
        type: balanceAdjustment > 0 ? 'Dépôt' : 'Retrait', status: 'Validé',
        date: new Date().toISOString(), method: 'Admin'
      }]);
      setShowBalanceModal(null);
      setBalanceAdjustment(0);
      fetchData();
    }
  };

  const renderSimulatorSection = (compact = false) => (
    <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden ${compact ? '' : 'max-w-5xl mx-auto'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 border-r border-slate-50">
          <h4 className="text-[10px] font-black text-[#ff6b35] uppercase tracking-widest mb-6">Simulateur GESS Now</h4>
          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3">Montant de la commission</label>
              <div className="relative">
                <input type="number" value={commAmount} onChange={(e) => setCommAmount(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-black text-xl outline-none focus:border-[#ff6b35]" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">CFA</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3">Pourcentage de déblocage ({perc}%)</label>
              <input type="range" min="10" max="90" step="5" value={perc} onChange={(e) => setPerc(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#ff6b35]" />
              <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-300">
                <span>10%</span><span>50%</span><span>90%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 bg-slate-50 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net à percevoir sous 24h</p>
          <div className="text-4xl font-black text-[#0d1b2a] tracking-tighter mb-6">{formatCFA(commAmount * (perc/100) * 0.97)}</div>
          <button onClick={() => setView('app')} className="bg-[#ff6b35] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Faire ma demande</button>
          <p className="mt-4 text-[9px] text-slate-400 font-medium italic">Frais de service de 3% inclus. Validation en 48h.</p>
        </div>
      </div>
    </div>
  );

  const renderLanding = () => (
    <div className="min-h-screen bg-white">
      <nav className="h-20 border-b flex items-center justify-between px-8 md:px-20 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center font-black text-white text-xl">G</div>
          <span className="text-xl font-black tracking-tighter text-[#0d1b2a] uppercase italic">GESS <span className="text-[#ff6b35]">INVEST</span></span>
        </div>
        <div className="flex items-center gap-8">
          <button className="hidden md:block font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-[#ff6b35]">Marché</button>
          <button className="hidden md:block font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-[#ff6b35]">Expertise</button>
          <button onClick={() => setView('app')} className="bg-[#0d1b2a] text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-[#ff6b35] transition-all">Connexion</button>
        </div>
      </nav>

      <div className="pt-20 pb-32 px-8 text-center max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black text-[#0d1b2a] tracking-tighter leading-none mb-10">
          L'immobilier au <span className="text-[#ff6b35] italic">Tchad</span>,<br/>enfin accessible à tous.
        </h1>
        <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto mb-16">
          Investissez, financez vos projets ou accélérez votre trésorerie d'agence sur une plateforme unique et sécurisée.
        </p>

        <div className="mb-24">
          <h3 className="text-2xl font-black mb-10 tracking-tight">Calculez le montant que vous pouvez percevoir</h3>
          {renderSimulatorSection()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            { title: "Investisseurs", desc: "Percevez des loyers mensuels dès 10.000 F CFA d'investissement.", icon: "💰" },
            { title: "Agences Immo", desc: "GESS Now : Touchez vos commissions dès le compromis signé.", icon: "⚡" },
            { title: "Promoteurs", desc: "Financez vos chantiers grâce à notre communauté de 470k membres.", icon: "🏗️" }
          ].map((item, i) => (
            <div key={i} className="p-8 border border-slate-100 rounded-2xl hover:border-[#ff6b35]/30 transition-all bg-white shadow-sm">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h5 className="font-black text-lg mb-2">{item.title}</h5>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="space-y-6 animate-fade">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Collecte Totale", val: formatCFA(125000000) },
          { label: "Utilisateurs", val: allUsers.length },
          { label: "Projets", val: projects.length },
          { label: "KYC Attente", val: allUsers.filter(u => u.kycStatus === 'pending').length },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-xl font-black text-slate-900">{s.val}</p>
          </div>
        ))}
      </div>
      <DataTable 
        title="Membres du réseau" 
        data={allUsers} columns={[
          { header: 'Utilisateur', render: (u) => <div className="font-bold text-xs">{u.name}</div> },
          { header: 'Rôle', render: (u) => <span className="text-[9px] font-black uppercase text-slate-400">{u.role}</span> },
          { header: 'Solde', render: (u) => <div className="font-black text-slate-900 text-xs">{formatCFA(u.balance || 0)}</div> },
          { header: 'KYC', render: (u) => <StatusBadge status={u.kycStatus} /> },
          { header: 'Action', render: (u) => (
            <button onClick={() => setShowBalanceModal(u)} className="bg-[#0d1b2a] text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-[#ff6b35]">Gérer</button>
          )}
      ]} />
    </div>
  );

  const renderAgency = () => (
    <div className="space-y-8 animate-fade">
      <div className="bg-[#0d1b2a] rounded-3xl p-10 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <span className="bg-[#ff6b35] text-[9px] font-black uppercase px-3 py-1 rounded-full mb-4 inline-block">Service GESS Now</span>
          <h2 className="text-3xl font-black mb-4">Avance de Trésorerie</h2>
          <p className="text-slate-400 text-sm max-w-md">Débloquez vos commissions sous 24h sans attendre la signature notariale.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderSimulatorSection(true)}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black mb-6 tracking-tight">Dossiers récents</h3>
          <div className="space-y-4">
            {[
              { ref: 'VIL-22-01', status: 'Validé', amount: 4500000 },
              { ref: 'IMM-22-05', status: 'En attente', amount: 12000000 },
            ].map((d, i) => (
              <div key={i} className="flex justify-between items-center p-4 border border-slate-50 rounded-xl hover:bg-slate-50">
                <div>
                  <p className="font-bold text-xs">Dossier #{d.ref}</p>
                  <p className="text-[9px] font-bold text-slate-400">12/10/2023</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs mb-1">{formatCFA(d.amount)}</p>
                  <StatusBadge status={d.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeveloper = () => (
    <div className="space-y-8 animate-fade">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight uppercase italic">Portefeuille Promoteur</h2>
        <button onClick={() => setShowAddProjectModal(true)} className="bg-[#ff6b35] text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg">Soumettre un Projet</button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: "Capitaux Levés", val: formatCFA(125000000) },
          { label: "Actifs", val: "2 Chantiers" },
          { label: "Copropriétaires", val: "1.240" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-xl font-black text-slate-900">{s.val}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black mb-8 underline decoration-[#ff6b35] decoration-2">Suivi des collectes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.slice(0, 2).map(p => (
            <div key={p.id} className="p-6 border border-slate-50 rounded-2xl space-y-4">
              <div className="flex gap-4 items-center">
                <img src={p.imageUrl} className="w-16 h-16 rounded-xl object-cover shadow-md" />
                <div>
                  <h4 className="font-black text-sm">{p.name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.location}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                  <span>Progression</span><span>{Math.round(((p.collectedAmount||0)/p.targetAmount)*100)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff6b35]" style={{ width: `${((p.collectedAmount||0)/p.targetAmount)*100}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInvestor = () => {
    if (selectedProject) {
      return (
        <div className="animate-fade">
          <button onClick={() => setSelectedProject(null)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[9px] uppercase tracking-widest">
            ← Retour aux opportunités
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-3xl overflow-hidden h-[400px] shadow-lg relative">
                <img src={selectedProject.imageUrl} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent"></div>
                <div className="absolute bottom-8 left-8">
                   <h2 className="text-3xl font-black text-white tracking-tighter mb-2">{selectedProject.name}</h2>
                   <div className="flex gap-3">
                      <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full font-bold text-[9px] uppercase">{selectedProject.location}</span>
                      <span className="bg-[#ff6b35] text-white px-3 py-1 rounded-full font-bold text-[9px] uppercase">Rendement {selectedProject.returnRate}% / AN</span>
                   </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black uppercase tracking-tight mb-6">Détails de l'Actif</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedProject.description}</p>
              </div>
            </div>
            <div className="bg-[#0d1b2a] text-white p-8 rounded-3xl shadow-xl h-fit border border-white/5">
              <h4 className="text-lg font-black mb-8 italic underline decoration-[#ff6b35] decoration-2">Investir</h4>
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">Montant (F CFA)</label>
                  <input type="number" defaultValue="250000" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-black text-xl outline-none focus:border-[#ff6b35]" />
                </div>
                <button className="w-full bg-[#ff6b35] py-5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Devenir Copropriétaire</button>
                <p className="text-[8px] text-center text-slate-500 font-bold uppercase tracking-[0.2em]">Sécurisé par GESS INVEST</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-fade">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#0d1b2a] rounded-3xl p-10 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10">
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Solde Disponible</p>
                  <h2 className="text-5xl font-black tracking-tighter">{formatCFA(currentUser?.balance || 0)}</h2>
                  <div className="mt-8 flex gap-4">
                    <button className="bg-[#ff6b35] text-white px-8 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg">Approvisionner</button>
                    <button className="bg-white/5 text-white px-8 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest border border-white/10">Retrait</button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b35]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              </div>
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-slate-400 text-[9px] font-black uppercase mb-2 tracking-widest">Dividendes Total</p>
                  <h3 className="text-4xl font-black text-emerald-600 tracking-tighter italic">{formatCFA((currentUser?.totalInvested || 0) * 0.12)}</h3>
                </div>
                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Statut</span>
                  <StatusBadge status={currentUser?.kycStatus || 'pending'} />
                </div>
              </div>
            </div>
            <DataTable title="Historique" data={transactions.filter(t => t.userId === currentUser?.id).slice(0, 5)} columns={[
              { header: 'Action', render: (t) => <span className="text-[9px] font-bold text-slate-400 uppercase">{t.type}</span> },
              { header: 'Montant', render: (t) => <span className={`font-black text-xs ${t.type === 'Dépôt' ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCFA(t.amount)}</span> },
              { header: 'Statut', render: (t) => <StatusBadge status={t.status} /> }
            ]} />
          </div>
        );
      case 'investments':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade">
            {projects.map(p => (
              <div key={p.id} onClick={() => setSelectedProject(p)} className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all cursor-pointer group shadow-sm flex flex-col">
                <div className="h-56 relative overflow-hidden">
                  <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" />
                  <div className="absolute top-4 left-4 bg-white/95 px-4 py-1.5 rounded-full text-[8px] font-black uppercase shadow-lg">{p.location}</div>
                  <div className="absolute bottom-4 right-4 bg-[#ff6b35] text-white px-4 py-2 rounded-xl text-[11px] font-black shadow-lg">ROI {p.returnRate}%</div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-lg font-black text-slate-900 leading-tight mb-6">{p.name}</h4>
                  <div className="mt-auto space-y-4">
                    <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-[#ff6b35]" style={{ width: `${((p.collectedAmount||0)/p.targetAmount)*100}%` }}></div>
                    </div>
                    <button className="w-full py-3.5 bg-[#0d1b2a] text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#ff6b35] transition-all">Détails</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'simulator':
        return (
          <div className="max-w-xl mx-auto py-6 animate-fade text-center">
            <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-10 italic">Simulateur ROI</h3>
                <div className="space-y-12">
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Investissement souhaité</label>
                    <div className="text-3xl font-black text-[#ff6b35] tracking-tighter">{formatCFA(simInvAmount)}</div>
                  </div>
                  <input type="range" min="10000" max="5000000" step="10000" value={simInvAmount} onChange={(e) => setSimInvAmount(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#ff6b35]" />
                  <div className="bg-[#0d1b2a] p-10 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-widest">Revenus mensuels estimés (12%/an)</p>
                    <div className="text-5xl font-black text-white tracking-tighter">{formatCFA(simInvAmount * 0.12 / 12)}</div>
                  </div>
                </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (view === 'landing') return renderLanding();

  const getContent = () => {
    switch(userRole) {
      case 'admin': return renderAdmin();
      case 'agency': return renderAgency();
      case 'developer': return renderDeveloper();
      default: return renderInvestor();
    }
  };

  return (
    <Layout userRole={userRole} activeTab={activeTab} setActiveTab={setActiveTab} onGoHome={() => setView('landing')}>
      <div className="pb-40">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
            <div className="w-12 h-12 border-8 border-[#ff6b35]/10 border-t-[#ff6b35] rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-[#0d1b2a] uppercase tracking-widest animate-pulse">GESS INVEST...</p>
          </div>
        ) : getContent()}
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#0d1b2a]/95 backdrop-blur-2xl p-2 rounded-2xl shadow-2xl border border-white/10 z-[5000] flex gap-1 scale-90">
        {[
          { id: 'investor', label: 'Investisseur' },
          { id: 'agency', label: 'Agence' },
          { id: 'developer', label: 'Promoteur' },
          { id: 'admin', label: 'Admin' }
        ].map((role) => (
          <button key={role.id} onClick={() => { setUserRole(role.id as any); setActiveTab('overview'); setSelectedProject(null); }} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${userRole === role.id ? 'bg-[#ff6b35] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{role.label}</button>
        ))}
      </div>

      {showBalanceModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9999] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-10 shadow-2xl border border-slate-100">
            <h3 className="text-2xl font-black mb-8 tracking-tighter italic underline decoration-[#ff6b35] decoration-2">Solde</h3>
            <div className="space-y-6">
               <input type="number" value={balanceAdjustment} onChange={(e) => setBalanceAdjustment(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl font-black text-3xl outline-none focus:border-[#ff6b35] text-center" placeholder="0" />
               <div className="flex gap-4">
                  <button onClick={() => setShowBalanceModal(null)} className="flex-1 text-slate-400 font-black text-[10px] uppercase underline">Annuler</button>
                  <button onClick={handleUpdateBalance} className="flex-1 bg-[#ff6b35] text-white py-4 rounded-xl font-black text-[10px] uppercase shadow-lg">Confirmer</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9999] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-3xl p-10 shadow-2xl overflow-y-auto max-h-[85vh]">
            <h3 className="text-3xl font-black mb-10 tracking-tighter italic underline decoration-[#ff6b35] decoration-2">Nouveau Projet</h3>
            <div className="space-y-6 mb-10 text-left">
               <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Titre</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold focus:border-[#ff6b35] outline-none" placeholder="Ex: Cité Indigo" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Levée (F CFA)</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-black focus:border-[#ff6b35] outline-none" placeholder="50.000.000" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">ROI cible %</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-black focus:border-[#ff6b35] outline-none" placeholder="12" />
                  </div>
               </div>
            </div>
            <div className="flex gap-6">
              <button onClick={() => setShowAddProjectModal(false)} className="flex-1 text-slate-400 font-black text-[10px] uppercase underline">Fermer</button>
              <button className="flex-1 bg-[#0d1b2a] text-white py-5 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-[#ff6b35]">Soumettre</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;