// Templates de messages WhatsApp pour GESSINVEST

const templates = {

  bienvenue: (prenom) => ({
    type: 'text',
    body: `🏠 *Bienvenue sur GESSINVEST, ${prenom} !*

Vous faites maintenant partie de la première plateforme de crowdfunding immobilier au Tchad.

✅ Votre compte a été créé avec succès.

📋 *Prochaines étapes :*
1️⃣ Vérifiez votre identité (KYC)
2️⃣ Parcourez nos projets immobiliers
3️⃣ Faites votre premier investissement dès 10 000 CFA

💬 Des questions ? Répondez à ce message, notre équipe vous répond rapidement.

_GESS — Groupe d'Entreprises de Services et Solutions_`
  }),

  kyc_en_attente: (prenom) => ({
    type: 'text',
    body: `📋 *Vérification d'identité reçue*

Bonjour ${prenom},

Nous avons bien reçu vos documents KYC.

⏳ *Délai de traitement :* 24 heures ouvrées

Vous serez notifié dès que votre vérification sera complétée. Une fois validé, vous pourrez investir sans limite.

_GESSINVEST — Investissement Immobilier au Tchad_`
  }),

  kyc_approuve: (prenom) => ({
    type: 'text',
    body: `✅ *Vérification d'identité approuvée !*

Félicitations ${prenom} !

Votre compte est maintenant *entièrement vérifié*. Vous pouvez investir sans limite sur nos projets immobiliers.

🏠 *Découvrez nos projets :* www.gessinvest.com

💡 Utilisez le simulateur pour calculer vos gains avant d'investir.

_GESSINVEST_`
  }),

  kyc_refuse: (prenom, raison) => ({
    type: 'text',
    body: `❌ *Vérification d'identité refusée*

Bonjour ${prenom},

Malheureusement, votre vérification n'a pas pu être validée.

*Raison :* ${raison || 'Documents illisibles ou incomplets'}

📋 *Comment corriger :*
• Assurez-vous que votre pièce d'identité est lisible
• La photo doit être nette et non floue
• Tous les coins du document doivent être visibles

Reconnectez-vous pour soumettre de nouveaux documents.

_GESSINVEST — Support : répondez à ce message_`
  }),

  investissement_confirme: (prenom, montant, projet, rendement) => ({
    type: 'text',
    body: `🎉 *Investissement enregistré avec succès !*

Bonjour ${prenom},

Votre investissement a bien été enregistré et est en attente de validation du paiement.

📊 *Détails de votre investissement :*
• Projet : *${projet}*
• Montant : *${Number(montant).toLocaleString('fr-FR')} CFA*
• Rendement estimé : *${rendement}% / an*
• Gains annuels estimés : *${Math.round(montant * rendement / 100).toLocaleString('fr-FR')} CFA*

⏳ *Statut :* En attente de confirmation de paiement

Vous recevrez une notification dès que votre paiement sera validé.

_GESSINVEST — Suivi : www.gessinvest.com_`
  }),

  paiement_valide: (prenom, montant, projet, dateEcheance) => ({
    type: 'text',
    body: `💰 *Paiement validé — Vous êtes investisseur !*

Félicitations ${prenom} !

Votre paiement a été confirmé. Vous êtes maintenant *copropriétaire* du projet.

✅ *Confirmation :*
• Projet : *${projet}*
• Montant investi : *${Number(montant).toLocaleString('fr-FR')} CFA*
• Date d'échéance : *${dateEcheance}*

📱 Suivez l'avancement de votre investissement depuis votre espace personnel sur www.gessinvest.com

_GESSINVEST_`
  }),

  rendement_distribue: (prenom, montantGain, projet, periode) => ({
    type: 'text',
    body: `💵 *Rendement crédité sur votre compte !*

Bonjour ${prenom},

Votre rendement pour la période *${periode}* vient d'être crédité.

📊 *Détails :*
• Projet : *${projet}*
• Rendement reçu : *${Number(montantGain).toLocaleString('fr-FR')} CFA*

💳 Votre solde GESSINVEST a été mis à jour. Vous pouvez le réinvestir ou demander un retrait depuis votre espace.

_GESSINVEST — Merci de votre confiance_`
  }),

  projet_100_pourcent: (prenom, projet, totalCollecte) => ({
    type: 'text',
    body: `🏆 *Projet 100% financé !*

Bonjour ${prenom},

Excellente nouvelle ! Le projet dans lequel vous avez investi vient d'atteindre *100% de son financement* !

🏠 *${projet}*
💰 Total collecté : *${Number(totalCollecte).toLocaleString('fr-FR')} CFA*

Le projet entre maintenant en phase de réalisation. Vous recevrez des mises à jour régulières sur son avancement.

_GESSINVEST_`
  }),

  rappel_investissement: (prenom, projet, pourcentage, montantRestant) => ({
    type: 'text',
    body: `⏰ *Le projet qui vous intéresse se remplit rapidement !*

Bonjour ${prenom},

Le projet *${projet}* est financé à *${pourcentage}%*.

Il ne reste que *${Number(montantRestant).toLocaleString('fr-FR')} CFA* à collecter avant la clôture.

👉 Investissez maintenant pour ne pas manquer cette opportunité : www.gessinvest.com

_GESSINVEST_`
  }),

  fonds_ajoutes: (prenom, montant, soldeTotal) => ({
    type: 'text',
    body: `✅ *Fonds ajoutés à votre compte*

Bonjour ${prenom},

Votre dépôt a été validé avec succès.

💰 *Montant ajouté :* ${Number(montant).toLocaleString('fr-FR')} CFA
💳 *Nouveau solde :* ${Number(soldeTotal).toLocaleString('fr-FR')} CFA

Vous pouvez maintenant utiliser ces fonds pour investir dans nos projets immobiliers.

_GESSINVEST — www.gessinvest.com_`
  }),

};

module.exports = templates;
