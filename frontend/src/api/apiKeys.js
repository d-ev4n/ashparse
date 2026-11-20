
import api from './axios'

export async function generateApiKey(name) {
  const response = await api.post('/keys/generate/', { name })
  return response.data
}
