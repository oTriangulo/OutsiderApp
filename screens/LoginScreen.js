import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, ActivityIndicator, Text, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../configs/Supabase'; // Configuração do Supabase
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Função de login
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

      // Navega para a tela "Profile" após o login bem-sucedido
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
    width: 200, // Aumente a largura da logo para evitar corte
    height: 200, // Ajuste a altura conforme necessário
    marginBottom: 30, // Espaçamento entre a logo e os campos
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
