import { StatusBar } from 'expo-status-bar';
import {ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  //checando se o usuário está olgado
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
    // faz com que fique girando umas bolinhas pra mostrar que está carregando
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>


// código que não consegui fazer funcionar de jeito nenhum, tomara q o app pare de funcionar
//    <NavigationContainer>
//      <Stack.Navigator>
//        {userToken ? (
//          // Se o usuario estiver logado, mostra a Home
//          <Stack.Screen name="Home" component={HomeScreen} />
//        ) : (
//          // Se não estiver logado, mostra o Login
//          <Stack.Screen name="Login" component={LoginScreen} />
//        )}
//      </Stack.Navigator>
//   </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 
