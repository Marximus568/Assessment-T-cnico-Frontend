<script setup>
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <header v-if="authStore.isAuthenticated" class="nav-header">
    <div class="logo">
      <router-link to="/">CourseManager</router-link>
    </div>
    <nav class="nav-links">
      <router-link to="/">Home</router-link>
      <router-link to="/courses">Courses</router-link>
    </nav>
    <div class="user-badge">
      <span>{{ authStore.user?.userName }}</span>
      <button @click="logout" class="btn-logout">Logout</button>
    </div>
  </header>
  <main class="container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
</template>

<style scoped>
.logo a {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  background: linear-gradient(135deg, #42b983 0%, #3498db 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
