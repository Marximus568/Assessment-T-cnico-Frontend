<template>
  <div class="course-edit-page">
    <div class="page-header">
      <router-link to="/courses" class="btn-back">← Back to Dashboard</router-link>
      <div class="header-main">
        <h1>{{ isNew ? 'Create New Course' : 'Course Workshop' }}</h1>
        <div v-if="!isNew" class="status-controls">
          <span :class="['badge', course.status === 'Published' ? 'badge-success' : 'badge-warning']">
            {{ course.status }}
          </span>
          <button v-if="course.status === 'Draft'" @click="publishCourse" class="btn btn-primary btn-sm">Publish</button>
          <button v-if="course.status === 'Published'" @click="unpublishCourse" class="btn btn-secondary btn-sm">Unpublish</button>
        </div>
      </div>
    </div>

    <div class="editor-grid">
      <!-- Left Column: Settings & Metrics -->
      <div class="settings-column">
        <section class="card">
          <h3>Course Settings</h3>
          <p class="section-desc">Manage your course identity and visibility</p>
          
          <div class="form-group mt-20">
            <label>Title</label>
            <div class="input-action-group">
              <input v-model="course.title" placeholder="e.g., Advanced Architecture Patterns" />
              <button v-if="!isNew" @click="saveCourseMeta" :disabled="saving" class="btn btn-primary">
                {{ saving ? '...' : 'Save' }}
              </button>
            </div>
          </div>

          <button v-if="isNew" @click="createCourse" :disabled="saving" class="btn btn-primary btn-block">
            {{ saving ? 'Creating...' : 'Initialize Course' }}
          </button>

          <div v-if="!isNew && courseSummary" class="metrics-dashboard">
            <h4>Performance Overview</h4>
            <div class="metrics-grid">
              <div class="metric-item">
                <span class="label">Total Lessons</span>
                <span class="value">{{ courseSummary.totalLessons }}</span>
              </div>
              <div class="metric-item">
                <span class="label">Last Activity</span>
                <span class="value">{{ formatDate(courseSummary.lastModified) }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="!isNew" class="danger-zone">
            <h4>Danger Zone</h4>
            <button @click="deleteCourse" class="btn btn-logout-outline btn-block">Delete Course Permanently</button>
          </div>
        </section>
      </div>

      <!-- Right Column: Content/Lessons -->
      <div v-if="!isNew" class="content-column">
        <section class="card lessons-card">
          <div class="lessons-header">
            <div>
              <h3>Course Curriculum</h3>
              <p class="section-desc">Organize and structure your lessons</p>
            </div>
            <button @click="openNewLessonModal" class="btn btn-primary">+ Add Lesson</button>
          </div>

          <div v-if="lessonsLoading" class="loading-content">
            <div class="spinner-sm"></div>
            <span>Loading curriculum...</span>
          </div>
          
          <div v-else-if="lessons.length === 0" class="empty-lessons">
            <div class="empty-art">📚</div>
            <h4>Your curriculum is empty</h4>
            <p>Start adding lessons to build your course value.</p>
          </div>
          
          <div v-else class="lesson-stack">
            <div v-for="lesson in lessons" :key="lesson.id" class="lesson-card">
              <div class="lesson-index">{{ lesson.order }}</div>
              <div class="lesson-info">
                <h4>{{ lesson.title }}</h4>
              </div>
              <div class="lesson-actions">
                <div class="reorder-group">
                  <button @click="moveLesson(lesson, 'up')" :disabled="lesson.order === 1" class="btn-icon">↑</button>
                  <button @click="moveLesson(lesson, 'down')" :disabled="lesson.order === lessons.length" class="btn-icon">↓</button>
                </div>
                <button @click="editLesson(lesson)" class="btn btn-secondary btn-sm">Edit</button>
                <button @click="deleteLesson(lesson.id)" class="btn-icon btn-danger-icon">×</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Lesson Modal Overlay -->
    <div v-if="showLessonModal" class="modal-overlay" @click.self="closeLessonModal">
      <div class="modal card">
        <div class="modal-header">
          <h3>{{ editingLessonId ? 'Modify Lesson' : 'Add New Content' }}</h3>
          <button @click="closeLessonModal" class="close-btn">×</button>
        </div>
        <div class="form-group">
          <label>Lesson Title</label>
          <input v-model="lessonForm.title" placeholder="e.g., Introduction to the framework" autofocus />
        </div>
        <div class="form-group">
          <label>Sequential Order</label>
          <input type="number" v-model.number="lessonForm.order" :disabled="editingLessonId" />
        </div>
        <div class="modal-footer">
          <button @click="closeLessonModal" class="btn btn-secondary">Cancel</button>
          <button @click="saveLesson" :disabled="savingLesson" class="btn btn-primary">
            {{ savingLesson ? 'Saving...' : 'Confirm' }}
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

const showLessonModal = ref(false);
const editingLessonId = ref(null);
const savingLesson = ref(false);
const lessonForm = ref({ title: '', order: 1 });

const fetchCourse = async () => {
  if (isNew.value) return;
  try {
    const response = await apiClient.get(`/courses/${id}`);
    course.value = response.data;
    fetchLessons();
    fetchSummary();
  } catch (err) {
    console.error('Error fetching course:', err);
    router.push('/courses');
  }
};

const fetchSummary = async () => {
  try {
    const response = await apiClient.get(`/courses/${id}/summary`);
    courseSummary.value = response.data;
  } catch (err) {
    console.error('Error fetching summary:', err);
  }
};

const fetchLessons = async () => {
  lessonsLoading.value = true;
  try {
    const response = await apiClient.get(`/courses/${id}/lessons`, {
        params: { pageSize: 100 }
    });
    lessons.value = response.data.items.sort((a, b) => a.order - b.order);
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
    // Sending raw string as requested by the 400 fix
    const response = await apiClient.post('/courses', course.value.title);
    router.push(`/courses/${response.data.id}`);
  } catch (err) {
    console.error('Create error:', err);
    alert('Failed to initialize course. Please check if the title is unique or the server is responding.');
  } finally {
    saving.value = false;
  }
};

const saveCourseMeta = async () => {
  saving.value = true;
  try {
    await apiClient.put(`/courses/${id}`, { title: course.value.title });
    alert('Course core settings updated');
  } catch (err) {
    alert('Cloud sync failed for course settings.');
  } finally {
    saving.value = false;
  }
};

const publishCourse = async () => {
  try {
    await apiClient.post(`/courses/${id}/publish`);
    fetchCourse();
  } catch (err) {
    alert(err.response?.data?.message || 'Cannot publish empty curriculum.');
  }
};

const unpublishCourse = async () => {
  try {
    await apiClient.post(`/courses/${id}/unpublish`);
    fetchCourse();
  } catch (err) {
    alert('Failed to revert status.');
  }
};

const deleteCourse = async () => {
  if (!confirm('EXTREME CAUTION: This will delete everything. Proceed?')) return;
  try {
    await apiClient.delete(`/courses/${id}`);
    router.push('/courses');
  } catch (err) {
    alert('Destruction failed.');
  }
};

const openNewLessonModal = () => {
  editingLessonId.value = null;
  lessonForm.value = { title: '', order: lessons.value.length + 1 };
  showLessonModal.value = true;
};

const editLesson = (lesson) => {
  editingLessonId.value = lesson.id;
  lessonForm.value = { title: lesson.title, order: lesson.order };
  showLessonModal.value = true;
};

const closeLessonModal = () => {
  showLessonModal.value = false;
};

const saveLesson = async () => {
  if (!lessonForm.value.title) return alert('Title required');
  savingLesson.value = true;
  try {
    if (editingLessonId.value) {
      await apiClient.put(`/courses/${id}/lessons/${editingLessonId.value}`, lessonForm.value);
    } else {
      await apiClient.post(`/courses/${id}/lessons`, lessonForm.value);
    }
    closeLessonModal();
    fetchLessons();
    fetchSummary();
  } catch (err) {
    console.error('Save lesson error full response:', err.response?.data);
    if (err.response?.data) {
      const serverError = JSON.stringify(err.response.data, null, 2);
      alert('Server Error Details:\n' + serverError);
    } else {
      alert('Error saving lesson: ' + err.message);
    }
  } finally {
    savingLesson.value = false;
  }
};

const deleteLesson = async (lessonId) => {
  if (!confirm('Remove this unit?')) return;
  try {
    await apiClient.delete(`/courses/${id}/lessons/${lessonId}`);
    fetchLessons();
    fetchSummary();
  } catch (err) {
    alert('Action blocked.');
  }
};

const moveLesson = async (lesson, direction) => {
  const newOrder = direction === 'up' ? lesson.order - 1 : lesson.order + 1;
  if (newOrder < 1 || newOrder > lessons.value.length) return;
  
  try {
    await apiClient.put(`/courses/${id}/lessons/${lesson.id}/reorder`, newOrder);
    fetchLessons();
  } catch (err) {
    alert('Order update failed.');
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '---';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

onMounted(() => {
  fetchCourse();
});
</script>

<style scoped>
.course-edit-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 40px;
}

.btn-back {
  color: var(--text-light);
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 15px;
  display: block;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.editor-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 30px;
  align-items: start;
}

.section-desc {
  color: var(--text-light);
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.input-action-group {
  display: flex;
  gap: 10px;
}

.input-action-group input {
  flex: 1;
}

.metrics-dashboard {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid var(--border);
}

.metrics-dashboard h4 {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-light);
  margin-bottom: 15px;
  letter-spacing: 1px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.metric-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.metric-item .label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-light);
  margin-bottom: 5px;
}

.metric-item .value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--secondary);
}

.danger-zone {
  margin-top: 40px;
  padding-top: 25px;
  border-top: 1px dashed var(--danger);
}

.danger-zone h4 {
  color: var(--danger);
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-bottom: 15px;
  letter-spacing: 1px;
}

.btn-logout-outline {
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
}

.btn-logout-outline:hover {
  background: var(--danger);
  color: white;
}

.lessons-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.lesson-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 25px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.lesson-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.lesson-index {
  width: 32px;
  height: 32px;
  background: var(--secondary);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
}

.lesson-info {
  flex: 1;
}

.lesson-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.reorder-group {
  display: flex;
  gap: 5px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
}

.btn-icon:hover:not(:disabled) {
  background: #f1f3f5;
}

.btn-icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-danger-icon {
  color: var(--danger);
}

.empty-lessons {
  text-align: center;
  padding: 60px 20px;
}

.empty-art { font-size: 3rem; margin-bottom: 20px; }

.modal-overlay {
  background: rgba(44, 62, 80, 0.7);
  backdrop-filter: blur(4px);
  position: fixed;
  top:0; left:0; right:0; bottom:0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 450px;
  padding: 30px;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-light);
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.mt-20 { margin-top: 20px; }
.btn-block { width: 100%; }

.spinner-sm {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(66, 185, 131, 0.1);
  border-left-color: var(--primary);
  border-radius: 50%;
  animation: rotate 1s linear infinite;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-light);
  justify-content: center;
  padding: 40px;
}
</style>
