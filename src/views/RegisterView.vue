<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <div class="logo-mark">CM</div>
        <h2>Create Account</h2>
        <p>Join our platform and start managing your curriculum</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>Full Name or Username</label>
          <input 
            type="text" 
            v-model="userName" 
            required 
            placeholder="e.g., alex_dev" 
            autofocus
          />
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            v-model="email" 
            required 
            placeholder="alex@company.com" 
          />
        </div>
        <div class="form-group">
          <label>Secure Password</label>
          <input 
            type="password" 
            v-model="password" 
            required 
            placeholder="••••••••" 
          />
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input 
            type="password" 
            v-model="confirmPassword" 
            required 
            placeholder="••••••••" 
          />
        </div>

        <button type="submit" :disabled="loading" class="btn btn-primary btn-block">
          {{ loading ? 'Creating Profile...' : 'Complete Registration' }}
        </button>
        
        <transition name="shake">
          <p v-if="error" class="error-msg">{{ error }}</p>
        </transition>
      </form>

      <div class="auth-footer">
        <p>Already a member? <router-link to="/login">Sign in instead</router-link></p>
      </div>
    </div>
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
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    await authStore.register(email.value, password.value, userName.value, confirmPassword.value);
    router.push('/courses');
  } catch (err) {
    if (err.response?.data?.errors) {
      // Flatten validation errors into a single string
      const errorObj = err.response.data.errors;
      const errorMessages = Object.values(errorObj).flat();
      error.value = errorMessages.join(' | ');
    } else {
      error.value = err.response?.data?.message || 'Registration failed. Please check your data.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(85vh - var(--header-height));
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: 50px;
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-mark {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  margin: 0 auto 20px;
  font-weight: 700;
  font-size: 1.2rem;
  box-shadow: 0 10px 20px rgba(66, 185, 131, 0.2);
}

.auth-header h2 {
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.auth-header p {
  color: var(--text-light);
  font-size: 0.95rem;
}

.auth-form {
  margin-bottom: 30px;
}

.error-msg {
  background: rgba(231, 76, 60, 0.1);
  color: var(--danger);
  padding: 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
  margin-top: 20px;
  font-weight: 600;
}

.auth-footer {
  text-align: center;
  border-top: 1px solid var(--border);
  padding-top: 25px;
}

.auth-footer p {
  font-size: 0.9rem;
  color: var(--text-light);
}

.auth-footer a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.btn-block {
  width: 100%;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.shake-enter-active {
  animation: shake 0.3s ease-in-out;
}
</style>
