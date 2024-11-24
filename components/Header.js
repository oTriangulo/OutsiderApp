import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const Header = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {/* Botão de Menu Lateral */}
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
        <Icon name="menu" size={24} color="#000" style={styles.icon} />
      </TouchableOpacity>

      {/* Barra de Pesquisa */}
      <TextInput
        placeholder="Pesquisar..."
        style={styles.searchInput}
      />

      {/* Botão de Perfil */}
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Icon name="person-circle" size={28} color="#000" style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 4, // Sombra (Android)
    shadowColor: '#000', // Sombra (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  icon: {
    padding: 5,
  },
});

export default Header;
