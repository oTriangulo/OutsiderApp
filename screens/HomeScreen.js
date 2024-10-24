import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => { //vamos usar isso mais tarde, quando tiver a aba lateral de navegacão
  const logout = async () => {
    await AsyncStorage.removeItem('userToken'); //limpa o token de acesso
    navigation.replace('Login'); //redireciona para tela de login
  }

  //<Button title="Logout" onPress={logout} />

  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
