<template>
  <div class="home-page">
    <div class="hero-section card">
      <div class="hero-content">
        <div class="badge-new">Version 1.0 Live</div>
        <h1>Elevate Your Learning <span class="text-gradient">Architectures</span></h1>
        <p class="hero-subtitle">
          The ultimate platform for educators to design, manage, and scale their course curriculum with professional precision.
        </p>
        
        <div v-if="!authStore.isAuthenticated" class="hero-actions">
          <router-link to="/login" class="btn btn-primary btn-lg">Get Started</router-link>
          <router-link to="/register" class="btn btn-secondary btn-lg">Create Account</router-link>
        </div>
        <div v-else class="hero-actions">
          <router-link to="/courses" class="btn btn-primary btn-lg">Go to My Workshop</router-link>
        </div>
      </div>
      <div class="hero-visual">
        <div class="abstract-shape shape-1"></div>
        <div class="abstract-shape shape-2"></div>
      </div>
    </div>

    <div class="features-grid">
      <div class="feature-item card">
        <div class="feature-icon">📊</div>
        <h3>Live Metrics</h3>
        <p>Monitor course health and lesson statistics in real-time with our integrated dashboard.</p>
      </div>
      <div class="feature-item card">
        <div class="feature-icon">⚡</div>
        <h3>Ultra Fast</h3>
        <p>Optimized for desktop performance. Experience zero latency when reordering your curriculum.</p>
      </div>
      <div class="feature-item card">
        <div class="feature-icon">🔒</div>
        <h3>Secure Scale</h3>
        <p>Your data is protected with enterprise-grade JWT authentication and secure session management.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>

<style scoped>
.home-page {
  padding-top: 20px;
}

.hero-section {
  display: flex;
  align-items: center;
  padding: 80px;
  position: relative;
  overflow: hidden;
  margin-bottom: 60px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.hero-content {
  flex: 1;
  z-index: 1;
}

.badge-new {
  display: inline-block;
  background: rgba(66, 185, 131, 0.1);
  color: var(--primary);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 25px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-section h1 {
  font-size: 3.5rem;
  line-height: 1.1;
  margin-bottom: 25px;
  max-width: 600px;
}

.text-gradient {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-light);
  margin-bottom: 40px;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 15px;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 1.1rem;
}

.hero-visual {
  flex: 0.8;
  position: relative;
  height: 300px;
}

.abstract-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.2;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: var(--primary);
  top: -50px;
  right: -50px;
}

.shape-2 {
  width: 250px;
  height: 250px;
  background: var(--accent);
  bottom: -50px;
  left: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.feature-item {
  text-align: left;
  padding: 40px;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.feature-item h3 {
  margin-bottom: 12px;
}

.feature-item p {
  color: var(--text-light);
  font-size: 0.95rem;
}
</style>
