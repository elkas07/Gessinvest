// api/send-whatsapp-otp.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Numéro et OTP requis' });
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.PHONE_NUMBER_ID;

    const messageBody = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: `Votre code OTP GESSINVEST est : ${otp}` }
    };

    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageBody)
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(500).json({ error: 'Erreur envoi WhatsApp', details: data });
    }

  } catch (error) {
    console.error('Erreur API WhatsApp :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
