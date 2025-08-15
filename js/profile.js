// js/profile.js
import { supabase } from './supabase.js';

const $ = (s) => document.querySelector(s);

async function ensureAuth() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    alert('Veuillez vous connecter.');
    location.href = 'login.html';
    return null;
  }
  return user;
}

async function loadProfile(user) {
  $('#email').value = user.email || '';

  // Charger infos supplémentaires depuis table 'membres'
  const { data, error } = await supabase
    .from('membres')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.warn('Pas encore de profil enregistré, veuillez compléter.');
    return;
  }

  $('#nom').value = data.nom || '';
  $('#telephone').value = data.telephone || '';
  $('#adresse').value = data.adresse || '';
  $('#totalCotise').textContent = data.total_cotise ? `${data.total_cotise} XAF` : '0 XAF';
}

async function saveProfile(user) {
  const payload = {
    nom: $('#nom').value.trim(),
    telephone: $('#telephone').value.trim(),
    adresse: $('#adresse').value.trim()
  };

  const { error } = await supabase
    .from('membres')
    .upsert({ id: user.id, ...payload });

  if (error) {
    alert('Erreur lors de la sauvegarde : ' + error.message);
    return;
  }
  alert('Profil mis à jour avec succès.');
}

// Déconnexion
function logout() {
  supabase.auth.signOut().then(() => {
    location.href = 'login.html';
  });
}

// ----------------- BOOT -------------------
(async function boot() {
  const user = await ensureAuth();
  if (!user) return;

  await loadProfile(user);

  $('#saveBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await saveProfile(user);
  });

  $('#logoutBtn').addEventListener('click', logout);
})();
