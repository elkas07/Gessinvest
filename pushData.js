// pushData.js
import { supabase } from './supabase.js';

// Exemple de données - À REMPLACER AVEC VOS DONNÉES
const vosDonnees = [
  { id: 1, nom: "Projet A", montant: 15000 },
  { id: 2, nom: "Projet B", montant: 22000 }
];

async function pousserDonnees() {
  console.log("Début de l'envoi des données...");
  
  // 1. Vérifier la connexion
  const { data: session, error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error("Erreur de connexion:", authError.message);
    return;
  }
  console.log("✅ Connecté à Supabase | User:", session.user?.email);

  // 2. Envoyer les données
  const { data, error } = await supabase
    .from('votre_table') // ⚠️ REMPLACER par votre nom de table
    .upsert(vosDonnees, { onConflict: 'id' }); // Mise à jour si ID existe
  
  // 3. Gérer les résultats
  if (error) {
    console.error("❌ Erreur d'envoi:", error.message);
    return;
  }

  console.log("✅ Données envoyées avec succès !");
  console.log("Enregistrements affectés:", data.length);
  console.log(data);
}

pousserDonnees();