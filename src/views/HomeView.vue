<template>
  <div class="home">
    <h1>Welcome to Course Management</h1>
    <p>Manage your courses and lessons efficiently.</p>
    <div v-if="!authStore.isAuthenticated" class="actions">
      <router-link to="/login" class="btn">Login</router-link>
      <router-link to="/register" class="btn btn-secondary">Register</router-link>
    </div>
    <div v-else class="actions">
      <router-link to="/courses" class="btn">View Courses</router-link>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 4rem;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}

.btn-secondary {
  background-color: #34495e;
}
</style>
