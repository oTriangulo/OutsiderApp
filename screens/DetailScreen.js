import React from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function DetailScreen({ route }) {
  const { post } = route.params;

  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Post não encontrado!</Text>
      </View>
    );
  }

  // Garantindo que latitude e longitude sejam floats e dentro do intervalo
  let latitude = parseFloat(post.latitude) || 0;
  let longitude = parseFloat(post.longitude) || 0;

  // Verificação de validade das coordenadas
  const isLocationValid =
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  if (!isLocationValid) {
    Alert.alert('Erro', 'Latitude ou Longitude inválida. Usando localização padrão.');
    latitude = -23.55052; // Localização padrão (São Paulo)
    longitude = -46.633308;
  }

  const imageUri = post?.image || 'https://via.placeholder.com/400x200.png?text=Sem+Imagem';
  const title = post?.title || 'Sem título';
  const description = post?.description || 'Sem descrição';
  
  // Formatando a data corretamente
  const createdAt = post?.created_at ? new Date(post.created_at).toLocaleDateString() : 'Data não disponível';

  // Debugging das coordenadas
  console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.date}>Publicado em: {createdAt}</Text>

      {isLocationValid && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={{ latitude, longitude }} />
        </MapView>
      )}

      {!isLocationValid && (
        <Text style={styles.noLocationText}>Localização não disponível.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  map: {
    height: 300, 
    borderRadius: 10,
    marginTop: 20,
  },
  noLocationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});
