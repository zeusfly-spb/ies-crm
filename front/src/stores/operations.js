import { defineStore } from 'pinia';
import api from '../api';

export const useOperationsStore = defineStore('operations', {
  state: () => ({
    operations: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchOperations() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/operations');
        this.operations = response.data;
      } catch (error) {
        this.error = error.message || 'Ошибка при загрузке истории операций';
      } finally {
        this.loading = false;
      }
    }
  }
});
