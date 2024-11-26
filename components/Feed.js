import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../configs/Supabase';

const PAGE_SIZE = 9;

const Feed = ({ onPostPress }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (page = 1) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: postsData, error } = await supabase
        .from('posts')
        .select('id, title, description, image, created_at, latitude, longitude')
        .range(from, to);

      if (error) {
        throw new Error('Erro ao carregar posts.');
      }

      if (postsData.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setPosts((prevPosts) => (page === 1 ? postsData : [...prevPosts, ...postsData]));
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity style={styles.postContainer} onPress={() => onPostPress(item)}>
      <ImageBackground
        source={{ uri: item.image || 'https://via.placeholder.com/400x200.png?text=Sem+Imagem' }}
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

  if (loading && currentPage === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9D00" />
      </View>
    );
  }

  if (posts.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum post disponível.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderPost}
      contentContainerStyle={styles.feedContainer}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loadingMore && <ActivityIndicator size="small" color="#FF9D00" />}
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
  },
  imageBackground: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 10,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

export default Feed;
