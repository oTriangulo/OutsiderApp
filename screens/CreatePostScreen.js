import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Button, StyleSheet, Image, Alert } from 'react-native';
import { supabase } from '../configs/Supabase'; // Importando a configuração do Supabase
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CreatePostScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  // Função para selecionar uma imagem da galeria
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária para acessar a galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error.message);
      Alert.alert('Erro', 'Ocorreu um erro ao acessar a galeria.');
    }
  };

  // Função para tirar uma foto com a câmera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária para usar a câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error.message);
      Alert.alert('Erro', 'Ocorreu um erro ao acessar a câmera.');
    }
  };

  const uploadImageAsync = async (uri) => {
    try {
      if (!uri) {
        Alert.alert('Erro', 'Nenhuma imagem foi selecionada.');
        return null;
      }
  
      const fileExt = uri.split('.').pop();
      const fileName = `${uuid.v4()}.${fileExt}`;
  
      if (!['jpg', 'jpeg', 'png'].includes(fileExt.toLowerCase())) {
        Alert.alert('Erro', 'Formato de arquivo não suportado. Escolha JPG ou PNG.');
        return null;
      }
  
      const response = await fetch(uri);
      const blob = await response.blob();
  
      // Usando o bucket correto 'files' aqui
      const { data, error } = await supabase.storage
        .from('files')  // Mudando para o bucket correto 'files'
        .upload(`user_images/${uuid.v4()}/${fileName}`, blob, {
          cacheControl: '3600',
          upsert: false,
        });
  
      if (error) {
        console.error('Erro ao fazer upload:', error.message);
        Alert.alert('Erro ao fazer upload', error.message);
        return null;
      }
  
      // Pegando a URL pública da imagem
      const { publicUrl, error: urlError } = supabase.storage
        .from('files')
        .getPublicUrl(data.path);
  
      if (urlError) {
        console.error('Erro ao obter URL pública:', urlError.message);
        Alert.alert('Erro ao obter URL pública', urlError.message);
        return null;
      }
  
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error.message);
      Alert.alert('Erro ao fazer upload', 'Verifique sua conexão e tente novamente.');
      return null;
    }
  };
  

  // Função para criar um novo post
  const createPost = async () => {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Erro ao recuperar o usuário:', userError?.message || 'Usuário não autenticado.');
        Alert.alert('Erro', 'Você precisa estar logado para criar um post.');
        return;
      }

      const user_id = user.id;

      let imageURL = null;
      if (image) {
        imageURL = await uploadImageAsync(image); // Obtendo URL pública da imagem
      }

      if (!imageURL) {
        imageURL = 'https://example.com/default-image.png'; // Imagem padrão caso o usuário não tenha selecionado nenhuma
      }

      // Criando o post com a URL da imagem
      const { error } = await supabase.from('posts').insert([
        {
          title,
          description,
          image: imageURL,
          user_id,
        },
      ]);

      if (error) {
        console.error('Erro ao criar post:', error.message);
        Alert.alert('Erro ao criar post', error.message);
        return;
      }

      Alert.alert('Post criado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao criar post:', error.message);
      Alert.alert('Erro', 'Ocorreu um erro ao criar o post.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-left" size={44} color="#007bff" />
      </TouchableOpacity>

      <Button title="Selecionar imagem da galeria" onPress={pickImage} />
      <Button title="Tirar foto" onPress={takePhoto} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {!image && (
        <Image source={require('../assets/PlaceHolder.png')} style={styles.image} />
      )}

      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <Button title="Criar Post" onPress={createPost} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    paddingTop: 80,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    marginTop: 10,
    width: '100%',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
  },
});

export default CreatePostScreen;
