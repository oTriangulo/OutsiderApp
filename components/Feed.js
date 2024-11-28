import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ImageBackground, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { supabase } from '../configs/Supabase';

// Definimos um tamanho fixo de página para manter a performance consistente e evitar sobrecarregar a memória com muitos dados de uma só vez
const PAGE_SIZE = 20;

 // Utilizamos estados para controlar os dados e os fluxos de interação do usuário, como carregamento e atualização.
const Feed = ({ onPostPress }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Busca os posts na primeira renderização da pagina
  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  // Busca os posts de acordo com a paginacao
  const fetchPosts = async (page = 1) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Utilizamos limites no banco de dados para reduzir o tráfego de rede e melhorar a performance
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Pega as informacoes dos posts no supabase, para então carregar eles na tela
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('id, title, description, image, created_at, latitude, longitude')
        .range(from, to);

        // Pequeno tratamento de erros para caso algo dê errado
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
      setRefreshing(false);
    }
  };
 // Redefinimos o estado para carregar tudo do zero durante o "pull-to-refresh", garantindo que os dados estejam atualizados.
  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    setPosts([]);
    fetchPosts(1);
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
  // Evitamos exibir uma lista vazia sem contexto ao informar que não há posts disponíveis no momento.
  if (posts.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum post disponível.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        contentContainerStyle={styles.feedContainer}
        onEndReached={() => {
          if (hasMore && !loadingMore) {
            setCurrentPage(currentPage + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore && <ActivityIndicator size="small" color="#FF9D00" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
