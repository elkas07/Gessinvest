import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../supabase';
import { colors } from '../theme';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return Alert.alert('Champs requis', 'Email et mot de passe sont obligatoires.');
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else {
        if (!name.trim()) throw new Error('Le nom est obligatoire.');
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim(), phone: phone.trim() } },
        });
        if (error) throw error;
        Alert.alert('Compte créé', 'Vérifiez votre email pour confirmer votre inscription, puis connectez-vous.');
        setMode('login');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? 'Une erreur est survenue.');
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) return Alert.alert('Mot de passe oublié', "Saisissez d'abord votre email.");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    Alert.alert(error ? 'Erreur' : 'Email envoyé', error ? error.message : 'Consultez votre boîte mail pour réinitialiser le mot de passe.');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <Text style={s.brand}>GESSINVEST</Text>
        <Text style={s.sub}>{mode === 'login' ? 'Connexion à votre espace membre' : 'Créer un compte membre'}</Text>
        {mode === 'register' && (
          <>
            <TextInput style={s.input} placeholder="Nom complet" value={name} onChangeText={setName} />
            <TextInput style={s.input} placeholder="Téléphone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          </>
        )}
        <TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={s.input} placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />
        <Pressable style={s.btn} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{mode === 'login' ? 'Se connecter' : "S'inscrire"}</Text>}
        </Pressable>
        {mode === 'login' && <Text style={s.link} onPress={forgot}>Mot de passe oublié ?</Text>}
        <Text style={s.link} onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà membre ? Connectez-vous'}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.bg },
  brand: { fontSize: 32, fontWeight: '800', color: colors.primary, textAlign: 'center', letterSpacing: 2 },
  sub: { textAlign: 'center', color: colors.muted, marginBottom: 24, marginTop: 4 },
  input: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e1e5ea', padding: 14, marginBottom: 12, fontSize: 16 },
  btn: { backgroundColor: colors.accent, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: colors.accent, textAlign: 'center', marginTop: 16 },
});
