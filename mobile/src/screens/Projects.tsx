import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabase';
import { colors, money } from '../theme';

type Projet = {
  id: string; titre: string; description: string | null; statut: string | null;
  objectif: number | null; montant_actuel: number | null; date_fin: string | null;
};

export default function Projects() {
  const [items, setItems] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('projets_membres')
        .select('id, titre, description, statut, objectif, montant_actuel, date_debut, date_fin')
        .eq('membre_id', user.id);
      setItems((data as Projet[]) ?? []);
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      data={items}
      keyExtractor={(p) => String(p.id)}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListEmptyComponent={<Text style={s.empty}>Aucun projet pour le moment.</Text>}
      renderItem={({ item: p }) => {
        const pct = p.objectif ? Math.min(100, Math.round((Number(p.montant_actuel || 0) / Number(p.objectif)) * 100)) : 0;
        return (
          <View style={s.card}>
            <View style={s.head}>
              <Text style={s.title}>{p.titre}</Text>
              {!!p.statut && <Text style={s.badge}>{p.statut}</Text>}
            </View>
            {!!p.description && <Text style={s.desc} numberOfLines={3}>{p.description}</Text>}
            <View style={s.bar}><View style={[s.fill, { width: `${pct}%` }]} /></View>
            <Text style={s.meta}>{money(p.montant_actuel)} / {money(p.objectif)} ({pct}%)</Text>
            {!!p.date_fin && <Text style={s.meta}>Échéance : {new Date(p.date_fin).toLocaleDateString('fr-FR')}</Text>}
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: colors.primary, flex: 1 },
  badge: { backgroundColor: '#eaf3fb', color: colors.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden', fontSize: 12 },
  desc: { color: colors.muted, marginTop: 6 },
  bar: { height: 8, backgroundColor: '#e8ecf0', borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.accent },
  meta: { color: colors.muted, marginTop: 6, fontSize: 13 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
