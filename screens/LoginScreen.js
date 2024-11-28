import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../configs/Supabase';

//login screen  além de fazer o login do usuário, também verifica se o já existe um usuário logado para direciona-lo para tela de login ou home
const LoginScreen = ({ navigation }) => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true); 

  // useEffect para checar se já existe um token salvo no AsyncStorage, justamente para direcionar o usuário para a tela de login ou home caso exista
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const { data, error } = await supabase.auth.getSession();
          if (error || !data?.session) {
            await AsyncStorage.removeItem('userToken'); 
          } else {
            navigation.replace('Home'); 
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error.message);
      } finally {
        setCheckingSession(false); 
      }
    };

    checkUserSession();
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro de validação', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error('Credenciais inválidas. Por favor, tente novamente.');
      }
      // Se o login for bem-sucedido, salva o token de sessão no AsyncStorage para que o usuário possa navegar para a tela de home sem precisar fazer login novamente
      const token = data.session.access_token;
      await AsyncStorage.setItem('userToken', token);

      navigation.replace('Home'); 
    } catch (error) {
      Alert.alert('Erro no Login', error.message || 'Algo deu errado.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9D00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#FF9D00" />
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      )}
      <Text onPress={() => navigation.navigate('Signup')} style={styles.link}>
        Cadastre-se
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  loginButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#007bff',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 16,
    color: '#007bff',
    textAlign: 'center',
  },
});

export default LoginScreen;
