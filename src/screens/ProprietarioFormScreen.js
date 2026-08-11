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

export default function ProprietarioFormScreen({ route, navigation }) {
  const id = route.params?.id;
  const isEditing = !!id;

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    (async () => {
      const { data, error } = await supabase
        .from('proprietario')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        Alert.alert('Não foi possível carregar', error.message);
      } else if (data) {
        setNome(data.nome ?? '');
        setTelefone(data.telefone ?? '');
        setEndereco(data.endereco ?? '');
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert('Falta um campo', 'Informe o nome do proprietário.');
      return;
    }

    setSaving(true);
    const payload = {
      nome: nome.trim(),
      telefone: telefone.trim() || null,
      endereco: endereco.trim() || null,
    };

    const { error } = isEditing
      ? await supabase.from('proprietario').update(payload).eq('id', id)
      : await supabase.from('proprietario').insert(payload);

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
      <Text style={styles.label}>Nome *</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome completo"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        placeholder="(00) 00000-0000"
        placeholderTextColor={colors.textSecondary}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Endereço</Text>
      <TextInput
        style={styles.input}
        value={endereco}
        onChangeText={setEndereco}
        placeholder="Rua, número, bairro"
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
            {isEditing ? 'Salvar alterações' : 'Cadastrar proprietário'}
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
