import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { supabase } from '../configs/Supabase';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';


const CreatePostScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(null);  // Inicialmente nulo
  const [address, setAddress] = useState('');

  // Efeito para verificar a sessão do usuário e obter permissões de localização
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session?.user) {
          console.log('Usuário não autenticado. Redirecionando...');
          navigation.navigate('Login');
        } else {
          setUser(data.session.user);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err.message);
        Alert.alert('Erro', 'Não foi possível verificar a sessão.');
      } finally {
        setLoading(false);
      }
    };
    
    const getLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão de localização', 'Precisamos de permissão para acessar a localização.');
        return;
      }

      // Obtém a localização atual do dispositivo
      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } else {
        // Se a localização não for encontrada, usar uma localização aleatória para não dar problemas
        setRegion({
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    };

    verifySession();
    getLocationPermission();
  }, [navigation]);

  // Função para selecionar imagem da galeria
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária para acessar a galeria.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error.message);
      Alert.alert('Erro', 'Ocorreu um erro ao acessar a galeria.');
    }
  };
  // Função para tirar foto com a câmera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária para usar a câmera.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error.message);
      Alert.alert('Erro', 'Ocorreu um erro ao acessar a câmera.');
    }
  };

  // Função para fazer upload da imagem no Supabase
  const uploadImageAsync = async (uri) => {
    try {
      if (!uri) {
        Alert.alert('Erro', 'Nenhuma imagem foi selecionada.');
        return null;
      }

      // Gera um nome de arquivo
      const fileExt = uri.split('.').pop();
      const fileName = `${uuid.v4()}.${fileExt}`;

      // Faz upload da imagem para o Supabase
      const { data, error } = await supabase.storage
        .from('files')
        .upload(`files/${fileName}`, {
          uri,
          type: `image/${fileExt}`,
          name: fileName,
        });

      if (error) {
        console.error('Erro no Supabase ao fazer upload:', error.message);
        Alert.alert('Erro ao fazer upload', error.message);
        return null;
      }

      const publicUrl = supabase.storage
        .from('files')
        .getPublicUrl(`files/${fileName}`).data.publicUrl;

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error.message);
      Alert.alert('Erro ao fazer upload', 'Verifique sua conexão e tente novamente.');
      return null;
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setRegion({
      ...region,
      latitude,
      longitude,
    });
  };

  const handleSearchAddress = async () => {
    if (address.trim() === '') return;

    try {
      const geocode = await Location.geocodeAsync(address);
      if (geocode.length > 0) {
        const { latitude, longitude } = geocode[0];
        setRegion({
          ...region,
          latitude,
          longitude,
        });
      } else {
        alert('Endereço não encontrado.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao buscar o endereço.');
    }
  };

  const createPost = async () => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    try {
      let imageURL = image ? await uploadImageAsync(image) : null;
      if (!imageURL) {
        imageURL = 'https://example.com/default-image.png';
      }

      const { error } = await supabase.from('posts').insert([{
        title,
        description,
        image: imageURL,
        latitude: region.latitude,
        longitude: region.longitude,
        user_id: user.id,
      }]);

      if (error) {
        console.error('Erro ao criar post:', error.message);
        Alert.alert('Erro ao criar post', error.message);
        return;
      }

      Alert.alert('Sucesso', 'Post criado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao criar post:', error.message);
      Alert.alert('Erro', 'Ocorreu um erro ao criar o post.');
    }
  };

   // Exibe uma tela de carregamento enquanto os dados estão sendo carregados
  if (loading || !region) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }
  
  const CustomButton = ({ title, onPress, iconName }) => (
    <TouchableOpacity style={styles.buttonimage} onPress={onPress}>
      <Icon name={iconName} size={20} color="#30A7EB" style={styles.icon} />
      <Text style={styles.buttonTextimage}>{title}</Text>
    </TouchableOpacity>
  );
  

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={44} color="#007bff" />
      </TouchableOpacity>
      <Text style={styles.locationText}>Título:</Text>
      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
    <Text style={styles.locationText}>Descrição:</Text>
            <TextInput
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        style={styles.inputdesc}
        multiline={true}
        numberOfLines={4}
      />

      <CustomButton title="Selecionar imagem da galeria" onPress={pickImage} iconName="image" />
      <CustomButton title="Tirar foto" onPress={takePhoto} iconName="camera" />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {!image && <Image source={require('../assets/PlaceHolder.png')} style={styles.image} />}

      <Text style={styles.locationText}>Localização:</Text>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
      >
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
      </MapView>

      <TextInput
        placeholder="Digite o endereço"
        value={address}
        onChangeText={setAddress}
        style={styles.inputMapper}
      />
      <TouchableOpacity
      style={styles.button}
      onPress={handleSearchAddress}>
      <Text style={styles.ButtonText}>Buscar Endereço</Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.orangeButton}
  onPress={createPost}
>
  <Text style={styles.orangeButtonText}>Criar</Text>
</TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 10,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 80,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#30A7EB',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    width: '60%',
    alignSelf: 'center',
  },
  buttonimage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
  },
  inputMapper: {
    height: 50,
    borderColor: '#30A7EB',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    width: '90%',
    borderRadius: 15, 
    zIndex: 1,
    backgroundColor: '#fff',   
    alignSelf: 'center',
  },
  input: {
    height: 40,
    marginBottom: 12,
    paddingLeft: 8,
    marginTop: 10,
    width: '100%',
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 2,
    shadowRadius: 8,
    elevation: 8,
    textAlignVertical: 'top', // Faz o texto começar no topo da caixa
    paddingRight: 8, // Adiciona um pouco de espaço à direita
    borderColor: '#ddd', // Cor da borda
    borderWidth: 1, // Adiciona a borda
  },
  inputdesc: {
    height: 100,  
    paddingLeft: 8,
    paddingTop: 10,
    marginBottom: 12,
    marginTop: 10,
    width: '100%',
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    textAlignVertical: 'top', 
    paddingRight: 8, 
    borderColor: '#ddd', 
    borderWidth: 1, 
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
  map: {
    width: '100%',
    height: 300,
    marginTop: 10,
    marginBottom: -20,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
  },
  orangeButton: {
    backgroundColor: '#FFA500',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    width: '30%',
    alignSelf: 'center',
  },
  orangeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  ButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonTextimage: {
    fontSize: 16,
    color: '#333',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'left',
  },
  
});

export default CreatePostScreen;
