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
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/courses">Courses</router-link>
      <button @click="logout" class="btn-logout">Logout</button>
    </nav>
    <div class="user-info">
      Logged in as: {{ authStore.user?.userName }}
    </div>
  </header>
  <main class="container">
    <router-view />
  </main>
</template>

<style scoped>
.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
  margin-bottom: 2rem;
}

nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

nav a.router-link-active {
  color: #42b983;
}

.btn-logout {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}

.btn-logout:hover {
  background-color: #c0392b;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.user-info {
  font-size: 0.9rem;
  opacity: 0.8;
}
</style>
