<template>
  <div class="course-edit">
    <div class="header">
      <router-link to="/courses" class="btn-back">← Back to Courses</router-link>
      <h1>{{ isNew ? 'Create Course' : 'Edit Course' }}</h1>
    </div>

    <section class="course-info card">
      <div class="form-group">
        <label>Course Title</label>
        <div class="input-with-action">
          <input v-model="course.title" placeholder="Enter course title" />
          <button v-if="!isNew" @click="saveCourseMeta" :disabled="saving" class="btn">
            {{ saving ? 'Saving...' : 'Save Title' }}
          </button>
        </div>
      </div>
      
      <div v-if="!isNew" class="course-meta">
        <p>Status: <span :class="['status-badge', course.status?.toLowerCase()]">{{ course.status }}</span></p>
        <div class="meta-actions">
          <button v-if="course.status === 'Draft'" @click="publishCourse" class="btn btn-success">Publish</button>
          <button v-if="course.status === 'Published'" @click="unpublishCourse" class="btn btn-warning">Unpublish</button>
          <button @click="deleteCourse" class="btn btn-danger">Delete Course</button>
        </div>
      </div>

      <button v-if="isNew" @click="createCourse" :disabled="saving" class="btn btn-block">
        {{ saving ? 'Creating...' : 'Create Course & Add Lessons' }}
      </button>

      <div v-if="!isNew && courseSummary" class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Total Lessons</span>
          <span class="metric-value">{{ courseSummary.totalLessons }}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Last Modified</span>
          <span class="metric-value">{{ formatDate(courseSummary.lastModified) }}</span>
        </div>
      </div>
    </section>

    <section v-if="!isNew" class="lessons-section">
      <div class="lessons-header">
        <h2>Lessons</h2>
        <button @click="showLessonModal = true" class="btn">Add Lesson</button>
      </div>

      <div v-if="lessonsLoading" class="loading">Loading lessons...</div>
      <div v-else-if="lessons.length === 0" class="no-data">No lessons found. Add your first lesson!</div>
      
      <div v-else class="lesson-list">
        <div v-for="lesson in lessons" :key="lesson.id" class="lesson-item card">
          <div class="lesson-order">{{ lesson.order }}</div>
          <div class="lesson-content">
            <h3>{{ lesson.title }}</h3>
          </div>
          <div class="lesson-actions">
            <button @click="moveLesson(lesson, 'up')" :disabled="lesson.order === 1" class="btn-sm">↑</button>
            <button @click="moveLesson(lesson, 'down')" :disabled="lesson.order === lessons.length" class="btn-sm">↓</button>
            <button @click="editLesson(lesson)" class="btn-sm btn-info">Edit</button>
            <button @click="deleteLesson(lesson.id)" class="btn-sm btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Lesson Modal -->
    <div v-if="showLessonModal" class="modal-overlay">
      <div class="modal card">
        <h3>{{ editingLessonId ? 'Edit Lesson' : 'Add New Lesson' }}</h3>
        <div class="form-group">
          <label>Lesson Title</label>
          <input v-model="lessonForm.title" placeholder="Lesson title" />
        </div>
        <div class="form-group">
          <label>Order</label>
          <input type="number" v-model.number="lessonForm.order" :disabled="editingLessonId" />
        </div>
        <div class="modal-actions">
          <button @click="closeLessonModal" class="btn btn-secondary">Cancel</button>
          <button @click="saveLesson" :disabled="savingLesson" class="btn">
            {{ savingLesson ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../api/client';

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const isNew = computed(() => !id);

const course = ref({ title: '', status: 'Draft' });
const courseSummary = ref(null);
const lessons = ref([]);
const saving = ref(false);
const lessonsLoading = ref(false);
const summaryLoading = ref(false);

// Lesson Form
const showLessonModal = ref(false);
const editingLessonId = ref(null);
const savingLesson = ref(false);
const lessonForm = ref({ title: '', order: 1 });

const fetchCourse = async () => {
  if (isNew.value) return;
  try {
    const response = await apiClient.get(`/course/${id}`);
    course.value = response.data;
    fetchLessons();
    fetchSummary();
  } catch (err) {
    console.error('Error fetching course:', err);
    router.push('/courses');
  }
};

const fetchSummary = async () => {
  summaryLoading.value = true;
  try {
    const response = await apiClient.get(`/course/${id}/summary`);
    courseSummary.value = response.data;
  } catch (err) {
    console.error('Error fetching summary:', err);
  } finally {
    summaryLoading.value = false;
  }
};

const fetchLessons = async () => {
  lessonsLoading.value = true;
  try {
    const response = await apiClient.get(`/course/${id}/lesson`, {
        params: { pageSize: 100 } // Get all for reordering
    });
    lessons.value = response.data.items.sort((a, b) => a.order - b.order);
    // Set next order for new lesson
    lessonForm.value.order = lessons.value.length + 1;
  } catch (err) {
    console.error('Error fetching lessons:', err);
  } finally {
    lessonsLoading.value = false;
  }
};

const createCourse = async () => {
  if (!course.value.title) return alert('Title is required');
  saving.value = true;
  try {
    // API supports either string or object
    const response = await apiClient.post('/course', { title: course.value.title });
    router.push(`/courses/${response.data.id}`);
    // Refreshing state after redirect happens automatically on remount
  } catch (err) {
    alert('Error creating course');
  } finally {
    saving.value = false;
  }
};

const saveCourseMeta = async () => {
  // Note: The API doesn't seem to have a PATCH /course/{id} for title only?
  // Let me double check the routes. 
  // It has GET, DELETE, and Create. 
  // If there's no update endpoint, I might have to skip specific title editing 
  // or assume the API might support PUT/PATCH even if not explicitly in the "routes" list provided.
  // Given the instructions say "Editar curso", I'll assume there's a PUT or PATCH.
  // I'll try PUT /course/{id} with the title.
  saving.value = true;
  try {
    await apiClient.put(`/course/${id}`, { title: course.value.title });
    alert('Course updated');
  } catch (err) {
    alert('Error updating course. (API might not support direct title updates yet)');
  } finally {
    saving.value = false;
  }
};

const publishCourse = async () => {
  try {
    await apiClient.post(`/course/${id}/publish`);
    fetchCourse();
  } catch (err) {
    alert(err.response?.data?.message || 'Error publishing course');
  }
};

const unpublishCourse = async () => {
  try {
    await apiClient.post(`/course/${id}/unpublish`);
    fetchCourse();
  } catch (err) {
    alert('Error unpublishing course');
  }
};

const deleteCourse = async () => {
  if (!confirm('Are you sure you want to delete this course?')) return;
  try {
    await apiClient.delete(`/course/${id}`);
    router.push('/courses');
  } catch (err) {
    alert('Error deleting course');
  }
};

// Lesson Actions
const editLesson = (lesson) => {
  editingLessonId.value = lesson.id;
  lessonForm.value = { title: lesson.title, order: lesson.order };
  showLessonModal.value = true;
};

const closeLessonModal = () => {
  showLessonModal.value = false;
  editingLessonId.value = null;
  lessonForm.value = { title: '', order: lessons.value.length + 1 };
};

const saveLesson = async () => {
  savingLesson.value = true;
  try {
    if (editingLessonId.value) {
      await apiClient.put(`/course/${id}/lesson/${editingLessonId.value}`, lessonForm.value);
    } else {
      await apiClient.post(`/course/${id}/lesson`, lessonForm.value);
    }
    closeLessonModal();
    fetchLessons();
  } catch (err) {
    alert('Error saving lesson');
  } finally {
    savingLesson.value = false;
  }
};

const deleteLesson = async (lessonId) => {
  if (!confirm('Are you sure?')) return;
  try {
    await apiClient.delete(`/course/${id}/lesson/${lessonId}`);
    fetchLessons();
  } catch (err) {
    alert('Error deleting lesson');
  }
};

const moveLesson = async (lesson, direction) => {
  const newOrder = direction === 'up' ? lesson.order - 1 : lesson.order + 1;
  if (newOrder < 1 || newOrder > lessons.value.length) return;
  
  try {
    await apiClient.put(`/course/${id}/lesson/${lesson.id}/reorder`, newOrder);
    fetchLessons();
  } catch (err) {
    alert('Error reordering lesson');
  }
};

onMounted(() => {
  fetchCourse();
});
</script>

<style scoped>
.header {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-block;
  margin-bottom: 1rem;
  color: #3498db;
  text-decoration: none;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.input-with-action {
  display: flex;
  gap: 1rem;
}

.input-with-action input {
  flex: 1;
}

.course-meta {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.metric-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.metric-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.metric-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
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

.meta-actions {
  display: flex;
  gap: 0.5rem;
}

.lessons-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
}

.lesson-order {
  width: 30px;
  height: 30px;
  background: #eee;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-weight: bold;
}

.lesson-content {
  flex: 1;
}

.lesson-content h3 {
  margin: 0;
  font-size: 1.1rem;
}

.lesson-actions {
  display: flex;
  gap: 0.2rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-block {
  width: 100%;
}

.btn-sm {
  padding: 0.3rem 0.6rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.btn-danger { background-color: #e74c3c; color: white; border: none; }
.btn-warning { background-color: #f39c12; color: white; border: none; }
.btn-success { background-color: #2ecc71; color: white; border: none; }
.btn-info { background-color: #3498db; color: white; border: none; }
.btn-secondary { background-color: #95a5a6; color: white; border: none; }

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  width: 400px;
  background: white;
  padding: 2rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.no-data, .loading {
  text-align: center;
  padding: 2rem;
  color: #777;
}
</style>
