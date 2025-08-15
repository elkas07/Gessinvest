// api/verify-whatsapp-otp.js
// Vérifie un OTP WhatsApp stocké dans Supabase et invalide le code après usage.

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) {
      return res.status(400).json({ error: 'phone et code sont requis' });
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Variables d’environnement Supabase manquantes' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // On hash le code utilisateur pour comparer sans stocker le code en clair
    const codeHash = crypto.createHash('sha256').update(String(code)).digest('hex');
    const nowIso = new Date().toISOString();

    // 1) Chercher un OTP valide (même phone, même hash, non expiré)
    const { data: rows, error: selErr } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code_hash', codeHash)
      .gte('expires_at', nowIso)
      .order('created_at', { ascending: false })
      .limit(1);

    if (selErr) {
      return res.status(500).json({ error: 'Erreur de lecture Supabase', details: selErr.message });
    }
    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'Code invalide ou expiré' });
    }

    // 2) Invalider le code (suppression)
    const { error: delErr } = await supabase
      .from('otp_codes')
      .delete()
      .eq('phone', phone)
      .eq('code_hash', codeHash);

    if (delErr) {
      // même si la suppression échoue, on ne doit pas considérer le code comme réutilisable
      // mais on retourne une 200 avec un warning pour éviter de bloquer l’utilisateur
      return res.status(200).json({ ok: true, warning: 'Code validé mais non purgé', details: delErr.message });
    }

    // 3) (Optionnel) Marquer le numéro comme vérifié dans membres, si vous avez ce champ
    // await supabase.from('membres').update({ whatsapp_verifie: true }).eq('telephone', phone);

    return res.status(200).json({ ok: true, message: 'Numéro vérifié avec succès' });
  } catch (e) {
    console.error('verify-whatsapp-otp error:', e);
    return res.status(500).json({ error: 'Erreur serveur', details: e.message });
  }
}
