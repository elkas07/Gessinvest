// js/member-projects.js
import { supabase } from './supabase.js';

const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const cardsEl = $('#cards');
const emptyEl = $('#empty');

const FMT = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const fmtXAF = (v) => `${FMT.format(Number(v || 0))} XAF`;

let cache = [];        // participations + projet
let currentFilter = ''; // '', 'encours', 'fini', 'avenir'

// ---- RENDER ---------------------------------------------------------------

function cardTemplate(row) {
  const p = row.projets || {};
  const img = p.image || 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=60';
  const objectif = Number(p.objectif || 0);
  const collecte = Number(p.montant_collecte || 0);
  const pct = objectif > 0 ? Math.min(100, Math.round((collecte / objectif) * 100)) : 0;
  const etat = (p.etat || 'encours').toLowerCase();

  const badge = etat === 'fini' ? 'Atteint'
              : etat === 'avenir' ? 'À venir'
              : 'En cours';

  const badgeStyle = etat === 'fini'
    ? 'background:#e9fff2;color:#0f8a4c;border:1px solid #bce8d1'
    : etat === 'avenir'
      ? 'background:#fff9e6;color:#9a6a00;border:1px solid #f0df9c'
      : 'background:#ffe9e9;color:#c40000;border:1px solid #efb5b5';

  return `
  <article class="card" style="background:#fff;border:1px solid #eee;border-radius:8px;overflow:hidden;">
    <img src="${img}" alt="${p.titre || 'Projet'}" loading="lazy" style="height:180px;object-fit:cover;">
    <div class="card-body" style="color:#333">
      <div class="badges" style="display:flex;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
        <span class="badge" style="${badgeStyle};padding:4px 8px;border-radius:999px;font-size:12px;font-weight:600">${badge}</span>
        ${p.ville ? `<span class="badge" style="background:#f4f4f4;border:1px solid #e5e5e5;color:#555">${p.ville}</span>` : ''}
      </div>
      <h3 class="card-title" style="margin:0 0 6px">${p.titre || 'Projet immobilier'}</h3>
      <div class="card-meta" style="font-size:14px;color:#666">
        <span>Objectif: <b>${fmtXAF(objectif)}</b></span> •
        <span>Collecté: <b>${fmtXAF(collecte)}</b></span>
      </div>

      <div class="progress" style="height:8px;background:#eee;border-radius:999px;overflow:hidden;margin-top:8px;">
        <span style="display:block;height:100%;width:${pct}%;background:linear-gradient(90deg,#ff4d4d,#c40000)"></span>
      </div>
      <div style="font-size:13px;color:#777;margin-top:6px">${pct}% atteint</div>

      <div style="margin-top:10px;padding-top:10px;border-top:1px dashed #eee;display:flex;gap:10px;flex-wrap:wrap;font-size:14px;color:#444">
        <div>Vos parts: <b>${Number(row.parts || 0)}</b></div>
        <div>Votre montant: <b>${fmtXAF(row.montant || 0)}</b></div>
      </div>
    </div>
  </article>`;
}

function render() {
  // filtre
  let rows = cache;
  if (currentFilter) {
    rows = rows.filter(r => (r.projets?.etat || '').toLowerCase() === currentFilter);
  }

  // affichage
  if (!rows.length) {
    cardsEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';
  cardsEl.innerHTML = rows.map(cardTemplate).join('');
}

// ---- LOAD DATA ------------------------------------------------------------

async function ensureAuth() {
  // Si tu veux obliger la connexion, décommente :
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) { location.href = 'login.html'; return null; }
  // return user;
  return true; // lecture publique autorisée si RLS le permet
}

async function loadData() {
  // Récupère les participations avec la jointure sur projets
  // Tables attendues:
  // participations(id, user_id, parts, montant, projet_id, created_at)
  // projets(id, titre, objectif, montant_collecte, etat, image, ville, date_collecte)
  const { data, error } = await supabase
    .from('participations')
    .select('id, parts, montant, projets ( id, titre, objectif, montant_collecte, etat, image, ville, date_collecte )')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[member-projects] load error:', error.message);
    cardsEl.innerHTML = `<div style="color:#c40000">Erreur de chargement: ${error.message}</div>`;
    return;
  }

  cache = data || [];
  render();
}

// ---- FILTERS --------------------------------------------------------------

function bindFilters() {
  $('#flt-tous')?.addEventListener('click', () => { currentFilter = '';       render(); });
  $('#flt-encours')?.addEventListener('click', () => { currentFilter = 'encours'; render(); });
  $('#flt-fini')?.addEventListener('click', () => { currentFilter = 'fini';      render(); });
  $('#flt-avenir')?.addEventListener('click', () => { currentFilter = 'avenir';   render(); });
}

// ---- REALTIME -------------------------------------------------------------

function subscribeRealtime() {
  // Sur changements projets/participations → recharger
  supabase.channel('rt-participations')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'participations' }, () => loadData())
    .subscribe();

  supabase.channel('rt-projets')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projets' }, () => loadData())
    .subscribe();
}

// ---- BOOT -----------------------------------------------------------------

(async function boot() {
  await ensureAuth();
  bindFilters();
  // état de chargement
  cardsEl.innerHTML = '<div style="color:#666">Chargement…</div>';
  await loadData();
  subscribeRealtime();
})();
