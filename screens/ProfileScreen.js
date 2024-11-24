import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../configs/Supabase'; // Importação do Supabase

const UserProfileScreen = ({ navigation }) => {
  const [profilePicture, setProfilePicture] = useState('https://via.placeholder.com/158');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState(''); // Estado para o novo nome de usuário
  const [modalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade do modal
  const [places, setPlaces] = useState([]); // Estado para armazenar os lugares registrados

  useEffect(() => {
    // Carregar dados do usuário (nome de usuário, foto de perfil e lugares registrados)
    const loadUserProfile = async () => {
      const user = supabase.auth.user();
      if (user) {
        // Carregar o nome de usuário e a foto de perfil do banco de dados
        const { data, error } = await supabase
          .from('profiles')
          .select('username, profile_picture')
          .eq('id', user.id)
          .single(); // Garantir que pegue apenas 1 resultado

        if (error) {
          Alert.alert('Erro', error.message);
        } else {
          setUsername(data.username);
          setProfilePicture(data.profile_picture || 'https://via.placeholder.com/158'); // Foto de perfil
        }

        // Carregar os lugares registrados pelo usuário
        const { data: placesData, error: placesError } = await supabase
          .from('places')
          .select('*')
          .eq('user_id', user.id);

        if (placesError) {
          Alert.alert('Erro', placesError.message);
        } else {
          setPlaces(placesData); // Atualiza o estado com os lugares registrados
        }
      }
    };

    loadUserProfile();
  }, []);

  // Função para selecionar e fazer upload de imagem
  const handleChangeProfilePicture = async () => {
    try {
      // Abrir a galeria para selecionar uma imagem
      const result = await launchImageLibrary({ mediaType: 'photo' });

      if (result.didCancel) {
        return; // Usuário cancelou a seleção
      }

      if (result.errorMessage) {
        Alert.alert('Erro', result.errorMessage);
        return;
      }

      const { uri } = result.assets[0];

      // Mostrar um indicador de carregamento
      setLoading(true);

      // Fazer upload da imagem para o Supabase
      const response = await uploadImageToSupabase(uri);

      if (response) {
        // Atualizar a foto de perfil no estado local e no banco de dados
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

  // Função para fazer upload da imagem no Supabase
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

      if (error) {
        throw error;
      }

      const { publicURL } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(`public/${fileName}`);

      return publicURL;
    } catch (error) {
      Alert.alert('Erro no Upload', error.message);
      return null;
    }
  };

  // Função para atualizar a URL da foto de perfil no banco de dados
  const updateProfilePictureInDatabase = async (imageUrl) => {
    try {
      const user = supabase.auth.user();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ profile_picture: imageUrl, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      Alert.alert('Erro ao Atualizar', error.message);
    }
  };

  // Função para atualizar o nome de usuário no banco de dados
  const handleUpdateUsername = async () => {
    try {
      const user = supabase.auth.user();
      if (user && newUsername.trim()) {
        const { error } = await supabase
          .from('profiles')
          .update({ username: newUsername, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        setUsername(newUsername);
        setModalVisible(false); // Fechar o modal
        Alert.alert('Sucesso', 'Nome de usuário atualizado com sucesso!');
      } else {
        Alert.alert('Erro', 'Por favor, insira um nome de usuário válido.');
      }
    } catch (error) {
      Alert.alert('Erro ao Atualizar', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Ícone de seta no canto superior esquerdo */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()} // Navegar para a tela anterior
      >
        <Ionicons name="arrow-back" size={32} color="#30A7EB" /> {/* Aumentei o tamanho */}
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        {/* Imagem circular usando o URL armazenado */}
        <Image
          source={{ uri: profilePicture }}
          style={styles.profilePicture}
        />

        {/* Botão circular para alterar a foto de perfil */}
        <TouchableOpacity style={styles.changePictureButton} onPress={handleChangeProfilePicture}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="camera" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Nome do usuário e ícone de edição */}
      <View style={styles.usernameContainer}>
        <Text style={styles.userName}>{username}</Text>

        {/* Ícone de edição */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setModalVisible(true)} // Mostrar modal quando o ícone for clicado
        >
          <Ionicons name="pencil" size={24} color="#FF9D00" />
        </TouchableOpacity>
      </View>

      {/* Modal para editar nome de usuário */}
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

      {/* Frase "Lugares Registrados" */}
      <Text style={styles.lugaresTitle}>Lugares Registrados</Text>

      {/* Lista de lugares registrados */}
      <FlatList
        data={places}
        renderItem={({ item }) => (
          <View style={styles.placeItem}>
            <Text style={styles.placeText}>{item.name}</Text> {/* Exibe o nome do lugar */}
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Alinhando para o topo
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 20, // Espaço extra no topo
  },
  backButton: {
    position: 'absolute',
    top: 40, // Ajustado para ficar mais para baixo
    left: 20,
  },
  profileContainer: {
    position: 'relative',
    marginBottom: 20,
    marginTop: 50, // Espaçamento abaixo da imagem
  },
  profilePicture: {
    width: 158,
    height: 158,
    borderRadius: 79, // Tornando a imagem circular
    borderWidth: 3,
    borderColor: '#ddd',
  },
  changePictureButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#30A7EB',
    borderRadius: 50,
    padding: 8,
  },
  usernameContainer: {
    flexDirection: 'row',
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  usernameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#30A7EB',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#FF9D00',
    paddingVertical: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  lugaresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeItem: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    width: '90%',
  },
  placeText: {
    fontSize: 16,
  },
});

export default UserProfileScreen;
