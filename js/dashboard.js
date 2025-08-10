// js/dashboard.js
import { supabase } from './supabase.js';

/* ================== UTILITAIRES ================== */
function fmtXAF(v){
  const n = Number(v||0);
  return n.toLocaleString('fr-FR') + ' XAF';
}
function pct(collecte, objectif){
  const c = Number(collecte||0), o = Number(objectif||0);
  if (!o) return 0;
  return Math.max(0, Math.min(100, Math.round((c/o)*100)));
}

/* ================== PROJETS ================== */
const elEncours = document.getElementById('cards-encours');
const elAtteint = document.getElementById('cards-atteint');
const elAvenir  = document.getElementById('cards-avenir');

function badge(statut){
  if(statut==='encours') return '<span class="badge encours">Collecte en cours</span>';
  if(statut==='atteint') return '<span class="badge atteint">Objectif atteint</span>';
  return '<span class="badge avenir">Collecte à venir</span>';
}

function cardProject(p){
  const pcent = pct(p.collecte, p.objectif);
  const dateEvt = p.evenement_date ? new Date(p.evenement_date) : null;
  const dateTxt = dateEvt ? `${dateEvt.toLocaleDateString()} à ${dateEvt.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}` : '';

  return `
    <article class="card">
      <img src="${p.image_url || 'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d55?q=80&w=1200&auto=format&fit=crop'}" alt="${p.titre||''}">
      <div class="card-body">
        ${badge(p.statut)}
        <h3>${p.titre || 'Projet immobilier'}</h3>
        <div class="meta"><span>Objectif :</span><strong>${fmtXAF(p.objectif)}</strong></div>
        <div class="meta"><span>Collecté :</span><strong>${fmtXAF(p.collecte)}</strong></div>
        <div class="progress"><span style="width:${pcent}%"></span></div>
        ${p.statut==='avenir' && dateTxt ? `<div class="meta" style="margin-top:6px;">🕒 ${dateTxt}</div>`:''}
        ${p.ville ? `<div class="meta">📍 ${p.ville}</div>`:''}
      </div>
    </article>
  `;
}

async function chargerProjets(){
  const { data, error } = await supabase
    .from('projets')
    .select('*')
    .order('statut', { ascending: true })
    .order('debut_collecte', { ascending: false });

  if(error){ console.error(error); return; }

  elEncours.innerHTML = '';
  elAtteint.innerHTML = '';
  elAvenir.innerHTML  = '';

  (data||[]).forEach(p=>{
    const html = cardProject(p);
    if(p.statut==='atteint') elAtteint.insertAdjacentHTML('beforeend', html);
    else if(p.statut==='avenir') elAvenir.insertAdjacentHTML('beforeend', html);
    else elEncours.insertAdjacentHTML('beforeend', html);
  });
}

// temps réel sur projets
supabase
  .channel('projets-realtime')
  .on('postgres_changes', { event:'*', schema:'public', table:'projets' }, () => chargerProjets())
  .subscribe();

/* ================== COTISATIONS ================== */
const form = document.getElementById('cotisation-form');
const tbody = document.getElementById('cotisation-body');

async function chargerCotisations(){
  const { data, error } = await supabase
    .from('cotisations')
    .select('*')
    .order('date_de_cotisation', { ascending:false });

  if(error){ console.error(error); return; }

  tbody.innerHTML = '';
  (data||[]).forEach(c=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.nom}</td>
      <td>${c.telephone}</td>
      <td>${fmtXAF(c.montant)}</td>
      <td>${new Date(c.date_de_cotisation).toLocaleDateString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const nom = document.getElementById('nom').value.trim();
  const telephone = document.getElementById('telephone').value.trim();
  const montant = parseFloat(document.getElementById('montant').value);

  if(!nom || !telephone || isNaN(montant)){
    alert('Merci de compléter tous les champs.');
    return;
  }

  const { error } = await supabase
    .from('cotisations')
    .insert([{ nom, telephone, montant }]);

  if(error){
    alert('Erreur lors de l’enregistrement : ' + error.message);
    console.error(error);
  }else{
    form.reset();
    chargerCotisations();
  }
});

// temps réel sur cotisations
supabase
  .channel('cotisations-realtime')
  .on('postgres_changes', { event:'*', schema:'public', table:'cotisations' }, () => chargerCotisations())
  .subscribe();

/* ================== DÉMARRAGE ================== */
chargerProjets();
chargerCotisations();
