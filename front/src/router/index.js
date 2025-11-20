import { createRouter, createWebHistory } from 'vue-router';
import pinia from '../stores';
import { useAuthStore } from '../stores/auth';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import GoodsManagement from '../views/GoodsManagement.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/goods',
      name: 'goods',
      component: GoodsManagement,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore(pinia);
  
  // Если есть токен, но нет пользователя, пытаемся загрузить пользователя
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser();
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;

