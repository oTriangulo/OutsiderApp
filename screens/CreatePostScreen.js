import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { supabase } from '../configs/Supabase';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CreatePostScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session?.user) {
          console.log('Usuário não autenticado. Redirecionando...');
          navigation.navigate('Login');
        } else {
          setUser(data.session.user);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err.message);
        Alert.alert('Erro', 'Não foi possível verificar a sessão.');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [navigation]);

  const pickImage = async () => {
    // Lógica para selecionar imagem da galeria
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

  const takePhoto = async () => {
    // Lógica para tirar foto
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
  
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: `image/${fileExt}`, 
        name: fileName,
      });
  
      const { data, error } = await supabase.storage
        .from('files')
        .upload(`files/${fileName}`, {
          uri,
          type: `image/${fileExt}`,
          name: fileName,
        });
  
      if (error) {
        console.error('Erro no Supabase ao fazer upload:', error.message);
        Alert.alert('Erro ao fazer upload', error.message);
        return null;
      }
  
      const publicUrl = supabase.storage
        .from('files')
        .getPublicUrl(`files/${fileName}`).data.publicUrl;
  
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error.message);
      Alert.alert('Erro ao fazer upload', 'Verifique sua conexão e tente novamente.');
      return null;
    }
  };  

  const createPost = async () => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    try {
      let imageURL = image ? await uploadImageAsync(image) : null;
      if (!imageURL) {
        imageURL = 'https://example.com/default-image.png';
      }

      const { error } = await supabase.from('posts').insert([
        {
          title,
          description,
          image: imageURL,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.error('Erro ao criar post:', error.message);
        Alert.alert('Erro ao criar post', error.message);
        return;
      }

      Alert.alert('Sucesso', 'Post criado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao criar post:', error.message);
      Alert.alert('Erro', 'Ocorreu um erro ao criar o post.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={44} color="#007bff" />
      </TouchableOpacity>

      <Button title="Selecionar imagem da galeria" onPress={pickImage} />
      <Button title="Tirar foto" onPress={takePhoto} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {!image && <Image source={require('../assets/PlaceHolder.png')} style={styles.image} />}

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
