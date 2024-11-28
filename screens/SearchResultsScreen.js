import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

//tela feita para mostrar os resultados do mecanismo de busca 
const SearchResultsScreen = ({ route, navigation }) => {
  const { searchResults } = route.params;
  // const feita para renderizar as miniaturas do resultado que foi buscado 
  const renderItem = ({ item }) => {
    const post = {
      id: item.id,
      title: item.title || "Sem Título",
      description: item.description || "Sem Descrição",
      image: item.image || 'https://via.placeholder.com/400x200.png?text=Sem+Imagem',
      latitude: item.latitude || 0,  
      longitude: item.longitude || 0,
      created_at: item.created_at || new Date().toISOString(),
    };
  
    console.log("Post item:", post);
  
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => {
          navigation.navigate('DetailScreen', { post });
        }}
      >
        <Image
          source={{ uri: post.image }}
          style={styles.thumbnail}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{post.title}</Text>
          <Text numberOfLines={2} style={styles.description}>
            {post.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.noResultsText}>Nenhum resultado encontrado.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    elevation: 2,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SearchResultsScreen;
