import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import ProprietariosListScreen from './src/screens/ProprietariosListScreen';
import ProprietarioFormScreen from './src/screens/ProprietarioFormScreen';
import ProprietarioDetailScreen from './src/screens/ProprietarioDetailScreen';
import CarroFormScreen from './src/screens/CarroFormScreen';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="ProprietariosList"
            component={ProprietariosListScreen}
            options={{ title: 'Proprietários' }}
          />
          <Stack.Screen
            name="ProprietarioForm"
            component={ProprietarioFormScreen}
            options={({ route }) => ({
              title: route.params?.id ? 'Editar Proprietário' : 'Novo Proprietário',
            })}
          />
          <Stack.Screen
            name="ProprietarioDetail"
            component={ProprietarioDetailScreen}
            options={({ route }) => ({ title: route.params?.nome ?? 'Detalhes' })}
          />
          <Stack.Screen
            name="CarroForm"
            component={CarroFormScreen}
            options={({ route }) => ({
              title: route.params?.placa ? 'Editar Carro' : 'Novo Carro',
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
