import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';

export default function ProprietarioDetailScreen({ route, navigation }) {
  const { id } = route.params;

  const [proprietario, setProprietario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDetail = useCallback(async () => {
    // Nested select: traz o proprietario e os carros vinculados em uma única chamada,
    // usando a foreign key carros.proprietario_id -> proprietario.id
    const { data, error } = await supabase
      .from('proprietario')
      .select('*, carros(*)')
      .eq('id', id)
      .single();

    if (error) {
      Alert.alert('Não foi possível carregar', error.message);
    } else {
      setProprietario(data);
      navigation.setOptions({ title: data?.nome ?? 'Detalhes' });
    }
    setLoading(false);
    setRefreshing(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDetail();
  };

  const confirmDeleteProprietario = () => {
    Alert.alert(
      'Excluir proprietário',
      `Excluir "${proprietario.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: handleDeleteProprietario },
      ]
    );
  };

  const handleDeleteProprietario = async () => {
    // Regra de negócio: só permite excluir se não houver carros vinculados
    const carrosCount = proprietario.carros?.length ?? 0;
    if (carrosCount > 0) {
      Alert.alert(
        'Ação bloqueada',
        `"${proprietario.nome}" possui ${carrosCount} carro(s) cadastrado(s). Remova os carros antes de excluir este proprietário.`
      );
      return;
    }

    const { error } = await supabase.from('proprietario').delete().eq('id', proprietario.id);
    if (error) {
      Alert.alert('Não foi possível excluir', error.message);
    } else {
      navigation.goBack();
    }
  };

  const confirmDeleteCarro = (carro) => {
    Alert.alert(
      'Excluir carro',
      `Excluir o carro "${carro.modelo}" (placa ${carro.placa})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => handleDeleteCarro(carro) },
      ]
    );
  };

  const handleDeleteCarro = async (carro) => {
    const { error } = await supabase.from('carros').delete().eq('placa', carro.placa);
    if (error) {
      Alert.alert('Não foi possível excluir', error.message);
    } else {
      loadDetail();
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!proprietario) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Proprietário não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={proprietario.carros ?? []}
        keyExtractor={(item) => item.placa}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerCard}>
            <Text style={styles.nome}>{proprietario.nome}</Text>
            {!!proprietario.telefone && <Text style={styles.subtitle}>Telefone: {proprietario.telefone}</Text>}
            {!!proprietario.endereco && <Text style={styles.subtitle}>Endereço: {proprietario.endereco}</Text>}

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => navigation.navigate('ProprietarioForm', { id: proprietario.id })}
              >
                <Text style={styles.actionText}>Editar proprietário</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={confirmDeleteProprietario}
              >
                <Text style={styles.actionText}>Excluir proprietário</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Carros</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.carroModelo}>{item.modelo}</Text>
              {!!item.marca && <Text style={styles.subtitle}>{item.marca}</Text>}
              <Text style={styles.subtitle}>Placa: {item.placa}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() =>
                  navigation.navigate('CarroForm', {
                    placa: item.placa,
                    proprietarioId: proprietario.id,
                  })
                }
              >
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => confirmDeleteCarro(item)}
              >
                <Text style={styles.actionText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>Nenhum carro cadastrado</Text>
            <Text style={styles.emptyText}>Toque em "+ Novo Carro" para vincular o primeiro a este proprietário.</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CarroForm', { proprietarioId: proprietario.id })}
      >
        <Text style={styles.fabText}>+ Novo Carro</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, paddingBottom: 96, flexGrow: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nome: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  headerActions: { flexDirection: 'row', marginTop: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardInfo: { marginBottom: 12 },
  carroModelo: { fontSize: 16, fontWeight: '700', color: colors.text },
  actions: { flexDirection: 'row' },
  actionButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, marginRight: 8 },
  editButton: { backgroundColor: colors.chipEdit },
  deleteButton: { backgroundColor: colors.chipDelete },
  actionText: { fontWeight: '600', fontSize: 13, color: colors.text },
  fab: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fabText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
