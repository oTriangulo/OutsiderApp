import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const storage = getStorage(app);

const firebaseConfig = {
  apiKey: "AIzaSyCbYuJzlc7KHciE-SBEo9EbB8nMqO1ljjo",
  authDomain: "outsiderapp-7d501.firebaseapp.com",
  projectId: "outsiderapp-7d501",
  storageBucket: "outsiderapp-7d501.appspot.com",
  messagingSenderId: "98384150370",
  appId: "1:98384150370:web:5f0aa4e9c25ca18691363b"
};

let app; // Variável para a instância do Firebase

const getFirebaseApp = () => {
  if (!app) {
    app = initializeApp(firebaseConfig); // Inicializa o app se não estiver inicializado
    const auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    const db = getFirestore(app);
    return { auth, db };
  }
  return { auth: getAuth(app), db: getFirestore(app) }; // Retorna as instâncias já criadas
};

const { auth: firebaseAuth, db: firebaseDb } = getFirebaseApp(); // Chama a função para garantir inicialização única

export { firebaseAuth, firebaseDb, storage };