import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../configs/Supabase';
import FeedProfile from '../components/FeedProfile'; // Importando o componente

const ProfileScreen = ({ navigation }) => {
  const [profilePicture, setProfilePicture] = useState('https://via.placeholder.com/158');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [places, setPlaces] = useState([]);
  const [feedData, setFeedData] = useState([]); // Dados para o componente FeedProfile

  useEffect(() => {
    const loadUserProfile = async () => {
      const user = supabase.auth.user();
      if (user) {
        try {
          // Carregar o nome de usuário e foto de perfil
          const { data, error } = await supabase
            .from('profiles')
            .select('username, profile_picture')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          setUsername(data.username);
          setProfilePicture(data.profile_picture || 'https://via.placeholder.com/158');

          // Carregar os lugares registrados pelo usuário
          const { data: placesData, error: placesError } = await supabase
            .from('places')
            .select('id, name, description, image_url')
            .eq('user_id', user.id);

          if (placesError) throw placesError;

          setPlaces(placesData);

          // Carregar dados do feed
          const { data: feedDataResponse, error: feedError } = await supabase
            .from('feed')
            .select('*')
            .eq('user_id', user.id);

          if (feedError) throw feedError;

          setFeedData(feedDataResponse);
        } catch (error) {
          Alert.alert('Erro ao carregar dados', error.message);
        }
      } else {
        Alert.alert('Erro', 'Usuário não autenticado');
      }
    };

    loadUserProfile();
  }, []);

  const handleChangeProfilePicture = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo' });
      if (result.didCancel) return;

      const { uri } = result.assets[0];
      setLoading(true);

      const response = await uploadImageToSupabase(uri);
      if (response) {
        setProfilePicture(response);
        await updateProfilePictureInDatabase(response);
        Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToSupabase = async (uri) => {
    try {
      const fileName = uri.split('/').pop();
      const fileType = fileName.split('.').pop();
      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(`public/${fileName}`, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: `image/${fileType}`,
        });

      if (error) throw error;

      const { publicURL } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(`public/${fileName}`);

      return publicURL;
    } catch (error) {
      Alert.alert('Erro no Upload', error.message);
      return null;
    }
  };

  const updateProfilePictureInDatabase = async (imageUrl) => {
    try {
      const user = supabase.auth.user();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ profile_picture: imageUrl, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (error) throw error;
      }
    } catch (error) {
      Alert.alert('Erro ao Atualizar', error.message);
    }
  };

  const handleUpdateUsername = async () => {
    try {
      const user = supabase.auth.user();
      if (user && newUsername.trim()) {
        const { error } = await supabase
          .from('profiles')
          .update({ username: newUsername, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (error) throw error;

        setUsername(newUsername);
        setModalVisible(false);
        Alert.alert('Sucesso', 'Nome de usuário atualizado com sucesso!');
      } else {
        Alert.alert('Erro', 'Por favor, insira um nome de usuário válido.');
      }
    } catch (error) {
      Alert.alert('Erro ao Atualizar', error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.placeItem}>
      <Image source={{ uri: item.image_url }} style={styles.placeImage} />
      <View style={styles.placeInfo}>
        <Text style={styles.placeTitle}>{item.name}</Text>
        <Text style={styles.placeDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      ListHeaderComponent={
        <>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={32} color="#30A7EB" />
          </TouchableOpacity>

          <View style={styles.profileContainer}>
            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
            <TouchableOpacity style={styles.changePictureButton} onPress={handleChangeProfilePicture}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.usernameContainer}>
            <Text style={styles.userName}>{username}</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
              <Ionicons name="pencil" size={24} color="#FF9D00" />
            </TouchableOpacity>
          </View>

          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TextInput
                  value={newUsername}
                  onChangeText={setNewUsername}
                  style={styles.usernameInput}
                  placeholder="Digite o novo nome de usuário"
                />
                <TouchableOpacity style={styles.updateButton} onPress={handleUpdateUsername}>
                  <Text style={styles.updateButtonText}>Atualizar Nome</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Text style={styles.lugaresTitle}>Lugares Registrados</Text>

          {/* Adicionando o FeedProfile */}
          <FeedProfile data={feedData} />
        </>
      }
      data={places}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 158,
    height: 158,
    borderRadius: 79,
  },
  changePictureButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FF9D00',
    borderRadius: 50,
    padding: 10,
  },
  usernameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  usernameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#FF9D00',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FF9D00',
    fontSize: 16,
  },
  lugaresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  placeImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  placeInfo: {
    flex: 1,
    padding: 10,
  },
  placeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeDescription: {
    marginTop: 5,
    color: '#555',
  },
});

export default ProfileScreen;
