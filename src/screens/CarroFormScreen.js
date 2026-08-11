import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';

export default function CarroFormScreen({ route, navigation }) {
  const { placa: placaParam, proprietarioId } = route.params;
  const isEditing = !!placaParam;

  const [placa, setPlaca] = useState(placaParam ?? '');
  const [modelo, setModelo] = useState('');
  const [marca, setMarca] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    (async () => {
      const { data, error } = await supabase
        .from('carros')
        .select('*')
        .eq('placa', placaParam)
        .single();

      if (error) {
        Alert.alert('Não foi possível carregar', error.message);
      } else if (data) {
        setModelo(data.modelo ?? '');
        setMarca(data.marca ?? '');
      }
      setLoading(false);
    })();
  }, [placaParam]);

  const handleSave = async () => {
    if (!placa.trim() || !modelo.trim()) {
      Alert.alert('Faltam campos', 'Informe ao menos a placa e o modelo do carro.');
      return;
    }

    setSaving(true);

    let error;
    if (isEditing) {
      // A placa é a chave primária: em edição ela fica travada e não é reenviada
      ({ error } = await supabase
        .from('carros')
        .update({ modelo: modelo.trim(), marca: marca.trim() || null })
        .eq('placa', placaParam));
    } else {
      // Vínculo automático com o proprietario atual, vindo da tela de detalhes
      ({ error } = await supabase.from('carros').insert({
        placa: placa.trim().toUpperCase(),
        modelo: modelo.trim(),
        marca: marca.trim() || null,
        proprietario_id: proprietarioId,
      }));
    }

    setSaving(false);

    if (error) {
      Alert.alert('Não foi possível salvar', error.message);
      return;
    }

    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Placa *</Text>
      <TextInput
        style={[styles.input, isEditing && styles.inputDisabled]}
        value={placa}
        onChangeText={setPlaca}
        placeholder="ABC1D23"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="characters"
        editable={!isEditing}
      />

      <Text style={styles.label}>Modelo *</Text>
      <TextInput
        style={styles.input}
        value={modelo}
        onChangeText={setModelo}
        placeholder="Ex: Onix, Gol, Corolla"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Marca</Text>
      <TextInput
        style={styles.input}
        value={marca}
        onChangeText={setMarca}
        placeholder="Ex: Chevrolet, Volkswagen"
        placeholderTextColor={colors.textSecondary}
      />

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar carro'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputDisabled: { backgroundColor: '#F0F1F4', color: colors.textSecondary },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
