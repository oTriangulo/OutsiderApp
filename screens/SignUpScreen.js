import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, Image, StyleSheet } from 'react-native';
import { supabase } from '../configs/Supabase'; // Certifique-se de que esse caminho está correto.
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfilePicture(result.uri); // Atualizado para 'canceled', que é usado no Expo mais recente.
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
    }
  };

  const signUp = async () => {
    try {
      if (!email || !password || !username) {
        alert('Preencha todos os campos.');
        return;
      }

      console.log('Iniciando cadastro com email:', email);

      // Cadastrar no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error('Erro ao cadastrar usuário no Auth:', signUpError);
        throw new Error('Erro ao criar conta. Verifique suas informações.');
      }

      console.log('Resposta do signUp:', signUpData);

      // Verificar se o usuário foi criado e obter o ID
      const user = signUpData?.user;
      if (!user || !user.id) {
        throw new Error('Usuário não encontrado após o cadastro.');
      }

      console.log('Usuário autenticado com ID:', user.id);

      // Inserir dados na tabela user_profiles
      const { error: profileError } = await supabase.from('user_profiles').insert([
        {
          id: user.id, // ID do usuário autenticado
          username: username,
          email: email,
          profile_picture: profilePicture || null,
        },
      ]);

      if (profileError) {
        console.error('Erro ao inserir dados no user_profiles:', profileError);
        throw new Error('Erro ao salvar dados adicionais do perfil.');
      }

      console.log('Dados do perfil salvos com sucesso.');

      // Navegar para a tela de login após sucesso
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro no cadastro:', error.message || error);
      alert(error.message || 'Erro desconhecido. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome de usuário"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text>Escolher Foto de Perfil</Text>
      </TouchableOpacity>

      {profilePicture && (
        <Image source={{ uri: profilePicture }} style={styles.profileImage} />
      )}

      <Button title="Registrar" onPress={signUp} />

      <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.goBackText}>Voltar para Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
  },
  imagePicker: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#dcdcdc',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
    alignSelf: 'center',
  },
  goBackButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  goBackText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SignUpScreen;
