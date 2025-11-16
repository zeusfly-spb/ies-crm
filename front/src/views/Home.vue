<template>
  <div class="home">
    <h1>IES CRM - Список товаров</h1>
    
    <div v-if="goodsStore.loading" class="loading">
      Загрузка товаров...
    </div>
    
    <div v-if="goodsStore.error" class="error">
      {{ goodsStore.error }}
    </div>
    
    <div v-if="!goodsStore.loading && !goodsStore.error" class="goods-list">
      <div v-if="goodsStore.goods.length === 0" class="empty">
        Товары не найдены
      </div>
      
      <div v-else class="goods-grid">
        <div 
          v-for="good in goodsStore.goods" 
          :key="good.id" 
          class="good-card"
        >
          <h3 class="good-name">{{ good.name }}</h3>
          <p class="good-comment">{{ good.comment }}</p>
          <div class="good-count">
            <span class="count-label">Количество:</span>
            <span class="count-value">{{ good.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGoodsStore } from '../stores/goods'

const goodsStore = useGoodsStore()

onMounted(() => {
  goodsStore.fetchGoods()
})
</script>

<style scoped>
.home {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #42b883;
  margin-bottom: 2rem;
  text-align: center;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.error {
  color: #e74c3c;
  background-color: #fee;
  border: 1px solid #e74c3c;
  border-radius: 8px;
}

.empty {
  color: #7f8c8d;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.good-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.good-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.good-name {
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.good-comment {
  color: #7f8c8d;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

.good-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.count-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.count-value {
  color: #42b883;
  font-size: 1.1rem;
  font-weight: 600;
}
</style>

