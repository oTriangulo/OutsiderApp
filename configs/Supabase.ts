import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fyllypgnomzidhyyrdbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bGx5cGdub216aWRoeXlyZGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzODU5NDAsImV4cCI6MjA0Nzk2MTk0MH0.dh3Ru3Jkz2lcSex_5mYG25XzFhC9AQ_bOdA-uQyVvUg';

// Adaptação de armazenamento seguro para gerenciar tokens JWT, atendendo às práticas recomendadas de segurança no Expo.
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Cria o cliente Supabase, integrando armazenamento seguro e desativando detecção de sessões em URLs para compatibilidade com React Native.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    detectSessionInUrl: false,
  },
});