import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  Image,
  StyleSheet,
} from 'react-native';
import { supabase } from '../configs/Supabase';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import uuid from 'react-native-uuid';

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

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
    }
  };

  // Função que faz o upload da imagem para dentro do bucket, a mesma função que é utilizada no login
  const uploadImageToBucket = async (uri, userId) => {
    try {
      if (!uri) {
        Alert.alert('Erro', 'Nenhuma imagem foi selecionada.');
        return null;
      }
  
      // Const para configurar o nome do arquivo
      const fileExt = uri.split('.').pop();
      const fileName = `${uuid.v4()}.${fileExt}`;
  
      // Iniciar o upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('files') // nome do nosso bucket (importante, deu muito problema)
        .upload(`profile_pictures/${fileName}`, { //definição de nome da pasta para fazer o upload
          uri,
          type: `image/${fileExt}`,
          name: fileName,
        });
  
      if (error) { // se der erro no upload do arquivo, retorna null e mostra o erro
        console.error('Erro no Supabase ao fazer upload:', error.message);
        Alert.alert('Erro ao fazer upload', error.message);
        return null;
      }
  
      // Gerar URL pública da imagem no bucket
      const { publicUrl } = supabase.storage
        .from('files')
        .getPublicUrl(`profile_pictures/${fileName}`).data;
  
      return publicUrl; // Retorna a URL pública do arquivo
    } catch (error) {
      console.error('Erro ao fazer upload:', error.message);
      Alert.alert('Erro ao fazer upload', 'Verifique sua conexão e tente novamente.');
      return null;
    }
  };

  // Função de cadastro do usuário
  const signUp = async () => {
    try {
      if (!email || !password || !username) {
        alert('Preencha todos os campos.');
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error('Erro ao cadastrar usuário no Auth:', signUpError);
        throw new Error('Erro ao criar conta. Verifique suas informações.');
      }

      const user = signUpData?.user;
      if (!user || !user.id) {
        throw new Error('Usuário não encontrado após o cadastro.');
      }

      let profilePicturePath = null;

      if (profilePicture) {
        profilePicturePath = await uploadImageToBucket(profilePicture, user.id);
      }

      const { error: profileError } = await supabase.from('user_profiles').insert([
        {
          id: user.id,
          username,
          email,
          profile_picture: profilePicturePath,
        },
      ]);

      if (profileError) {
        console.error('Erro ao inserir dados no user_profiles:', profileError);
        throw new Error('Erro ao salvar dados adicionais do perfil.');
      }

      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro no cadastro:', error.message || error);
      alert(error.message || 'Erro desconhecido. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text>Escolher Foto de Perfil</Text>
      </TouchableOpacity>

      {profilePicture && (
        <Image source={{ uri: profilePicture }} style={styles.profileImage} />
      )}

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
