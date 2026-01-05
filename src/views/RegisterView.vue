<template>
  <div class="auth-container">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>Username</label>
        <input type="text" v-model="userName" required placeholder="user123" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="email" required placeholder="email@example.com" />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" v-model="password" required placeholder="********" />
      </div>
      <button type="submit" :disabled="loading" class="btn">
        {{ loading ? 'Creating account...' : 'Register' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <p class="switch-auth">
      Already have an account? <router-link to="/login">Login here</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const userName = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authStore.register(email.value, password.value, userName.value);
    router.push('/courses');
  } catch (err) {
    error.value = err.response?.data?.message || 'Error creating account';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.btn {
  width: 100%;
  padding: 0.8rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.btn:disabled {
  background-color: #a8d5c2;
}

.error {
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
}

.switch-auth {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
}
</style>
