import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, StyleSheet, ActivityIndicator, Text, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../configs/Supabase'; // Configuração do Supabase
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUserSession = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        // Se já houver um token armazenado, o usuário está autenticado
        navigation.replace('Home');
      } else {
        // Caso contrário, permanece na tela de login
        const session = supabase.auth.session();
        if (session) {
          // Caso já tenha uma sessão ativa
          navigation.replace('Home');
        }
      }
    };

    checkUserSession();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      // Login com Supabase usando email e senha
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Salva o token do usuário localmente
      const token = data.session.access_token;
      await AsyncStorage.setItem('userToken', token);

      // Navega para a tela "Home" após o login bem-sucedido
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Falha no Login', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo acima dos campos de login */}
      <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={login}>
          <Text style={styles.buttonText}>Login</Text>
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
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    width: '100%',
    borderRadius: 8,
  },
  loginButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#FF9D00',
    borderRadius: 14,
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
