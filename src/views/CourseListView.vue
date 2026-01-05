<template>
  <div class="course-list-page">
    <div class="page-header">
      <div class="header-text">
        <h1>Courses</h1>
        <p class="subtitle">Quickly manage and monitor all your educational content</p>
      </div>
      <router-link to="/courses/new" class="btn btn-primary">
        <span class="plus-icon">+</span> Create New Course
      </router-link>
    </div>

    <div class="search-bar card">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          v-model="searchQuery" 
          @input="handleSearch" 
          placeholder="Search by title..." 
          class="inline-input"
        />
      </div>
      <div class="filter-wrapper">
        <label>Filter Status</label>
        <select v-model="statusFilter" @change="fetchCourses(1)" class="inline-select">
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Fetching your courses...</p>
    </div>
    
    <div v-else-if="courses.length === 0" class="empty-state card">
      <div class="empty-icon">📂</div>
      <h3>No courses found</h3>
      <p>Try adjusting your filters or create a new course to get started.</p>
    </div>

    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr class="header-row">
            <th>Course Title</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in courses" :key="course.id">
            <td class="course-title">{{ course.title }}</td>
            <td>
              <span :class="['badge', course.status === 'Published' ? 'badge-success' : 'badge-warning']">
                {{ course.status }}
              </span>
            </td>
            <td class="date-cell">{{ formatDate(course.createdAt) }}</td>
            <td class="action-cell">
              <router-link :to="'/courses/' + course.id" class="btn btn-secondary btn-sm">Manage</router-link>
              <button @click="deleteCourse(course.id)" class="btn btn-logout-sm btn-sm">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        @change="fetchCourses" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api/client';
import { useAuthStore } from '../stores/auth';
import Pagination from '../components/Pagination.vue';

const authStore = useAuthStore();
const courses = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(5);
const searchQuery = ref('');
const statusFilter = ref('');

const fetchCourses = async (page = 1) => {
  loading.value = true;
  currentPage.value = page;
  try {
    let response;
    if (authStore.isAuthenticated) {
      response = await apiClient.get('/courses/search', {
        params: {
          q: searchQuery.value,
          status: statusFilter.value || undefined,
          page: currentPage.value,
          pageSize: pageSize.value
        }
      });
    } else {
      response = await apiClient.get('/courses', {
        params: {
          page: currentPage.value,
          pageSize: pageSize.value
        }
      });
    }
    
    courses.value = response.data.items;
    const totalCount = response.data.totalCount ?? response.data.total ?? response.data.count ?? courses.value.length;
    totalPages.value = Math.ceil(totalCount / pageSize.value);
  } catch (err) {
    console.error('Error fetching courses:', err);
  } finally {
    loading.value = false;
  }
};

let searchTimeout = null;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchCourses(1);
  }, 500);
};

const deleteCourse = async (id) => {
  if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
  try {
    await apiClient.delete(`/courses/${id}`);
    fetchCourses(currentPage.value);
  } catch (err) {
    alert('Error deleting course');
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
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.subtitle {
  color: var(--text-light);
  font-size: 1.1rem;
  margin-top: 5px;
}

.search-bar {
  display: flex;
  gap: 30px;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px 30px;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 10px;
  padding-left: 15px;
  border: 1px solid var(--border);
}

.search-icon {
  font-size: 1.2rem;
  opacity: 0.5;
}

.inline-input {
  border: none;
  background: transparent;
  padding: 12px;
}

.filter-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-wrapper label {
  margin: 0;
  white-space: nowrap;
}

.inline-select {
  width: 160px;
  padding: 10px;
}

.course-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--secondary);
}

.date-cell {
  color: var(--text-light);
  font-size: 0.9rem;
}

.action-cell {
  display: flex;
  gap: 10px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.85rem;
}

.btn-logout-sm {
  background: transparent;
  color: var(--danger);
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.btn-logout-sm:hover {
  background: var(--danger);
  color: white;
  border-color: var(--danger);
}

.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding: 20px 0;
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
  padding: 80px 40px;
}

.empty-state h3 {
  margin: 20px 0 10px;
}

.empty-state p {
  color: var(--text-light);
}

.spinner {
  width: 40px;
  height: 40px;
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
