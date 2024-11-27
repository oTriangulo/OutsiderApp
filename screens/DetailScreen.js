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

  let latitude = post?.latitude ? parseFloat(post.latitude) : null;
  let longitude = post?.longitude ? parseFloat(post.longitude) : null;

  const isLocationValid =
    latitude !== null &&
    longitude !== null &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  if (!isLocationValid) {
    Alert.alert('Erro', 'Latitude ou Longitude inválida');
    latitude = -23.55052;
    longitude = -46.633308;
  }

  const imageUri = post?.image || 'https://via.placeholder.com/400x200.png?text=Sem+Imagem';
  const title = post?.title || 'Sem título';
  const description = post?.description || 'Sem descrição';
  const createdAt = post?.created_at || 'Data não disponível';

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.date}>Publicado em: {new Date(createdAt).toLocaleDateString()}</Text>
      
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
    marginBottom: 5,
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#30A7EB',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#30A7EB',
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#30A7EB',
    marginBottom: 20,
  },
  map: {
    flex: 1,
    borderRadius: 10,
    marginTop: 20,
  },
});
