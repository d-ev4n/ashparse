
import api from './axios'

export async function scrapeWebsite(payload) {
  const response = await api.post('/scrape/', payload)
  return response.data
}
