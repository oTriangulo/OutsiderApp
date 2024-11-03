import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const EditNameScreen = ({ route, navigation }) => {
  const { currentName, updateUserName } = route.params;
  const [newName, setNewName] = useState(currentName);

  const handleSave = () => {
    if (newName.trim() === '') {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }
    updateUserName(newName); // Atualiza o nome na tela de perfil
    Alert.alert('Nome salvo!', `Seu novo nome é: ${newName}`);
    navigation.goBack(); // Retorna à tela anterior após salvar
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Digite o novo nome de usuário:</Text>
      <TextInput
        style={styles.input}
        placeholder="Novo nome"
        value={newName}
        onChangeText={setNewName}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EditNameScreen;
