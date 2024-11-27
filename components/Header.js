import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../configs/Supabase';

const Header = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (user) {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('profile_picture')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Erro ao buscar a foto de perfil:', error.message);
            return;
          }

          if (data?.profile_picture) {
            const { publicURL, error: urlError } = supabase.storage
              .from('files')
              .getPublicUrl(data.profile_picture);

            if (urlError) {
              console.error('Erro ao obter URL da foto de perfil:', urlError.message);
              return;
            }

            setProfilePicture(publicURL);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar a foto de perfil:', error.message);
      }
    };

    fetchProfilePicture();
  }, []);

  const handleSearch = async () => {
    if (searchTerm.trim() === '') return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, image, description')
        .ilike('title', `%${searchTerm}%`);

      if (error) {
        console.error('Erro ao buscar posts:', error.message);
        return;
      }

      navigation.navigate('SearchResults', { searchResults: data });
    } catch (error) {
      console.error('Erro ao buscar posts:', error.message);
    }
  };

  const handleSuggestions = async (text) => {
    setSearchTerm(text);
    if (text.trim() === '') {
      setSuggestions([]);
      return;
    }

    try {
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error.message);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setSuggestions([]);
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.header}>
        {/* Barra de pesquisa */}
        <TextInput
          placeholder="Pesquisar..."
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={handleSuggestions}
          onSubmitEditing={handleSearch}
        />
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id.toString()}
            style={styles.suggestionsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                  setSearchTerm(item.title);
                  setSuggestions([]); // Esconde a lista após a seleção
                  handleSearch();
                }}
              >
                <Text style={styles.suggestionText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Botão de buscar */}
        <TouchableOpacity onPress={handleSearch}>
          <Icon name="search" size={24} color="#30A7EB" style={styles.icon} />
        </TouchableOpacity>

        {/* Botão de perfil com foto */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileButton}
        >
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          ) : (
            <Icon name="person-circle" size={28} color="#30A7EB" />
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 4,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#30A7EB',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  suggestionsList: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 4,
    zIndex: 10,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  suggestionText: {
    fontSize: 16,
  },
  icon: {
    marginLeft: 10,
  },
  profileButton: {
    marginLeft: 10,
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});

export default Header;
