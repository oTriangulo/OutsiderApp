import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Importando as telas
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import PlaceRegisterScreen from './screens/PlaceRegisterScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import DetailScreen from './screens/DetailScreen'; // Atualizado para importar a tela correta

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Navegação do Drawer
const DrawerNavigator = () => (
  <Drawer.Navigator>
    <Drawer.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Drawer.Screen name="Profile" component={ProfileScreen} />
    <Drawer.Screen name="CreatePost" component={CreatePostScreen} />
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
        console.error("Erro checando o status de login", e);
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
      <Stack.Navigator initialRouteName={userToken ? "Drawer" : "Login"}>
        {/* Tela de Login */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        
        {/* Menu Lateral */}
        <Stack.Screen name="Drawer" component={DrawerNavigator} options={{ headerShown: false }} />

        {/* Outras telas */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={PlaceRegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ headerShown: false }} />

        {/* Tela de detalhes do post */}
        <Stack.Screen 
          name="Detail" 
          component={DetailScreen} 
          options={{ title: "Detalhes do Post" }} 
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
