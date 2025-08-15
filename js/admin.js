// Importation du client Supabase
import { supabase } from './supabase.js';

/**
 * Charge les données des membres depuis Supabase et met à jour le KPI.
 */
async function loadKpis() {
  try {
    // 1. Récupérer le nombre total de membres
    const { data: members, error } = await supabase
      .from('membres')
      .select('id');

    // Gérer les erreurs de la requête
    if (error) {
      console.error("Erreur lors du chargement des membres :", error.message);
      // Option : afficher un message d'erreur à l'utilisateur
      // document.getElementById('kpi-total').textContent = 'Erreur';
      return;
    }

    // 2. Mettre à jour l'affichage de l'interface utilisateur
    const totalMembers = members ? members.length : 0;
    const kpiElement = document.getElementById('kpi-total');

    if (kpiElement) {
      kpiElement.textContent = totalMembers;
    } else {
      console.warn("L'élément avec l'ID 'kpi-total' n'a pas été trouvé.");
    }

  } catch (err) {
    // Gérer les erreurs inattendues
    console.error("Une erreur inattendue est survenue :", err);
  }
}

// Lancer la fonction au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadKpis();
});