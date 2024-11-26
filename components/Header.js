import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../configs/Supabase'; // Importação do Supabase

const Header = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState(''); // Estado para armazenar o termo de pesquisa

  // Função para buscar posts pelo termo de pesquisa
  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      return; // Não faz nada se o campo de pesquisa estiver vazio
    }

    try {
      // Consulta ao Supabase para buscar posts pelo nome ou descrição parecidos
      const { data, error } = await supabase
        .from('posts') // Nome da tabela de posts
        .select('*')
        .ilike('name', `%${searchTerm}%`) // Pesquisa pelo nome (insensível a maiúsculas)
        .or(`description.ilike.%${searchTerm}%`); // Pesquisa pela descrição

      if (error) {
        console.error('Erro ao buscar posts:', error.message);
        return;
      }

      // Navegar para a tela de resultados com os dados encontrados
      navigation.navigate('SearchResults', { searchResults: data });
    } catch (error) {
      console.error('Erro ao buscar posts:', error.message);
    }
  };

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
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={handleSearch} // Chama a função de pesquisa ao pressionar "Enter"
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
