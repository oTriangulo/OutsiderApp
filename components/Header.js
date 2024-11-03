//Este é o Header das paginas padrões

import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Header = () => {
  const navigation = useNavigation();

  return (
    // o Drawer ainda não está funcionando
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Image source={require('../assets/PlaceHolder.png')} style={styles.menuIcon} />
      </TouchableOpacity>
      <TextInput
        placeholder="Search..."
        style={styles.searchInput}
      />
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Image source={require('../assets/PlaceHolder.png')} style={styles.userIcon}/>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 4, // sombra na plataforma Android
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 10,
    marginHorizontal: 10,
  },
  userIcon: {
    width: 24,
    height: 24,
  },
});

export default Header;
