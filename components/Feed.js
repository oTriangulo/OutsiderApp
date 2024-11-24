import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ImageBackground } from 'react-native';

const posts = [
  { 
    id: '1', 
    title: 'Post 1', 
    description: 'Descrição breve do Post 1', 
    image: 'https://via.placeholder.com/400x200.png?text=Post+1', 
    userId: 'User1' 
  },
  { 
    id: '2', 
    title: 'Post 2', 
    description: 'Descrição breve do Post 2', 
    image: 'https://via.placeholder.com/400x200.png?text=Post+2', 
    userId: 'User2' 
  },
  { 
    id: '3', 
    title: 'Post 3', 
    description: 'Descrição breve do Post 3', 
    image: 'https://via.placeholder.com/400x200.png?text=Post+3', 
    userId: 'User3' 
  },
  // Adicione mais posts conforme necessário
];

const Feed = ({ navigation }) => {
  const renderPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.postContainer} 
      onPress={() => navigation.navigate('Detail', { 
        postId: item.id, 
        title: item.title, 
        description: item.description, 
        image: item.image 
      })}
    >
      <ImageBackground 
        source={{ uri: item.image }} 
        style={styles.imageBackground} 
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postDescription}>{item.description}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPost}
      contentContainerStyle={styles.feedContainer}
    />
  );
};

const styles = StyleSheet.create({
  feedContainer: {
    padding: 10,
  },
  postContainer: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2, // Para Android
    shadowColor: '#000', // Para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageBackground: {
    width: '100%',
    height: 200, // Altura do post
    justifyContent: 'flex-end', // Alinha título e descrição na parte inferior
  },
  imageStyle: {
    borderRadius: 10, // Bordas arredondadas
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Sobreposição escura
    padding: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  postDescription: {
    fontSize: 14,
    color: '#ccc',
  },
});

export default Feed;
