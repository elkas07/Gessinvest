const axios = require('axios');

const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const TOKEN = process.env.WHATSAPP_API_TOKEN;

// Formate le numéro pour WhatsApp (préfixe Tchad +235)
function formatPhone(phone) {
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('235')) return cleaned;
  if (cleaned.startsWith('0')) return '235' + cleaned.slice(1);
  return '235' + cleaned;
}

// Envoi d'un message texte simple
async function sendTextMessage(phone, body) {
  const to = formatPhone(phone);
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body }
  };

  try {
    const res = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return { success: true, messageId: res.data.messages?.[0]?.id };
  } catch (err) {
    const errData = err.response?.data || err.message;
    console.error('[WhatsApp] Erreur envoi:', errData);
    return { success: false, error: errData };
  }
}

// Envoi d'un message avec template approuvé Meta (pour marketing)
async function sendTemplateMessage(phone, templateName, components = []) {
  const to = formatPhone(phone);
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'fr' },
      components
    }
  };

  try {
    const res = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return { success: true, messageId: res.data.messages?.[0]?.id };
  } catch (err) {
    const errData = err.response?.data || err.message;
    console.error('[WhatsApp] Erreur template:', errData);
    return { success: false, error: errData };
  }
}

module.exports = { sendTextMessage, sendTemplateMessage, formatPhone };
