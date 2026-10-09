import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabase';
import { colors } from '../theme';

export default function Profile() {
  const [info, setInfo] = useState<{ name?: string; email?: string; phone?: string }>({});

  useFocusEffect(useCallback(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('members').select('name, email, phone').eq('id', user.id).maybeSingle();
      setInfo({ name: data?.name, email: data?.email ?? user.email ?? '', phone: data?.phone });
    })();
  }, []));

  const confirmDelete = () =>
    Alert.alert(
      'Supprimer mon compte',
      "Pour supprimer votre compte et vos données, écrivez-nous depuis l'adresse email de votre compte. Nous traiterons la demande sous 30 jours.",
    );

  return (
    <View style={s.wrap}>
      <View style={s.card}>
        <Text style={s.label}>Nom</Text><Text style={s.value}>{info.name || '-'}</Text>
        <Text style={s.label}>Email</Text><Text style={s.value}>{info.email || '-'}</Text>
        <Text style={s.label}>Téléphone</Text><Text style={s.value}>{info.phone || '-'}</Text>
      </View>
      <Pressable style={s.btn} onPress={() => supabase.auth.signOut()}>
        <Text style={s.btnText}>Se déconnecter</Text>
      </Pressable>
      <Text style={s.link} onPress={confirmDelete}>Supprimer mon compte</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20 },
  label: { color: colors.muted, fontSize: 12, marginTop: 8 },
  value: { color: colors.text, fontSize: 16, fontWeight: '600' },
  btn: { backgroundColor: colors.primary, padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  link: { color: colors.danger, textAlign: 'center', marginTop: 20 },
});
