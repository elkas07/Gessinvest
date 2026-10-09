import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabase';
import { colors, money } from '../theme';

type Cotisation = { montant: number; date_de_cotisation: string };

export default function Dashboard() {
  const [name, setName] = useState('');
  const [items, setItems] = useState<Cotisation[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: m } = await supabase.from('members').select('name').eq('id', user.id).maybeSingle();
      setName(m?.name ?? user.email ?? '');
      const { data } = await supabase
        .from('cotisations')
        .select('montant, date_de_cotisation')
        .eq('uuid', user.id)
        .order('date_de_cotisation', { ascending: false });
      setItems(data ?? []);
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const total = items.reduce((sum, c) => sum + Number(c.montant || 0), 0);

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      data={items}
      keyExtractor={(_, i) => String(i)}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListHeaderComponent={
        <View>
          <Text style={s.hello}>Bonjour {name}</Text>
          <View style={s.total}>
            <Text style={s.totalLabel}>Total de mes cotisations</Text>
            <Text style={s.totalValue}>{money(total)}</Text>
          </View>
          <Text style={s.h2}>Historique</Text>
        </View>
      }
      ListEmptyComponent={<Text style={s.empty}>Aucune cotisation enregistrée.</Text>}
      renderItem={({ item }) => (
        <View style={s.row}>
          <Text style={s.date}>{item.date_de_cotisation ? new Date(item.date_de_cotisation).toLocaleDateString('fr-FR') : '-'}</Text>
          <Text style={s.amount}>{money(item.montant)}</Text>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  hello: { fontSize: 22, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  total: { backgroundColor: colors.primary, borderRadius: 14, padding: 20, marginBottom: 20 },
  totalLabel: { color: '#cfd8e3' },
  totalValue: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  h2: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8 },
  date: { color: colors.muted },
  amount: { fontWeight: '700', color: colors.success },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 24 },
});
