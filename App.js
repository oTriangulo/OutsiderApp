import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Importando as telas
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import SignUpScreen from './screens/SignUpScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import DetailScreen from './screens/DetailScreen';
import FeedProfile from './components/FeedProfile';
import SearchResultsScreen from './screens/SearchResultsScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Navegação do Drawer
const DrawerNavigator = () => (
  <Drawer.Navigator>
    <Drawer.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Drawer.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    <Drawer.Screen
      name="CreatePost"
      component={CreatePostScreen}
      options={{ title: 'Criar Post' }}
    />
    <Drawer.Screen
      name="FeedProfile"
      component={FeedProfile}
      options={{ headerShown: false }}
    />
    <Drawer.Screen
      name="SearchResults"
      component={SearchResultsScreen}
      options={{ title: 'Resultados da Pesquisa' }}
    />
  </Drawer.Navigator>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Verificando se o usuário está logado
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (e) {
        console.error('Erro checando o status de login:', e);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={userToken ? 'Drawer' : 'Login'}>
        {/* Tela de Login */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* Menu Lateral (Drawer) */}
        <Stack.Screen
          name="Drawer"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />

        {/* Outras telas */}
        <Stack.Screen
          name="Signup"
          component={SignUpScreen}
          options={{ title: 'Cadastro' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Perfil' }}
        />
        <Stack.Screen
          name="CreatePost"
          component={CreatePostScreen}
          options={{ title: 'Criar Post' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Página Inicial' }}
        />
        <Stack.Screen
          name="DetailScreen"
          component={DetailScreen}
          options={{ title: 'Detalhes do Post' }}
        />
        <Stack.Screen name="SearchResults"
        component={SearchResultsScreen} 
        options={{ title: 'Resultados da Pesquisa' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
