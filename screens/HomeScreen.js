import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';  
import Icon from 'react-native-vector-icons/Ionicons';
import Feed from '../components/Feed'; 

const HomeScreen = ({ navigation }) => {
  
  // Função para logout
  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.replace('Login'); 
  };

  // Função de navegação para detalhes de um post
  const handlePostPress = (post) => {
    navigation.navigate('DetailScreen', { post });
  };
  

  return (
    <View style={styles.container}>
      <Header />
      <Feed navigation={navigation} onPostPress={handlePostPress} />
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
    backgroundColor: '#fff', 
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
    position: 'absolute', 
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9D00',  
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, 
    shadowColor: '#000',  
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
