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
                <h2 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900">Console GESS Admin</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Surveillance et gestion du réseau</p>
              </div>
              <button 
                onClick={() => setShowAddProjectModal(true)}
                className="bg-[#ff6b35] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#ff6b35]/20 hover:scale-105 transition-all"
              >
                + Publier un Actif
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Volume Collecté", val: formatCFA(projects.reduce((acc, p) => acc + (p.collectedAmount || 0), 0)), color: "text-[#ff6b35]" },
                { label: "Membres Actifs", val: allUsers.length, color: "text-slate-900" },
                { label: "Actifs en cours", val: projects.length, color: "text-slate-900" },
                { label: "Alertes KYC", val: allUsers.filter(u => u.kycStatus === 'pending').length, color: "text-amber-500" },
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{s.label}</p>
                  <p className={`text-2xl font-black tracking-tight ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
              <DataTable title="Derniers flux financiers" data={transactions.slice(0, 10)} columns={[
                { header: 'Investisseur', render: (t) => <span className="font-bold text-sm">{t.userName || 'Membre GESS'}</span> },
                { header: 'Type', render: (t) => <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.type}</span> },
                { header: 'Montant', render: (t) => <span className={`font-black text-sm ${t.type === 'Dépôt' ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCFA(t.amount)}</span> },
                { header: 'Statut', render: (t) => <StatusBadge status={t.status} /> }
              ]} />
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-6 animate-fade">
            <DataTable 
              title="Répertoire des Portefeuilles"
              data={allUsers} columns={[
              { header: 'Nom Complet', render: (u) => <div className="font-bold text-sm">{u.name}</div> },
              { header: 'Solde GESS', render: (u) => <div className="font-black text-slate-900">{formatCFA(u.balance || 0)}</div> },
              { header: 'Vérification', render: (u) => <StatusBadge status={u.kycStatus} /> },
              { header: 'Actions', render: (u) => (
                <button onClick={() => setShowBalanceModal(u)} className="bg-[#0d1b2a] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff6b35] transition-all">Gérer Solde</button>
              )}
            ]} />
          </div>
        );
      case 'kyc':
        return (
          <div className="space-y-6 animate-fade">
            <DataTable title="Dossiers KYC en attente" data={allUsers.filter(u => u.kycStatus === 'pending')} columns={[
              { header: 'Membre', render: (u) => <div className="font-bold text-sm">{u.name}</div> },
              { header: 'Contact', render: (u) => <div className="text-slate-400 text-xs">{u.email}</div> },
              { header: 'Action de Validation', render: (u) => (
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
          <div className="space-y-8 animate-fade text-center py-20">
             <div className="max-w-xl mx-auto bg-[#0d1b2a] p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-6 tracking-tighter uppercase italic">Cycles de Revenus GESS</h3>
                  <p className="text-slate-400 text-sm font-medium mb-10">Lancement des reversements automatiques de dividendes mensuels (12%/an).</p>
                  <button className="bg-[#ff6b35] px-14 py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Exécuter le cycle mensuel</button>
                </div>
                <div className="absolute top-0 right