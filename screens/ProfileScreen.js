// ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../configs/firebaseConfig';
import { auth } from '../configs/firebaseConfig'; 

const ProfileScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("Nome do Usuário");
  const user = {
    profilePicture: "https://ucarecdn.com/167f1c66-0903-48b0-8d7d-d7247100567e/-/crop/597x598/0,0/-/preview/-/progressive/yes/-/format/auto/-/scale_crop/900x900/",
  };

  const userId = auth.currentUser ? auth.currentUser.uid : 'userId'; // Obtém o UID do usuário autenticado

  //Função para atualizar o nome do usuário
  const updateUserName = async (newName) => {
    setUserName(newName); // Atualiza o estado
    await setDoc(doc(db, 'users', userId), { name: newName }); // Usa o UID como ID do documento
  };

  //Efeito para carregar o nome do usuário ao iniciar a tela
  useEffect(() => {
    const loadUserName = async () => {
      const docRef = doc(db, 'users', userId); // Usando o UID para carregar os dados do usuário
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserName(docSnap.data().name); // Carrega o nome do Firestore
      } else {
        console.log("No such document!");
      }
    };
    loadUserName();
  }, [userId]); // Dependência no userId para recarregar se mudar

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={44} color="#007bff" />
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <Image source={{ uri: user.profilePicture }} style={styles.profilePicture} />
        <TouchableOpacity style={styles.editButton} onPress={() => alert('Alterar foto')}>
          <Icon name="camera" size={18} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.nameContainer}>
        <Text style={styles.name}>{userName}</Text>
        <TouchableOpacity
          style={styles.editNameButton}
          onPress={() => navigation.navigate('EditName', {
            currentName: userName,
            updateUserName: updateUserName,
          })}
        >
          <Icon name="pencil" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
  },
  profileContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 50,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#007bff',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: 20,
    position: 'relative',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editNameButton: {
    position: 'absolute',
    right: -10,
    top: 5,
    backgroundColor: '#007bff',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default ProfileScreen;
