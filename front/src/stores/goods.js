import { defineStore } from 'pinia'
import api from '../api'

export const useGoodsStore = defineStore('goods', {
  state: () => ({
    goods: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchGoods() {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.get('/goods')
        this.goods = response.data
      } catch (error) {
        this.error = error.message || 'Ошибка при загрузке товаров'
        console.error('Ошибка загрузки товаров:', error)
      } finally {
        this.loading = false
      }
    }
  }
})

