import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Button, StyleSheet, Text, Image, Alert } from 'react-native';
import { supabase } from '../configs/Supabase'; // Verifique o caminho correto para o arquivo de configuração do Supabase
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Ícones do MaterialCommunity

// Substitua com o caminho correto para o arquivo da imagem padrão
const defaultProfilePic = require('../assets/PlaceHolder.png');

const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(defaultProfilePic); // Imagem padrão
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar ou esconder a senha

  const navigation = useNavigation();

  // Função para escolher uma imagem da galeria
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Desculpe, precisamos de permissões para acessar a galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.uri); // Atualiza a imagem selecionada
    }
  };

  // Função para registrar o usuário no Supabase
  const signUp = async () => {
    try {
      // Criação do usuário no Supabase (auth)
      const { user, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('Erro no signup: ', authError);
        throw authError; // Se houver erro no signup, lançar um erro
      }

      if (!user) {
        throw new Error('Erro ao criar o usuário. Usuário não retornado.');
      }

      console.log('Usuário criado: ', user);

      // Se não houver erro no registro, fazer upload da foto do perfil para o Supabase Storage
      let profilePicUrl = null;
      if (profilePicture !== defaultProfilePic) {
        // Fazendo upload da foto para o Supabase Storage
        const response = await fetch(profilePicture);
        const blob = await response.blob();
        const fileName = `profile_pics/${user.id}.png`; // Nome único para o arquivo

        const { data, error: storageError } = await supabase.storage
          .from('profile_pictures') // Certifique-se de que o bucket exista
          .upload(fileName, blob);

        if (storageError) {
          console.error('Erro no upload da imagem: ', storageError);
          throw storageError;
        }

        profilePicUrl = supabase.storage.from('profile_pictures').getPublicUrl(data.path).publicURL;
        console.log('Imagem carregada com sucesso: ', profilePicUrl);
      }

      // Salvando informações adicionais do perfil na tabela 'user_profiles'
      const { error: profileError } = await supabase.from('user_profiles').insert([
        {
          user_id: user.id, // Relaciona com o ID do usuário
          username,
          email,
          profile_picture: profilePicUrl || null,
        },
      ]);

      if (profileError) {
        console.error('Erro ao salvar perfil: ', profileError);
        throw profileError;
      }

      // Sucesso
      Alert.alert('Cadastro concluído com sucesso!');
      navigation.navigate('Login'); // Redireciona para a tela de login
    } catch (error) {
      console.error('Erro ao registrar usuário: ', error);
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      {/* Campo para Nome de Usuário */}
      <TextInput
        style={styles.input}
        placeholder="Nome de usuário"
        value={username}
        onChangeText={setUsername}
      />

      {/* Campo para Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Campo para Senha */}
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

      {/* Opção para escolher a foto de perfil */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text>Escolher Foto de Perfil</Text>
      </TouchableOpacity>

      {/* Exibe a imagem selecionada ou a imagem padrão */}
      <Image source={profilePicture} style={styles.profileImage} />

      {/* Botão de Registro */}
      <Button title="Registrar" onPress={signUp} />

      {/* Botão para voltar para a tela de login */}
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
    marginBottom: 12,  // Ajustando o espaçamento
  },
  passwordInput: {
    flex: 1, // Para ocupar o espaço restante
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
