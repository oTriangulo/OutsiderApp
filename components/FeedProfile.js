import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ImageBackground, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { supabase } from '../configs/Supabase';

const PAGE_SIZE = 9; // Máximo de posts por página

const FeedProfile = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // Indica se há mais posts para carregar
  const [userId, setUserId] = useState(null); // ID do usuário autenticado

  useEffect(() => {
    fetchUserId(); // Obter o ID do usuário autenticado
  }, []);

  const fetchUserId = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error('Erro ao obter usuário:', error.message);
        throw new Error('Erro ao autenticar o usuário.');
      }
      setUserId(user.id); // Define o ID do usuário autenticado
      fetchPosts(1, user.id); // Busca inicial dos posts para o usuário
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const fetchPosts = async (page = 1, userId) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Busca posts paginados no Supabase, filtrando pelo userId
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('id, title, description, image, user_id')
        .eq('user_id', userId)
        .range(from, to);

      if (error) {
        console.error('Erro ao buscar posts:', error.message);
        throw new Error('Erro ao carregar posts.');
      }

      if (postsData.length < PAGE_SIZE) {
        setHasMore(false); // Não há mais posts para carregar
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
    if (hasMore && !loadingMore && userId) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPosts(nextPage, userId);
    }
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() =>
        navigation.navigate('Detail', {
          postId: item.id,
          title: item.title,
          description: item.description,
          image: item.image,
        })
      }
    >
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
      onEndReached={handleLoadMore} // Chama mais posts ao alcançar o final
      onEndReachedThreshold={0.5} // Define quando carregar (50% do final da lista)
      ListFooterComponent={
        loadingMore ? <ActivityIndicator size="small" color="#FF9D00" /> : null
      }
    />
  );
};

const ProfileScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={stylesFeed.container}>
      <View style={stylesFeed.header}>
        <Text style={stylesFeed.title}>Meu Perfil</Text>
        {/* Adicione aqui outras informações do usuário, se necessário */}
      </View>

      {/* Componente FeedProfile que exibe os posts do usuário */}
      <FeedProfile navigation={navigation} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  feedContainer: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
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

const stylesFeed = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF9D00',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default FeedProfile;
