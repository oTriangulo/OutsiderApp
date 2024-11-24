import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/Ionicons'; // Para o ícone de adicionar
import Feed from '../components/Feed';
import { useNavigation } from '@react-navigation/native';



const HomeScreen = ({ navigation }) => {
  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.replace('Login');
  };

  return (

    <View style={styles.container}>
      <Header />

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      <Feed navigation={navigation} />
      <View style={styles.content}>
        <Text style={styles.text}>Home Screen</Text>
      </View>
      
      {/* Botão redondo para criar post no canto inferior direito */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('CreatePost')}
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
    position: 'absolute', // Posiciona o botão de forma absoluta
    bottom: 20, // Distância da parte inferior da tela
    right: 20, // Distância da lateral direita
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9D00',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
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
const styles0 = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
  },
});

export default HomeScreen;
