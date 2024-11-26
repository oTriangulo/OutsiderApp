import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const SearchResultsScreen = ({ route }) => {
  const { searchResults } = route.params; // Recebe os resultados da pesquisa

  return (
    <View style={styles.container}>
      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <Text style={styles.postTitle}>{item.name}</Text>
              <Text style={styles.postDescription}>{item.description}</Text>
            </View>
          )}
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
    padding: 10,
    backgroundColor: '#fff',
  },
  postContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postDescription: {
    fontSize: 14,
    color: '#666',
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});

export default SearchResultsScreen;
