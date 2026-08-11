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

export default function ProprietariosListScreen({ navigation }) {
  const [proprietarios, setProprietarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProprietarios = useCallback(async () => {
    const { data, error } = await supabase
      .from('proprietario')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      Alert.alert('Não foi possível carregar', error.message);
    } else {
      setProprietarios(data ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  // Recarrega sempre que a tela ganha foco (ex: ao voltar de um cadastro)
  useFocusEffect(
    useCallback(() => {
      loadProprietarios();
    }, [loadProprietarios])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProprietarios();
  };

  const confirmDelete = (proprietario) => {
    Alert.alert(
      'Excluir proprietário',
      `Excluir "${proprietario.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => handleDelete(proprietario) },
      ]
    );
  };

  const handleDelete = async (proprietario) => {
    // Regra de negócio: só é permitido excluir um proprietario sem carros vinculados
    const { count, error: countError } = await supabase
      .from('carros')
      .select('placa', { count: 'exact', head: true })
      .eq('proprietario_id', proprietario.id);

    if (countError) {
      Alert.alert('Não foi possível verificar', countError.message);
      return;
    }

    if ((count ?? 0) > 0) {
      Alert.alert(
        'Ação bloqueada',
        `"${proprietario.nome}" possui ${count} carro(s) cadastrado(s). Remova os carros antes de excluir este proprietário.`
      );
      return;
    }

    const { error } = await supabase.from('proprietario').delete().eq('id', proprietario.id);
    if (error) {
      Alert.alert('Não foi possível excluir', error.message);
    } else {
      loadProprietarios();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardInfo}
        onPress={() => navigation.navigate('ProprietarioDetail', { id: item.id, nome: item.nome })}
      >
        <Text style={styles.nome}>{item.nome}</Text>
        {!!item.telefone && <Text style={styles.subtitle}>{item.telefone}</Text>}
        {!!item.endereco && <Text style={styles.subtitle}>{item.endereco}</Text>}
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('ProprietarioForm', { id: item.id })}
        >
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmDelete(item)}
        >
          <Text style={styles.actionText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={proprietarios}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>Nenhum proprietário ainda</Text>
            <Text style={styles.emptyText}>Toque em "+ Novo Proprietário" para cadastrar o primeiro.</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ProprietarioForm')}>
        <Text style={styles.fabText}>+ Novo Proprietário</Text>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardInfo: { marginBottom: 12 },
  nome: { fontSize: 17, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
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
