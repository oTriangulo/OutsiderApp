//AINDA FALTA ACRESCENTAR O MAPA AQUI

import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Image, Alert } from 'react-native'; 
import { firebaseDb } from '../configs/firebaseConfig'; // Importa a configuração do Firebase
import { collection, addDoc } from 'firebase/firestore'; // Importa as funções do Firestore
import * as ImagePicker from 'expo-image-picker'; // Para selecionar imagens

const CreatePostScreen = ({ navigation }) => {
  const [title, setTitle] = useState(''); // Estado para armazenar o título do post
  const [description, setDescription] = useState(''); // Estado para armazenar a descrição do post
  const [image, setImage] = useState(null); // Estado para armazenar a URI da imagem selecionada

  // Função para selecionar a imagem da galeria
  const pickImage = async () => {
    // Solicita permissão para acessar a galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Desculpe, precisamos de permissões para acessar sua galeria!');
      return;
    }

    // Abre a galeria para selecionar uma imagem
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Acesse a URI da imagem selecionada corretamente
      setImage(result.assets[0].uri);
    } else {
      Alert.alert('Você não selecionou nenhuma imagem.');
    }
  };

  // Função para criar um post e enviar para o Firestore
  const createPost = async () => {
    const user = 'User Name'; // Aqui você deve pegar o nome do usuário logado (modifique isso conforme necessário)
    
    // Envia o post para a coleção "posts" no Firestore
    try {
      await addDoc(collection(firebaseDb, 'posts'), {
        title,
        description,
        image,
        user,
        createdAt: new Date(), // Data de criação do post
      });
      Alert.alert('Post criado com sucesso!');
      navigation.goBack(); // Volta para a tela anterior após criar o post
    } catch (error) {
      Alert.alert('Erro ao criar o post', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <Button title="Create Post" onPress={createPost} />
    </View>
  );
};

// Estilos do componente
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
  image: { // Estilo para a imagem selecionada
    width: 200,
    height: 200,
    marginTop: 20,
  },
});

export default CreatePostScreen; 
