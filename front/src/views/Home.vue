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
      
      <div v-else>
        <div class="view-controls">
          <button 
            @click="viewMode = 'grid'" 
            :class="['view-btn', { active: viewMode === 'grid' }]"
            title="Сетка"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="6" height="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <rect x="12" y="2" width="6" height="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <rect x="2" y="12" width="6" height="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <rect x="12" y="12" width="6" height="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </button>
          <button 
            @click="viewMode = 'list'" 
            :class="['view-btn', { active: viewMode === 'list' }]"
            title="Список"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="2" y1="4" x2="18" y2="4" stroke="currentColor" stroke-width="1.5"/>
              <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="1.5"/>
              <line x1="2" y1="16" x2="18" y2="16" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
        </div>
        
        <div v-if="viewMode === 'grid'" class="goods-grid">
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
        
        <div v-else class="goods-list-view">
          <div 
            v-for="good in goodsStore.goods" 
            :key="good.id" 
            class="good-list-item"
          >
            <div class="list-item-content">
              <h3 class="list-item-name">{{ good.name }}</h3>
              <p class="list-item-comment">{{ good.comment }}</p>
            </div>
            <div class="list-item-count">
              <span class="count-value">{{ good.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGoodsStore } from '../stores/goods'

const goodsStore = useGoodsStore()
const viewMode = ref('grid')

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

.view-controls {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #7f8c8d;
}

.view-btn:hover {
  background: #f0f0f0;
  border-color: #42b883;
  color: #42b883;
}

.view-btn.active {
  background: #42b883;
  border-color: #42b883;
  color: #fff;
}

.goods-list-view {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 2rem;
}

.good-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.good-list-item:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  border-color: #42b883;
}

.list-item-content {
  flex: 1;
  min-width: 0;
}

.list-item-name {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.list-item-comment {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-count {
  margin-left: 1.5rem;
  flex-shrink: 0;
}
</style>

