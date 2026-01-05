<template>
  <div class="course-list">
    <div class="header">
      <h1>Courses</h1>
      <router-link to="/courses/new" class="btn">Create New Course</router-link>
    </div>

    <div class="filters">
      <input 
        v-model="searchQuery" 
        @input="handleSearch" 
        placeholder="Search courses..." 
        class="search-input"
      />
      <select v-model="statusFilter" @change="fetchCourses(1)" class="status-select">
        <option value="">All Statuses</option>
        <option value="Draft">Draft</option>
        <option value="Published">Published</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Loading courses...</div>
    
    <div v-else-if="courses.length === 0" class="no-data">
      No courses found.
    </div>

    <div v-else>
      <table class="course-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in courses" :key="course.id">
            <td>{{ course.title }}</td>
            <td>
              <span :class="['status-badge', course.status.toLowerCase()]">
                {{ course.status }}
              </span>
            </td>
            <td>{{ formatDate(course.createdAt) }}</td>
            <td class="actions">
              <router-link :to="'/courses/' + course.id" class="btn-sm">Edit</router-link>
              <button @click="deleteCourse(course.id)" class="btn-sm btn-danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="fetchCourses(currentPage - 1)"
        >Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button 
          :disabled="currentPage === totalPages" 
          @click="fetchCourses(currentPage + 1)"
        >Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api/client';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const courses = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const statusFilter = ref('');

const fetchCourses = async (page = 1) => {
  loading.value = true;
  currentPage.value = page;
  try {
    let response;
    // Use search endpoint if authenticated, otherwise use basic list
    if (authStore.isAuthenticated) {
      response = await apiClient.get('/course/search', {
        params: {
          q: searchQuery.value,
          status: statusFilter.value || undefined,
          page: currentPage.value,
          pageSize: pageSize.value
        }
      });
    } else {
      response = await apiClient.get('/course', {
        params: {
          page: currentPage.value,
          pageSize: pageSize.value
        }
      });
    }
    
    courses.value = response.data.items;
    totalPages.value = Math.ceil(response.data.totalCount / pageSize.value);
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
  if (!confirm('Are you sure you want to delete this course?')) return;
  try {
    await apiClient.delete(`/course/${id}`);
    fetchCourses(currentPage.value);
  } catch (err) {
    alert('Error deleting course');
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.status-select {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.course-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}

.course-table th, .course-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.published {
  background-color: #e6f7ef;
  color: #2ecc71;
}

.status-badge.draft {
  background-color: #fef5e7;
  color: #f39c12;
}

.btn {
  padding: 0.6rem 1.2rem;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  border: none;
  cursor: pointer;
}

.btn-danger {
  background-color: #e74c3c;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #777;
}

.loading {
  text-align: center;
  padding: 3rem;
}
</style>
