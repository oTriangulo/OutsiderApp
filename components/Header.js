import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../configs/Supabase';

const Header = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    if (searchTerm.trim() === '') return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, image, description')
        .ilike('title', `%${searchTerm}%`)
        .or(`description.ilike.%${searchTerm}%`);

      if (error) {
        console.error('Erro ao buscar posts:', error.message);
        return;
      }

      navigation.navigate('SearchResults', { searchResults: data });
    } catch (error) {
      console.error('Erro ao buscar posts:', error.message);
    }
  };

  return (
    <View style={styles.header}>
      {/* Ícone do menu lateral */}
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
        <Icon name="menu" size={24} color="#30A7EB" style={styles.icon} />
      </TouchableOpacity>


      {/* Barra de pesquisa */}
      <TextInput
        placeholder="Pesquisar..."
        style={styles.searchInput}
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={handleSearch}
      />

      {/* Ícone de perfil */}
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Icon name="person-circle" size={28} color="#30A7EB" style={styles.icon} />
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
    borderColor: '#30A7EB', // Cor do contorno
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
