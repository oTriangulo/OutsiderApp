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

      // Tentar obter a localização atual
      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } else {
        // Se a localização não for encontrada, usar uma localização aleatória
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

  const uploadImageAsync = async (uri) => {
    try {
      if (!uri) {
        Alert.alert('Erro', 'Nenhuma imagem foi selecionada.');
        return null;
      }

      const fileExt = uri.split('.').pop();
      const fileName = `${uuid.v4()}.${fileExt}`;

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

  if (loading || !region) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={44} color="#007bff" />
      </TouchableOpacity>

      <Button title="Selecionar imagem da galeria" onPress={pickImage} />
      <Button title="Tirar foto" onPress={takePhoto} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {!image && <Image source={require('../assets/PlaceHolder.png')} style={styles.image} />}

      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <TextInput
        placeholder="Digite o endereço"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />
      <Button title="Buscar Endereço" onPress={handleSearchAddress} />

      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
      >
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
      </MapView>

      <Button title="Criar Post" onPress={createPost} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 80,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    marginTop: 10,
    width: '100%',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
  map: {
    width: '100%',
    height: 300,
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
  },
});

export default CreatePostScreen;
