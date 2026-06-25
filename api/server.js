require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { sendTextMessage } = require('./whatsapp-service');
const templates = require('./templates');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(cors({
  origin: [
    'https://www.gessinvest.com',
    'https://gessinvest.com',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ]
}));

// Rate limiting — max 20 notifications / minute par IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Trop de requêtes, réessayez dans une minute.' }
});
app.use('/api/', limiter);

// Clé secrète interne pour sécuriser les appels depuis le frontend
const INTERNAL_KEY = process.env.NOTIFICATION_SECRET_KEY;

function checkKey(req, res) {
  if (!INTERNAL_KEY) return true;
  const key = req.headers['x-notification-key'];
  if (key !== INTERNAL_KEY) {
    res.status(401).json({ error: 'Clé invalide' });
    return false;
  }
  return true;
}

// ===== ROUTES =====

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'GESSINVEST WhatsApp Notifications' });
});

// Bienvenue — à l'inscription
app.post('/api/notify/bienvenue', async (req, res) => {
  if (!checkKey(req, res)) return;
  const { phone, prenom } = req.body;
  if (!phone || !prenom) return res.status(400).json({ error: 'phone et prenom requis' });

  const tpl = templates.bienvenue(prenom);
  const result = await sendTextMessage(phone, tpl.body);
  res.json(result);
});

// KYC en attente
app.post('/api/notify/kyc-en-attente', async (req, res) => {
  if (!checkKey(req, res)) return;
  const { phone, prenom } = req.body;
  if (!phone || !prenom) return res.status(400).json({ error: 'phone et prenom requis' });

  const tpl = templates.kyc_en_attente(prenom);
  const result = await sendTextMessage(phone, tpl.body);
  res.json(result);
});

// KYC approuvé
app.post('/api/notify/kyc-approuve', async (req, res) => {
  if (!checkKey(req, res)) return;
  const { phone, prenom } = req.body;
  if (!phone || !prenom) return res.status(400).json({ error: 'phone et prenom requis' });

  const tpl = templates.kyc_approuve(prenom);
  const result = await sendTextMessage(phone, tpl.body);
  res.json(result);
});

// KYC refusé
app.post('/api/notify/kyc-refuse', async (req, res) => {
  if (!checkKey(req, res)) return;
  const { phone, prenom, raison } = req.body;
  if (!phone || !prenom) return res.status(400).json({ error: 'phone et prenom requis' });

  const tpl = templates.kyc_refuse(prenom, raison);
  const result = await sendTextMessage(phone, tpl.body);
  res.json(result);
});

// Investissement confirmé (en attente de paiement)
app.post('/api/notify/investissement', async (req, res) => {
  if (!checkKey(req, res)) return;
  const { phone, prenom, montant, projet, rendement } = req.body;
  if (!phone || !prenom || !montant || !projet) {
    return res.status(400).json({ error: 'phone, prenom, montant, projet requis' });
  }

  const tpl = templates.investissement_confirme(prenom, montant, projet, rendement || 12);
  const result = await sendTextMessage(phone, tpl.body);
  res.json(result);
});

// Paiement validé par l'admin
app.post('/api/notify/paiement-valide', async (req, res) => {
  if (!checkKey(req, res)) return;
  const { phone, prenom, montant, projet, dateEcheance } = req.body;
  if (!phone || !prenom || !montant || !projet) {
    return res.status(400).json({ error: 'phone, prenom, montant, projet requis' });
  }

  const tpl = templates.paiement_valide(prenom, montant, projet, dateEcheance || 'À définir');
  const result = await sendTextMessage(phone, tpl.body);
  res.json(result);
});

// Rendement distribué
app.post('/api/notify/rendement', async (req, res) => {
  if (!checkKey(req, res)) return;
  const { phone, prenom, montantGain, projet, periode } = req.body;
  if (!phone || !prenom || !montantGain || !projet) {
    return res.status(400).json({ error: 'phone, prenom, montantGain, projet requis' });
  }

  const tpl = templates.rendement_distribue(prenom, montantGain, projet, periode || 'Ce mois');
  const result = await sendTextMessage(phone, tpl.body);
  res.json(result);
});

// Projet 100% financé
app.post('/api/notify/projet-finance', async (req, res) => {
  if (!checkKey(req, res)) return;
  const { phone, prenom, projet, totalCollecte } = req.body;
  if (!phone || !prenom || !projet) {
    return res.status(400).json({ error: 'phone, prenom, projet requis' });
  }

  const tpl = templates.projet_100_pourcent(prenom, projet, totalCollecte || 0);
  const result = await sendTextMessage(phone, tpl.body);
  res.json(result);
});

// Fonds ajoutés au compte
app.post('/api/notify/fonds-ajoutes', async (req, res) => {
  if (!checkKey(req, res)) return;
  const { phone, prenom, montant, soldeTotal } = req.body;
  if (!phone || !prenom || !montant) {
    return res.status(400).json({ error: 'phone, prenom, montant requis' });
  }

  const tpl = templates.fonds_ajoutes(prenom, montant, soldeTotal || montant);
  const result = await sendTextMessage(phone, tpl.body);
  res.json(result);
});

// Webhook WhatsApp (vérification Meta)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('[Webhook] Vérification réussie');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook WhatsApp (réception de messages entrants)
app.post('/webhook', (req, res) => {
  const body = req.body;
  if (body.object === 'whatsapp_business_account') {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const text = message.text?.body;
      console.log(`[Webhook] Message reçu de ${from}: ${text}`);
      // Ici on pourra brancher un agent IA plus tard
    }
  }
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`✅ GESSINVEST Notifications — Port ${PORT}`);
});
