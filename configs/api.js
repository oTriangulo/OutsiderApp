// importa o axios para fazer as requisicoes ao supabase
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fyllypgnomzidhyyrdbd.supabase.co/storage/v1/s3'
});

export default api;