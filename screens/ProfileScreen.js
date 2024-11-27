import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../configs/Supabase';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importando AsyncStorage

const ProfileScreen = ({ navigation }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('username, profile_picture')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          setUsername(data.username);
          setProfilePicture(data.profile_picture);
        }
      } catch (error) {
        console.error('Error fetching profile:', error.message);
      } finally {
        setLoading(false);
      }
    };
    loadUserProfile();
  }, []);

  // Função de logout
  const logout = async () => {
    try {
      // Limpa o AsyncStorage (onde armazenamos o token e outros dados)
      await AsyncStorage.clear(); 

      // Faz o logout do Supabase
      await supabase.auth.signOut();

      // Navega para a tela de Login
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error.message);
      Alert.alert('Erro ao sair', 'Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={32} color="#30A7EB" />
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#30A7EB" />
      ) : (
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: profilePicture }}
            style={styles.profilePicture}
          />
          <Text style={styles.username}>{username}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 10,
  },
  profileContainer: {
    alignItems: 'center',
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#30A7EB',
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ProfileScreen;
