import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DataTable from './components/DataTable';
import type { Project, UserProfile, Transaction } from './types';
import { supabase } from './lib/supabase';

const formatCFA = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(val).replace('XOF', 'F CFA');

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Validé': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'En attente': 'bg-amber-100 text-amber-800 border-amber-200',
    'Rejeté': 'bg-rose-100 text-rose-800 border-rose-200',
    'verified': 'bg-blue-100 text-blue-800 border-blue-200',
    'pending': 'bg-orange-100 text-orange-800 border-orange-200',
    'active': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
  return (
    <span className={`px-5 py-2 rounded-full text-sm font-black border uppercase tracking-widest ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
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
        if (prof.length > 0) setCurrentUser(prof[0]);
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
    <div className={`bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden ${compact ? '' : 'max-w-6xl mx-auto'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-16 border-r border-slate-50">
          <h4 className="text-sm font-black text-[#ff6b35] uppercase tracking-[0.4em] mb-12 italic">Simulateur GESS Now</h4>
          <div className="space-y-12">
            <div>
              <label className="text-base font-bold text-slate-400 uppercase block mb-6 tracking-widest">Montant de votre commission</label>
              <div className="relative">
                <input type="number" value={commAmount} onChange={(e) => setCommAmount(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 p-8 rounded-3xl font-black text-4xl outline-none focus:border-[#ff6b35] shadow-inner" />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-slate-300 text-2xl uppercase tracking-tighter">F CFA</span>
              </div>
            </div>
            <div>
              <label className="text-base font-bold text-slate-400 uppercase block mb-6 tracking-widest">Pourcentage de déblocage ({perc}%)</label>
              <input type="range" min="10" max="90" step="5" value={perc} onChange={(e) => setPerc(Number(e.target.value))} className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#ff6b35]" />
              <div className="flex justify-between mt-6 text-sm font-black text-slate-300 uppercase tracking-[0.3em]">
                <span>10%</span><span>50%</span><span>90%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-16 bg-slate-50 flex flex-col justify-center items-center text-center">
          <p className="text-base font-black text-slate-400 uppercase tracking-[0.4em] mb-6">Trésorerie garantie sous 24h</p>
          <div className="text-7xl font-black text-[#0d1b2a] tracking-tighter mb-12 leading-none italic">{formatCFA(commAmount * (perc/100) * 0.97)}</div>
          <button onClick={() => setView('app')} className="bg-[#ff6b35] text-white px-16 py-8 rounded-[2rem] font-black text-lg uppercase tracking-[0.25em] shadow-2xl hover:scale-105 transition-all">Lancer ma demande</button>
          <p className="mt-8 text-sm text-slate-400 font-bold italic">Frais de service de 3% inclus. Validation immédiate.</p>
        </div>
      </div>
    </div>
  );

  const renderLanding = () => (
    <div className="min-h-screen bg-white animate-fade">
      <nav className="h-32 border-b-2 flex items-center justify-between px-10 md:px-24 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#ff6b35] rounded-2xl flex items-center justify-center font-black text-white text-4xl">G</div>
          <span className="text-4xl font-black tracking-tighter text-[#0d1b2a] uppercase italic">GESS <span className="text-[#ff6b35]">INVEST</span></span>
        </div>
        <div className="flex items-center gap-16">
          <button className="hidden md:block font-bold text-base uppercase tracking-[0.3em] text-slate-400 hover:text-[#ff6b35] transition-colors">Projets</button>
          <button className="hidden md:block font-bold text-base uppercase tracking-[0.3em] text-slate-400 hover:text-[#ff6b35] transition-colors">À propos</button>
          <button onClick={() => setView('app')} className="bg-[#0d1b2a] text-white px-14 py-6 rounded-2xl font-black text-base uppercase tracking-[0.2em] shadow-2xl hover:bg-[#ff6b35] transition-all">Connexion</button>
        </div>
      </nav>

      <div className="pt-24 pb-48 px-8 text-center max-w-7xl mx-auto">
        <h1 className="text-6xl md:text-[7rem] font-black text-[#0d1b2a] tracking-tighter leading-[0.8] mb-16">
          Investir au <span className="text-[#ff6b35] italic underline decoration-8 underline-offset-[20px]">Tchad</span>,<br/>pour tous.
        </h1>
        <p className="text-slate-500 text-3xl font-medium max-w-5xl mx-auto mb-28 leading-relaxed">
          Rejoignez la révolution immobilière. Financez vos projets prestigieux ou faites fructifier votre épargne en toute sérénité.
        </p>

        <div className="mb-48">
          <h3 className="text-4xl font-black mb-20 tracking-tight uppercase italic underline decoration-[#ff6b35] decoration-4 underline-offset-[16px]">Estimez votre avance GESS Now</h3>
          {renderSimulatorSection()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-left">
          {[
            { title: "Investisseurs", desc: "Devenez copropriétaire dès 10.000 F CFA et recevez vos revenus locatifs mensuellement.", icon: "💰" },
            { title: "Agences Immo", desc: "GESS Now : Touchez vos commissions dès le compromis signé. Plus besoin d'attendre le notaire.", icon: "⚡" },
            { title: "Promoteurs", desc: "Levez des fonds en un temps record grâce à notre réseau d'investisseurs qualifiés.", icon: "🏗️" }
          ].map((item, i) => (
            <div key={i} className="p-14 border-4 border-slate-50 rounded-[4rem] hover:border-[#ff6b35] transition-all bg-white shadow-xl group">
              <div className="text-7xl mb-10 group-hover:scale-125 transition-transform duration-700">{item.icon}</div>
              <h5 className="font-black text-3xl mb-6 tracking-tight uppercase italic">{item.title}</h5>
              <p className="text-xl text-slate-500 leading-relaxed font-semibold">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="space-y-16 animate-fade">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {[
          { label: "Volume Collecté", val: formatCFA(125000000) },
          { label: "Membres GESS", val: allUsers.length },
          { label: "Actifs Immobiliers", val: projects.length },
          { label: "KYC à traiter", val: allUsers.filter(u => u.kycStatus === 'pending').length },
        ].map((s, i) => (
          <div key={i} className="bg-white p-12 rounded-[2.5rem] border-2 border-slate-50 shadow-xl">
            <p className="text-base font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{s.label}</p>
            <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{s.val}</p>
          </div>
        ))}
      </div>
      
      {activeTab === 'users' && (
        <DataTable 
          title="Gestion Administrative" 
          data={allUsers} columns={[
            { header: 'Utilisateur', render: (u) => <div className="font-black text-xl text-slate-900">{u.name}</div> },
            { header: 'Rôle', render: (u) => <span className="text-sm font-black uppercase text-slate-400 tracking-widest">{u.role}</span> },
            { header: 'Solde GESS', render: (u) => <div className="font-black text-slate-900 text-lg italic">{formatCFA(u.balance || 0)}</div> },
            { header: 'Statut ID', render: (u) => <StatusBadge status={u.kycStatus} /> },
            { header: 'Action', render: (u) => (
              <button onClick={() => setShowBalanceModal(u)} className="bg-[#0d1b2a] text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#ff6b35] transition-all shadow-xl">Gérer Solde</button>
            )}
        ]} />
      )}

      {activeTab === 'overview' && (
        <DataTable title="Dernières Activités" data={transactions.slice(0, 10)} columns={[
          { header: 'Membre', render: (t) => <div className="font-bold">{allUsers.find(u => u.id === t.userId)?.name || 'Inconnu'}</div> },
          { header: 'Type', render: (t) => <span className="uppercase text-xs font-black tracking-widest">{t.type}</span> },
          { header: 'Montant', render: (t) => <div className="font-black italic text-lg">{formatCFA(t.amount)}</div> },
          { header: 'Statut', render: (t) => <StatusBadge status={t.status} /> }
        ]} />
      )}
    </div>
  );

  const renderAgency = () => (
    <div className="space-y-16 animate-fade">
      <div className="bg-[#0d1b2a] rounded-[4rem] p-20 text-white relative overflow-hidden shadow-2xl border-2 border-white/5">
        <div className="relative z-10">
          <span className="bg-[#ff6b35] text-base font-black uppercase px-8 py-3 rounded-full mb-10 inline-block tracking-[0.4em] shadow-2xl">SERVICE GESS NOW</span>
          <h2 className="text-6xl font-black mb-8 tracking-tighter">Trésorerie sur Demande</h2>
          <p className="text-slate-400 text-2xl max-w-2xl leading-relaxed font-semibold italic">Boostez l'activité de votre agence. Vos commissions sont payées en 24h chrono dès validation du compromis.</p>
        </div>
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#ff6b35]/20 rounded-full blur-[150px] -mr-64 -mt-64"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {renderSimulatorSection(true)}
        <div className="bg-white p-16 rounded-[4rem] border-2 border-slate-50 shadow-2xl">
          <h3 className="text-3xl font-black mb-12 tracking-tight uppercase italic underline decoration-[#ff6b35] decoration-8 underline-offset-[12px]">Historique GESS Now</h3>
          <div className="space-y-8">
            {[
              { ref: 'VIL-22-01', status: 'Validé', amount: 4500000, date: '15/11/2023' },
              { ref: 'IMM-22-05', status: 'En attente', amount: 12000000, date: '12/11/2023' },
            ].map((d, i) => (
              <div key={i} className="flex justify-between items-center p-10 border-4 border-slate-50 rounded-[3rem] hover:bg-slate-50 transition-all group">
                <div>
                  <p className="font-black text-2xl text-slate-900 group-hover:text-[#ff6b35] transition-colors uppercase italic">Dossier #{d.ref}</p>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">{d.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-3xl mb-4 text-slate-900 leading-none italic">{formatCFA(d.amount)}</p>
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
    <div className="space-y-16 animate-fade">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-10">
        <h2 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900 underline decoration-[#ff6b35] decoration-8 underline-offset-[16px]">Suivi Chantiers</h2>
        <button onClick={() => setShowAddProjectModal(true)} className="bg-[#ff6b35] text-white px-12 py-7 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Nouveau Financement</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: "Capitaux Débloqués", val: formatCFA(125000000) },
          { label: "Chantiers Actifs", val: "3 Sites" },
          { label: "Investisseurs GESS", val: "2,450" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-14 rounded-[3rem] border-2 border-slate-50 shadow-2xl">
            <p className="text-base font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{s.label}</p>
            <p className="text-5xl font-black text-slate-900 tracking-tight leading-none italic">{s.val}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-16 rounded-[4rem] border-2 border-slate-50 shadow-2xl">
        <h3 className="text-4xl font-black mb-16 tracking-tight uppercase italic underline decoration-[#ff6b35] decoration-8 underline-offset-[16px]">Progression Financements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {projects.slice(0, 2).map(p => (
            <div key={p.id} className="p-12 border-4 border-slate-50 rounded-[3.5rem] space-y-10 hover:border-[#ff6b35]/40 transition-all">
              <div className="flex gap-10 items-center">
                <img src={p.imageUrl} className="w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white" />
                <div>
                  <h4 className="font-black text-3xl text-slate-900 leading-tight mb-3 uppercase italic">{p.name}</h4>
                  <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">{p.location}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between text-base font-black uppercase text-slate-400 tracking-[0.4em]">
                  <span>Progression</span><span>{Math.round(((p.collectedAmount||0)/p.targetAmount)*100)}%</span>
                </div>
                <div className="h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner border-2 border-white">
                  <div className="h-full bg-[#ff6b35] transition-all duration-[2500ms]" style={{ width: `${((p.collectedAmount||0)/p.targetAmount)*100}%` }}></div>
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
          <button onClick={() => setSelectedProject(null)} className="mb-14 flex items-center gap-6 text-slate-400 hover:text-slate-900 font-black text-lg uppercase tracking-[0.4em] transition-all">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Retour au Marché
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
              <div className="rounded-[4rem] overflow-hidden h-[650px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative border-4 border-white">
                <img src={selectedProject.imageUrl} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>
                <div className="absolute bottom-16 left-16 right-16">
                   <h2 className="text-7xl font-black text-white tracking-tighter mb-8 leading-[0.85] italic uppercase">{selectedProject.name}</h2>
                   <div className="flex flex-wrap gap-8">
                      <span className="bg-white/10 backdrop-blur-2xl text-white px-10 py-4 rounded-[1.5rem] font-black text-base uppercase tracking-[0.3em] border-2 border-white/20">{selectedProject.location}</span>
                      <span className="bg-[#ff6b35] text-white px-10 py-4 rounded-[1.5rem] font-black text-base uppercase tracking-[0.3em] shadow-2xl">ROI {selectedProject.returnRate}% / AN</span>
                   </div>
                </div>
              </div>
              <div className="bg-white p-16 rounded-[4rem] border-2 border-slate-50 shadow-2xl">
                <h3 className="text-4xl font-black uppercase tracking-tight mb-12 italic underline decoration-[#ff6b35] decoration-8 underline-offset-[20px]">Détails de l'Actif</h3>
                <p className="text-slate-600 text-2xl leading-relaxed font-semibold italic">{selectedProject.description}</p>
              </div>
            </div>
            <div className="bg-[#0d1b2a] text-white p-16 rounded-[4rem] shadow-2xl h-fit border-2 border-white/10 sticky top-40">
              <h4 className="text-4xl font-black mb-14 italic underline decoration-[#ff6b35] decoration-8 underline-offset-[16px] uppercase tracking-tight">Investir</h4>
              <div className="space-y-14">
                <div>
                  <label className="text-base font-black text-slate-500 uppercase block mb-8 tracking-[0.4em]">Montant de l'engagement (F CFA)</label>
                  <input type="number" defaultValue="500000" className="w-full bg-white/5 border-2 border-white/10 p-8 rounded-[2rem] font-black text-5xl outline-none focus:border-[#ff6b35] text-white shadow-inner" />
                </div>
                <button className="w-full bg-[#ff6b35] py-10 rounded-[2rem] font-black text-xl uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all">Valider mon Placement</button>
                <div className="pt-12 border-t-2 border-white/5 text-center">
                   <p className="text-sm text-slate-500 font-black uppercase tracking-[0.5em] mb-6">Securisé par GESS INVEST</p>
                   <p className="text-base text-slate-400 font-bold leading-relaxed italic">Votre certificat d'investissement est généré dès confirmation.</p>
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
          <div className="space-y-16 animate-fade">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 bg-[#0d1b2a] rounded-[4rem] p-20 text-white relative overflow-hidden shadow-2xl border-2 border-white/5">
                <div className="relative z-10">
                  <p className="text-slate-500 text-base font-black uppercase tracking-[0.6em] mb-8">Solde de Trésorerie</p>
                  <h2 className="text-8xl font-black tracking-tighter leading-none mb-20 italic">{formatCFA(currentUser?.balance || 0)}</h2>
                  <div className="flex flex-wrap gap-10">
                    <button className="bg-[#ff6b35] text-white px-14 py-7 rounded-[1.5rem] font-black text-base uppercase tracking-[0.3em] shadow-2xl hover:bg-white hover:text-[#ff6b35] transition-all">Approvisionner</button>
                    <button className="bg-white/5 text-white px-14 py-7 rounded-[1.5rem] font-black text-base uppercase tracking-[0.3em] border-2 border-white/10 hover:bg-white/10 transition-all">Effectuer Retrait</button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#ff6b35]/20 rounded-full blur-[150px] -mr-40 -mt-40"></div>
              </div>
              <div className="bg-white rounded-[4rem] p-16 border-2 border-slate-50 shadow-2xl flex flex-col justify-between">
                <div>
                  <p className="text-slate-400 text-base font-black uppercase mb-6 tracking-[0.4em]">Revenus cumulés</p>
                  <h3 className="text-7xl font-black text-emerald-600 tracking-tighter italic leading-none">{formatCFA((currentUser?.totalInvested || 0) * 0.12)}</h3>
                </div>
                <div className="pt-12 border-t-2 border-slate-50 flex justify-between items-center">
                  <span className="text-base font-black text-slate-400 uppercase tracking-[0.4em]">Validation ID</span>
                  <StatusBadge status={currentUser?.kycStatus || 'pending'} />
                </div>
              </div>
            </div>
            <DataTable title="Dernières Opérations" data={transactions.filter(t => t.userId === currentUser?.id).slice(0, 5)} columns={[
              { header: 'Nature', render: (t) => <span className="text-base font-black text-slate-500 uppercase tracking-[0.3em]">{t.type}</span> },
              { header: 'Montant', render: (t) => <span className={`font-black text-2xl italic ${t.type === 'Dépôt' ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCFA(t.amount)}</span> },
              { header: 'Statut GESS', render: (t) => <StatusBadge status={t.status} /> }
            ]} />
          </div>
        );
      case 'investments':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 animate-fade">
            {projects.map(p => (
              <div key={p.id} onClick={() => setSelectedProject(p)} className="bg-white rounded-[3.5rem] overflow-hidden border-2 border-slate-50 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] transition-all cursor-pointer group shadow-2xl flex flex-col h-full">
                <div className="h-80 relative overflow-hidden">
                  <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5000ms]" />
                  <div className="absolute top-8 left-8 bg-white/95 px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-[0.3em] shadow-2xl text-[#0d1b2a] border-2 border-slate-50">{p.location}</div>
                  <div className="absolute bottom-8 right-8 bg-[#ff6b35] text-white px-8 py-4 rounded-2xl text-base font-black shadow-2xl tracking-[0.2em] uppercase">ROI {p.returnRate}% / AN</div>
                </div>
                <div className="p-12 flex-1 flex flex-col">
                  <h4 className="text-3xl font-black text-slate-900 leading-tight mb-10 group-hover:text-[#ff6b35] transition-colors uppercase italic italic tracking-tighter">{p.name}</h4>
                  <div className="mt-auto space-y-10">
                    <div className="space-y-4">
                       <div className="flex justify-between text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                          <span>Collecte: {Math.round(((p.collectedAmount||0)/p.targetAmount)*100)}%</span>
                       </div>
                       <div className="h-4 bg-slate-50 rounded-full overflow-hidden shadow-inner border-2 border-white">
                         <div className="h-full bg-[#ff6b35] transition-all duration-[2500ms]" style={{ width: `${((p.collectedAmount||0)/p.targetAmount)*100}%` }}></div>
                       </div>
                    </div>
                    <button className="w-full py-7 bg-[#0d1b2a] text-white rounded-[2rem] font-black text-base uppercase tracking-[0.3em] hover:bg-[#ff6b35] transition-all transform group-hover:-translate-y-4 shadow-2xl">Consulter l'offre</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'simulator':
        return (
          <div className="max-w-4xl mx-auto py-16 animate-fade text-center">
            <div className="bg-white p-20 rounded-[5rem] border-2 border-slate-50 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.15)]">
                <h3 className="text-6xl font-black text-slate-900 tracking-tighter mb-20 italic underline decoration-[#ff6b35] decoration-8 underline-offset-[20px] uppercase">Votre Futur Immobiler</h3>
                <div className="space-y-24">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-8">
                    <label className="text-base font-black text-slate-400 uppercase tracking-[0.5em]">Capital d'investissement</label>
                    <div className="text-6xl font-black text-[#ff6b35] tracking-tighter italic">{formatCFA(simInvAmount)}</div>
                  </div>
                  <input type="range" min="100000" max="100000000" step="500000" value={simInvAmount} onChange={(e) => setSimInvAmount(parseInt(e.target.value))} className="w-full h-5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#ff6b35]" />
                  <div className="bg-[#0d1b2a] p-20 rounded-[4rem] shadow-2xl relative overflow-hidden">
                    <p className="text-base font-black text-slate-500 uppercase mb-10 tracking-[0.5em] relative z-10">Rente Mensuelle Estimée (12% AN)</p>
                    <div className="text-[6rem] font-black text-white tracking-tighter relative z-10 leading-none italic">{formatCFA(simInvAmount * 0.12 / 12)}</div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#ff6b35]/15 rounded-full blur-[100px] -mr-32 -mb-32"></div>
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
      <div className="pb-64">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[70vh] gap-12">
            <div className="w-32 h-32 border-[16px] border-[#ff6b35]/10 border-t-[#ff6b35] rounded-full animate-spin shadow-2xl"></div>
            <p className="text-2xl font-black text-[#0d1b2a] uppercase tracking-[0.6em] animate-pulse italic">Accès GESS INVEST...</p>
          </div>
        ) : getContent()}
      </div>

      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-[#0d1b2a]/95 backdrop-blur-3xl p-4 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border-2 border-white/10 z-[5000] flex gap-4 scale-150 transform-gpu">
        {[
          { id: 'investor', label: 'Investisseur' },
          { id: 'agency', label: 'Agence' },
          { id: 'developer', label: 'Promoteur' },
          { id: 'admin', label: 'Admin' }
        ].map((role) => (
          <button key={role.id} onClick={() => { setUserRole(role.id as any); setActiveTab('overview'); setSelectedProject(null); }} className={`px-12 py-5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all ${userRole === role.id ? 'bg-[#ff6b35] text-white shadow-2xl scale-110' : 'text-slate-500 hover:text-white'}`}>{role.label}</button>
        ))}
      </div>

      {showBalanceModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[9999] flex items-center justify-center p-16 animate-fade">
          <div className="bg-white w-full max-w-xl rounded-[5rem] p-20 shadow-2xl border-4 border-slate-50 transform scale-125">
            <h3 className="text-5xl font-black mb-14 tracking-tighter italic underline decoration-[#ff6b35] decoration-8 underline-offset-[16px] text-center uppercase italic">Ajuster Trésorerie</h3>
            <div className="space-y-16">
               <div className="space-y-8">
                  <label className="text-base font-black text-slate-400 uppercase tracking-[0.5em] block text-center">Valeur de l'ajustement</label>
                  <input type="number" value={balanceAdjustment} onChange={(e) => setBalanceAdjustment(Number(e.target.value))} className="w-full bg-slate-50 border-4 border-slate-200 p-12 rounded-[3rem] font-black text-6xl outline-none focus:border-[#ff6b35] text-center shadow-inner italic" placeholder="0" />
               </div>
               <div className="flex gap-10">
                  <button onClick={() => setShowBalanceModal(null)} className="flex-1 text-slate-400 font-black text-base uppercase underline tracking-[0.4em] hover:text-slate-600 transition-colors italic">Fermer</button>
                  <button onClick={handleUpdateBalance} className="flex-1 bg-[#ff6b35] text-white py-8 rounded-[1.5rem] font-black text-base uppercase tracking-[0.3em] shadow-2xl hover:scale-110 transition-all">Valider</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[9999] flex items-center justify-center p-16 animate-fade">
          <div className="bg-white w-full max-w-4xl rounded-[5rem] p-20 shadow-2xl overflow-y-auto max-h-[94vh] border-4 border-slate-50">
            <h3 className="text-6xl font-black mb-16 tracking-tighter italic underline decoration-[#ff6b35] decoration-8 underline-offset-[20px] uppercase italic">Nouvel Actif Immo</h3>
            <div className="space-y-12 mb-16 text-left">
               <div className="space-y-6">
                  <label className="text-base font-black text-slate-400 uppercase mb-3 block tracking-[0.4em]">Désignation commerciale</label>
                  <input type="text" className="w-full bg-slate-50 border-4 border-slate-100 p-8 rounded-[2rem] font-black text-2xl focus:border-[#ff6b35] outline-none shadow-inner italic" placeholder="Ex: Résidence GESS Sabangali" />
               </div>
               <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <label className="text-base font-black text-slate-400 uppercase mb-3 block tracking-[0.4em]">Objectif Levée (F CFA)</label>
                    <input type="number" className="w-full bg-slate-50 border-4 border-slate-100 p-8 rounded-[2rem] font-black text-3xl focus:border-[#ff6b35] outline-none shadow-inner italic" placeholder="50.000.000" />
                  </div>
                  <div className="space-y-6">
                    <label className="text-base font-black text-slate-400 uppercase mb-3 block tracking-[0.4em]">ROI Cible % / An</label>
                    <input type="number" className="w-full bg-slate-50 border-4 border-slate-100 p-8 rounded-[2rem] font-black text-3xl focus:border-[#ff6b35] outline-none shadow-inner italic" placeholder="12" />
                  </div>
               </div>
               <div className="space-y-6">
                  <label className="text-base font-black text-slate-400 uppercase mb-3 block tracking-[0.4em]">Note descriptive</label>
                  <textarea className="w-full bg-slate-50 border-4 border-slate-100 p-8 rounded-[2rem] font-bold text-xl focus:border-[#ff6b35] outline-none shadow-inner h-48 italic" placeholder="Détaillez les points forts de l'opération..."></textarea>
               </div>
            </div>
            <div className="flex gap-12">
              <button onClick={() => setShowAddProjectModal(false)} className="flex-1 text-slate-400 font-black text-base uppercase underline tracking-[0.4em] hover:text-slate-600 transition-colors italic">Annuler</button>
              <button className="flex-1 bg-[#0d1b2a] text-white py-10 rounded-[2rem] font-black text-lg uppercase tracking-[0.3em] shadow-2xl hover:bg-[#ff6b35] transition-all scale-105 italic">Lancer le Financement</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;