// GESSINVEST — Notifications WhatsApp
// Remplace cette URL par l'URL Railway après déploiement
const NOTIF_API_URL = window.GESSINVEST_NOTIF_URL || 'https://gessinvest-notifications.railway.app';
const NOTIF_KEY = window.GESSINVEST_NOTIF_KEY || '';

async function sendNotification(endpoint, data) {
  try {
    const res = await fetch(`${NOTIF_API_URL}/api/notify/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-notification-key': NOTIF_KEY
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) {
      console.warn('[Notif WhatsApp] Non envoyé:', json.error);
    }
    return json;
  } catch (err) {
    console.warn('[Notif WhatsApp] Erreur réseau:', err.message);
    return { success: false };
  }
}

// Appels publics utilisés depuis index.html
const GESSNotif = {
  bienvenue: (phone, prenom) =>
    sendNotification('bienvenue', { phone, prenom }),

  kycEnAttente: (phone, prenom) =>
    sendNotification('kyc-en-attente', { phone, prenom }),

  kycApprouve: (phone, prenom) =>
    sendNotification('kyc-approuve', { phone, prenom }),

  kycRefuse: (phone, prenom, raison) =>
    sendNotification('kyc-refuse', { phone, prenom, raison }),

  investissement: (phone, prenom, montant, projet, rendement) =>
    sendNotification('investissement', { phone, prenom, montant, projet, rendement }),

  paiementValide: (phone, prenom, montant, projet, dateEcheance) =>
    sendNotification('paiement-valide', { phone, prenom, montant, projet, dateEcheance }),

  rendement: (phone, prenom, montantGain, projet, periode) =>
    sendNotification('rendement', { phone, prenom, montantGain, projet, periode }),

  projetFinance: (phone, prenom, projet, totalCollecte) =>
    sendNotification('projet-finance', { phone, prenom, projet, totalCollecte }),

  fondsAjoutes: (phone, prenom, montant, soldeTotal) =>
    sendNotification('fonds-ajoutes', { phone, prenom, montant, soldeTotal }),
};
