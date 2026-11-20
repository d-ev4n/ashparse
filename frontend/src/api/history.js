
import api from './axios'

export async function getHistory() {
  const response = await api.get('/history/')
  return response.data
}
