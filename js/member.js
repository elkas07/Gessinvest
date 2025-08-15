// js/membre.js
import { supabase } from './supabase.js';

/**
 * Formate le montant en ajoutant "XAF" et en gérant les nombres nuls.
 * @param {number} value Le montant à formater.
 * @returns {string} Le montant formaté.
 */
function formatAmount(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('fr-FR') + ' XAF';
}

/**
 * Crée une ligne de tableau HTML pour une cotisation.
 * @param {object} cotisation L'objet de cotisation avec le montant et la date.
 * @returns {string} Le code HTML de la ligne.
 */
function createRow(cotisation) {
  const formattedAmount = formatAmount(cotisation.montant);
  const formattedDate = new Date(cotisation.date_de_cotisation).toLocaleDateString();
  
  return `
    <tr>
      <td>${formattedAmount}</td>
      <td>${formattedDate}</td>
    </tr>
  `;
}

/**
 * Gère l'affichage des données dans le tableau.
 * @param {Array} data Les données de cotisations à afficher.
 */
function renderContributions(data) {
  const tableBody = document.getElementById('body-cotis');
  
  if (!tableBody) {
    console.error("L'élément avec l'ID 'body-cotis' est introuvable.");
    return;
  }
  
  if (!data || data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="2" class="empty-message">Aucune cotisation enregistrée.</td></tr>';
  } else {
    const rowsHtml = data.map(createRow).join('');
    tableBody.innerHTML = rowsHtml;
  }
}

/**
 * Charge les cotisations depuis Supabase et les affiche.
 */
async function loadContributions() {
  const tableBody = document.getElementById('body-cotis');
  if (tableBody) {
    tableBody.innerHTML = '<tr><td colspan="2" class="loading-message">Chargement en cours...</td></tr>';
  }

  const { data, error } = await supabase
    .from('cotisations')
    .select('montant, date_de_cotisation')
    .order('date_de_cotisation', { ascending: false });

  if (error) {
    console.error("Erreur lors du chargement des cotisations:", error.message);
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="2" class="error-message">Erreur lors du chargement des données.</td></tr>';
    }
  } else {
    renderContributions(data);
  }
}

// Démarre le chargement des données au chargement de la page
document.addEventListener('DOMContentLoaded', loadContributions);