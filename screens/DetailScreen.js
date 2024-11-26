import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
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

  const imageUri = post?.image || 'https://via.placeholder.com/400x200.png?text=Sem+Imagem';
  const title = post?.title || 'Sem título';
  const description = post?.description || 'Sem descrição';
  const createdAt = post?.created_at || 'Data não disponível';
  const latitude = post?.latitude || 0;
  const longitude = post?.longitude || 0;

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.date}>Publicado em: {new Date(createdAt).toLocaleDateString()}</Text>
  
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
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  map: {
    flex: 1,
    borderRadius: 10,
  },
});
