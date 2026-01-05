<template>
  <div class="available-courses-page">
    <div class="page-header">
      <div class="header-text">
        <h1>Available Courses</h1>
        <p class="subtitle">Discover our catalog of high-quality learning content</p>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading course catalog...</p>
    </div>
    
    <div v-else-if="courses.length === 0" class="empty-state card">
      <div class="empty-icon">🎓</div>
      <h3>No courses available yet</h3>
      <p>Check back later for new educational content.</p>
    </div>

    <div v-else class="courses-grid">
      <div v-for="course in courses" :key="course.id" class="course-card card">
        <div class="course-badge">Published</div>
        <h3 class="course-title">{{ course.title }}</h3>
        <p class="course-meta">Added on {{ formatDate(course.createdAt) }}</p>
        <div class="card-footer">
            <router-link :to="'/courses/' + course.id" class="btn btn-primary btn-block">View Details</router-link>
        </div>
      </div>
    </div>

    <Pagination 
      :current-page="currentPage" 
      :total-pages="totalPages" 
      @change="fetchCourses" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api/client';
import Pagination from '../components/Pagination.vue';

const courses = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(5);

const fetchCourses = async (page = 1) => {
  loading.value = true;
  currentPage.value = page;
  try {
    // Use the search endpoint to filter for Published courses on the backend
    const response = await apiClient.get('/courses/search', {
      params: {
        status: 'Published',
        page: currentPage.value,
        pageSize: pageSize.value
      }
    });
    
    courses.value = response.data.items;
    const totalCount = response.data.totalCount ?? response.data.total ?? response.data.count ?? courses.value.length;
    totalPages.value = Math.ceil(totalCount / pageSize.value);
  } catch (err) {
    console.error('Error fetching courses:', err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateString));
};

onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.page-header {
  margin-bottom: 40px;
  text-align: center;
}

.subtitle {
  color: var(--text-light);
  font-size: 1.1rem;
  margin-top: 5px;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.course-card {
  display: flex;
  flex-direction: column;
  padding: 30px;
  position: relative;
}

.course-badge {
  display: inline-block;
  background: rgba(39, 174, 96, 0.1);
  color: var(--success);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 15px;
  align-self: flex-start;
}

.course-title {
  font-size: 1.4rem;
  margin-bottom: 10px;
  color: var(--secondary);
  flex: 1;
}

.course-meta {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-bottom: 25px;
}

.card-footer {
    margin-top: auto;
}

.btn-block {
    width: 100%;
}

.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid var(--border);
}

.stats {
  color: var(--text-light);
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  gap: 10px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 100px 40px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(66, 185, 131, 0.1);
  border-left-color: var(--primary);
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}
</style>
