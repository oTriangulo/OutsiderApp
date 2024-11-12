import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Image, Alert } from 'react-native';
import { db, storage, auth } from '../configs/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';

const CreatePostScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  // Função para selecionar uma imagem da galeria
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Desculpe, precisamos de permissões para acessar sua galeria!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // Se a imagem for selecionada, atualize o estado 'image'
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    } else {
      Alert.alert('Você não selecionou nenhuma imagem.');
    }
  };

  // Função para fazer upload da imagem para o Firebase Storage e retornar a URL
  const uploadImageAsync = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    // Cria uma referência única para a imagem no Firebase Storage
    const imageRef = ref(storage, `posts/${uuid.v4()}`);

    // Faz o upload da imagem para o Firebase Storage
    await uploadBytes(imageRef, blob);

    // Retorna a URL da imagem no Storage
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  // Função para criar um novo post no Firestore com o título, descrição, e URL da imagem
  const createPost = async () => {
    try {
      let imageURL = null;
      if (image) {
        // Faz upload da imagem e obtém a URL
        imageURL = await uploadImageAsync(image);
      }

      // Pega o nome do usuário autenticado
      const user = auth.currentUser?.displayName || 'Usuário desconhecido';

      // Adiciona o post ao Firestore com título, descrição, URL da imagem, e nome do usuário
      await addDoc(collection(db, 'posts'), {
        title,
        description,
        image: imageURL,
        user,
      });
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao criar post:", error);
      Alert.alert("Erro ao criar post", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Selecionar imagem da galeria" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
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
    alignContent: 'center',
    paddingTop: 50,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
});

export default CreatePostScreen;
