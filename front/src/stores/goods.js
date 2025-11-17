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
    },

    async updateGood(id, type, amount) {
      this.error = null
      
      try {
        const response = await api.put(`/goods/${id}`, {
          type: type, // 'income' или 'expense'
          amount: amount
        })
        
        // Обновляем товар в списке
        const index = this.goods.findIndex(g => g.id === id)
        if (index !== -1) {
          this.goods[index] = response.data
        }
        
        return response.data
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || 'Ошибка при обновлении товара'
        this.error = errorMessage
        throw new Error(errorMessage)
      }
    }
  }
})

