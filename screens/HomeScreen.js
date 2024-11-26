import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';  // Certifique-se de que este componente está correto
import Icon from 'react-native-vector-icons/Ionicons'; // Para o ícone de adicionar
import Feed from '../components/Feed';  // Este é o seu Feed de posts
import { useNavigation } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  
  // Função para logout
  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.replace('Login');  // Redireciona diretamente para o Login
  };

  // Função de navegação para detalhes de um post
  const handlePostPress = (post) => {
    // Navega para a tela de detalhes do post, passando os dados completos do post
    navigation.navigate('DetailScreen', { post });
  };
  

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <Header />

      {/* Botão de Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Feed de Posts */}
      <Feed navigation={navigation} onPostPress={handlePostPress} />
      {/* Passando a função para o Feed, que pode chamar handlePostPress quando um post for clicado */}

      {/* Botão para Criar Post */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('CreatePost')}  // Navega para a tela de criação de post
      >
        <Icon name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    backgroundColor: '#fff',  // Adicionando fundo branco para a tela
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginVertical: 10,
  },
  addButton: {
    position: 'absolute', // Botão flutuante na parte inferior direita
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9D00',  // Cor do botão
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,  // Sombra no Android
    shadowColor: '#000',  // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FF9D00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
